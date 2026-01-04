package com.pharma.user.resource;

import com.pharma.user.entity.User;
import com.pharma.user.repository.UserRepository;
import com.pharma.user.service.GoogleOAuthService;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.*;
import jakarta.json.Json;
import jakarta.json.JsonObject;
import jakarta.json.JsonReader;
import org.jboss.logging.Logger;

import java.io.StringReader;
import java.net.URI;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;
import java.util.Map;

@Path("/api/auth/google")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class GoogleOAuthResource {
    
    private static final Logger LOG = Logger.getLogger(GoogleOAuthResource.class);
    
    @Inject
    GoogleOAuthService googleOAuthService;
    
    @Inject
    UserRepository userRepository;
    
    @Context
    UriInfo uriInfo;
    
    // Google One Tap token endpoint
    @POST
    @Path("/auth")
    public Response googleLogin(TokenRequest request) {
        LOG.info("=== GOOGLE OAUTH REQUEST STARTED (NEW CODE) ===");
        try {
            LOG.infof("Received Google ID token for authentication");
            LOG.infof("Token request received - token length: %d", 
                request != null && request.getToken() != null ? request.getToken().length() : 0);
            
            if (request == null || request.getToken() == null || request.getToken().trim().isEmpty()) {
                LOG.error("No token provided in request");
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "No token provided"))
                    .build();
            }
            
            // For now, we'll extract user info from the token without verification
            // In production, you should verify the token signature
            String token = request.getToken();
            LOG.infof("Raw Google token (first 50 chars): %s...", token.length() > 50 ? token.substring(0, 50) : token);
            Map<String, Object> userInfo = extractUserInfoFromToken(token);
            
            // Validate required fields from Google token
            String email = (String) userInfo.get("email");
            LOG.infof("Extracted email from token: '%s'", email);
            if (email == null || email.trim().isEmpty()) {
                LOG.error("Email not found or empty in Google token. Full user info: " + userInfo);
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "Email is required but not provided by Google. Please ensure Google One Tap is configured correctly."))
                    .build();
            }
            
            // Create or update user using the Google OAuth service
            String appToken = googleOAuthService.authenticateOrRegisterUserWithGoogleInfo(userInfo);
            
            // Get the complete user profile from the service
            User completeUser = userRepository.findByEmail((String) userInfo.get("email")).orElse(null);
            
            Map<String, Object> response = new HashMap<>();
            response.put("message", "Google authentication successful");
            response.put("token", appToken);
            
            // Include complete user profile in response
            if (completeUser != null) {
                Map<String, Object> userProfile = new HashMap<>();
                userProfile.put("id", completeUser.getId());
                userProfile.put("email", completeUser.getEmail());
                userProfile.put("name", completeUser.getName());
                userProfile.put("mobile", completeUser.getMobile());
                userProfile.put("googleId", completeUser.getGoogleId());
                userProfile.put("oauthProvider", completeUser.getOauthProvider());
                userProfile.put("emailVerified", completeUser.getEmailVerified());
                userProfile.put("isActive", completeUser.getIsActive());
                userProfile.put("createdAt", completeUser.getCreatedAt());
                userProfile.put("isNewUser", completeUser.getGoogleId() != null && completeUser.getOauthProvider() != null && 
                    completeUser.getCreatedAt() != null && 
                    (System.currentTimeMillis() - completeUser.getCreatedAt().atZone(java.time.ZoneId.systemDefault()).toInstant().toEpochMilli()) < 60000); // Created within last minute
                
                response.put("user", userProfile);
                LOG.infof("Returning complete user profile: %s", userProfile);
            } else {
                response.put("user", userInfo);
            }
            
            response.put("status", "success");
            
            LOG.infof("Google authentication processed successfully for user: %s", userInfo.get("email"));
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            LOG.errorf("Error processing Google authentication: %s", e.getMessage());
            LOG.errorf("Full error details: %s", e.toString());
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(Map.of("error", "Google authentication failed: " + e.getMessage()))
                .build();
        }
    }
    
    // Temporary method to extract user info from Google ID token
    // In production, use Google ID Token Verifier
    private Map<String, Object> extractUserInfoFromToken(String token) {
        try {
            // Split token parts and decode payload
            String[] parts = token.split("\\.");
            if (parts.length < 2) {
                throw new RuntimeException("Invalid token format");
            }
            
            // Decode payload (base64url)
            String payload = parts[1];
            // Add padding if needed
            while (payload.length() % 4 != 0) {
                payload += "=";
            }
            
            byte[] decodedBytes = java.util.Base64.getUrlDecoder().decode(payload);
            String payloadJson = new String(decodedBytes);
            
            LOG.infof("Decoded Google token payload: %s", payloadJson);

            Map<String, Object> userInfo = new HashMap<>();
            try (JsonReader reader = Json.createReader(new StringReader(payloadJson))) {
                JsonObject obj = reader.readObject();

                if (obj.containsKey("email")) {
                    userInfo.put("email", obj.getString("email", null));
                }
                if (obj.containsKey("name")) {
                    userInfo.put("name", obj.getString("name", null));
                }
                if (obj.containsKey("given_name")) {
                    userInfo.put("firstName", obj.getString("given_name", null));
                }
                if (obj.containsKey("family_name")) {
                    userInfo.put("lastName", obj.getString("family_name", null));
                }
                if (obj.containsKey("sub")) {
                    userInfo.put("googleId", obj.getString("sub", null));
                }
                if (obj.containsKey("picture")) {
                    userInfo.put("picture", obj.getString("picture", null));
                }
                if (obj.containsKey("email_verified")) {
                    try {
                        userInfo.put("emailVerified", obj.getBoolean("email_verified"));
                    } catch (Exception ignored) {
                        userInfo.put("emailVerified", obj.get("email_verified").toString());
                    }
                }
            }
            
            LOG.infof("Extracted user info: %s", userInfo);
            return userInfo;
            
        } catch (Exception e) {
            LOG.errorf("Error extracting user info from token: %s", e.getMessage());
            throw new RuntimeException("Failed to extract user info from token");
        }
    }
    
    // Helper method to extract JSON values safely
    private String extractJsonValue(String json, String key) {
        try {
            String searchPattern = "\"" + key + "\":\"";
            int startIndex = json.indexOf(searchPattern);
            if (startIndex == -1) return null;
            
            startIndex += searchPattern.length();
            int endIndex = json.indexOf("\"", startIndex);
            if (endIndex == -1) return null;
            
            return json.substring(startIndex, endIndex);
        } catch (Exception e) {
            LOG.warnf("Failed to extract %s from JSON: %s", key, e.getMessage());
            return null;
        }
    }
    
    // Legacy OAuth flow endpoints (keep for backward compatibility)
    @GET
    @Path("/login")
    @Produces(MediaType.TEXT_PLAIN)
    public Response googleLogin() {
        LOG.info("Initiating Google OAuth login");
        
        String redirectUri = uriInfo.getBaseUriBuilder()
            .scheme("http")
            .path("/api/auth/google/callback")
            .build()
            .toString();
        
        String googleAuthUrl = String.format(
            "https://accounts.google.com/o/oauth2/v2/auth?" +
            "client_id=%s&" +
            "redirect_uri=%s&" +
            "response_type=code&" +
            "scope=email%20profile%20openid&" +
            "access_type=offline",
            "376155289432-sibodjmekgb7373d0gnk1esnqmrq4btm.apps.googleusercontent.com",
            URLEncoder.encode(redirectUri, StandardCharsets.UTF_8)
        );
        
        LOG.infof("Redirecting to Google OAuth: %s", googleAuthUrl);
        return Response.ok(googleAuthUrl).build();
    }
    
    @GET
    @Path("/callback")
    public Response googleCallback(@QueryParam("code") String code,
                                  @QueryParam("error") String error,
                                  @QueryParam("error_description") String errorDescription) {
        LOG.infof("Google OAuth callback - Code: %s, Error: %s", code, error);
        
        if (error != null) {
            LOG.errorf("Google OAuth error: %s - %s", error, errorDescription);
            return Response.seeOther(URI.create("http://localhost:3001/login?error=" + 
                URLEncoder.encode(errorDescription != null ? errorDescription : error, StandardCharsets.UTF_8)))
                .build();
        }
        
        if (code == null || code.trim().isEmpty()) {
            LOG.error("No authorization code received from Google");
            return Response.seeOther(URI.create("http://localhost:3001/login?error=no_code"))
                .build();
        }
        
        try {
            // For now, redirect to frontend with the authorization code
            // The frontend will handle token exchange
            String frontendUrl = "http://localhost:3001/auth/callback?code=" + 
                URLEncoder.encode(code, StandardCharsets.UTF_8);
            
            LOG.infof("Redirecting to frontend with authorization code: %s", frontendUrl);
            return Response.seeOther(URI.create(frontendUrl)).build();
            
        } catch (Exception e) {
            LOG.errorf("Error processing Google OAuth: %s", e.getMessage());
            return Response.seeOther(URI.create("http://localhost:3001/login?error=processing_failed"))
                .build();
        }
    }
    
    @POST
    @Path("/exchange")
    @Consumes(MediaType.APPLICATION_FORM_URLENCODED)
    public Response exchangeCodeForToken(@FormParam("code") String code) {
        try {
            LOG.infof("Exchanging authorization code for token: %s", code);
            
            // This would normally exchange the code with Google for tokens
            // For now, we'll create a mock response
            Map<String, Object> response = new HashMap<>();
            response.put("message", "OAuth flow initiated successfully");
            response.put("code", code);
            response.put("status", "success");
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            LOG.errorf("Error exchanging code for token: %s", e.getMessage());
            return Response.status(Response.Status.UNAUTHORIZED)
                .entity(Map.of("error", "Token exchange failed: " + e.getMessage()))
                .build();
        }
    }
    
    // Request DTO for Google ID token
    public static class TokenRequest {
        private String token;
        
        public String getToken() {
            return token;
        }
        
        public void setToken(String token) {
            this.token = token;
        }
    }
}
