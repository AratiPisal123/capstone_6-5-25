package com.pharma.user.service;

import com.pharma.user.entity.User;
import com.pharma.user.repository.UserRepository;
import io.smallrye.jwt.build.Jwt;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.json.JsonString;
import jakarta.transaction.Transactional;
import org.eclipse.microprofile.jwt.JsonWebToken;
import org.jboss.logging.Logger;

import java.time.Duration;
import java.util.Collections;
import java.util.HashSet;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

@ApplicationScoped
public class GoogleOAuthService {
    
    private static final Logger LOG = Logger.getLogger(GoogleOAuthService.class);
    
    @Inject
    UserRepository userRepository;
    
    @Inject
    PasswordService passwordService;
    
    @Transactional
    public String authenticateOrRegisterUserWithGoogleInfo(Map<String, Object> userInfo) {
        LOG.info("Processing Google OAuth authentication with user info");
        
        // Extract user info from Google token
        String email = (String) userInfo.get("email");
        String fullName = (String) userInfo.get("name");
        String googleId = (String) userInfo.get("googleId");
        String firstName = (String) userInfo.get("firstName");
        String lastName = (String) userInfo.get("lastName");
        
        LOG.infof("Google OAuth user - Email: %s, Name: %s, Google ID: %s", email, fullName, googleId);
        
        if (email == null || email.trim().isEmpty()) {
            throw new RuntimeException("Email is required from Google OAuth");
        }
        
        // Check if user exists by email
        Optional<User> existingUser = userRepository.findByEmail(email);
        
        User user;
        if (existingUser.isPresent()) {
            user = existingUser.get();
            LOG.infof("Found existing user: %s", user.getEmail());
            
            // Update Google ID and OAuth provider if not set
            boolean userUpdated = false;
            if (user.getGoogleId() == null) {
                user.setGoogleId(googleId);
                user.setOauthProvider("google");
                userUpdated = true;
                LOG.infof("Updated Google ID for existing user: %s", email);
            }
            
            // Only update name if current name is from email (placeholder) or empty
            if (user.getName() == null || user.getName().trim().isEmpty() || 
                user.getName().equals(email) || user.getName().contains("@")) {
                user.setName(fullName != null ? fullName : email);
                userUpdated = true;
                LOG.infof("Updated name for existing user from %s to %s", user.getName(), fullName);
            }
            
            if (userUpdated) {
                userRepository.persist(user);
                LOG.infof("Updated existing user profile: %s", email);
            }
            
            LOG.infof("Returning existing user profile: %s", user.getName());
        } else {
            // Create new user from Google OAuth with proper profile information
            user = new User();
            user.setEmail(email);
            
            // Set proper name from Google profile
            if (fullName != null && !fullName.trim().isEmpty()) {
                user.setName(fullName.trim());
            } else if (firstName != null && lastName != null) {
                user.setName((firstName.trim() + " " + lastName.trim()).trim());
            } else if (firstName != null) {
                user.setName(firstName.trim());
            } else {
                // Extract name from email as last resort
                String emailName = email.split("@")[0];
                user.setName(emailName.substring(0, 1).toUpperCase() + emailName.substring(1));
            }
            
            user.setGoogleId(googleId);
            user.setOauthProvider("google");
            user.setEmailVerified(true); // Google accounts are verified
            user.setIsActive(true);
            
            // Generate a random password for OAuth users (they won't use it)
            String randomPassword = "OAUTH_" + System.currentTimeMillis() + "_" + Math.random();
            user.setPassword(passwordService.hashPassword(randomPassword));
            
            // Set mobile number - for OAuth users, use a unique placeholder
            // In a real application, you might ask for this later
            user.setMobile("oauth_" + googleId); // Unique placeholder for OAuth users
            
            userRepository.persist(user);
            LOG.infof("Created new user from Google OAuth: %s with name: %s", email, user.getName());
        }
        
        // Generate JWT token
        return generateJwtToken(user);
    }
    
    private String extractClaim(JsonWebToken jwtToken, String claimName) {
        try {
            Object claim = jwtToken.getClaim(claimName);
            if (claim instanceof JsonString) {
                return ((JsonString) claim).getString();
            }
            return claim != null ? claim.toString() : null;
        } catch (Exception e) {
            LOG.warnf("Failed to extract claim %s: %s", claimName, e.getMessage());
            return null;
        }
    }
    
    private String generateJwtToken(User user) {
        LOG.infof("Generating JWT token for user: %s", user.getEmail());
        
        Set<String> roles = new HashSet<>();
        roles.add(user.getRole().name());

        return Jwt.issuer("https://pharma-ecommerce.com")
            .subject(user.getEmail())
            .claim("userId", user.getId())
            .claim("name", user.getName())
            .claim("email", user.getEmail())
            .claim("googleId", user.getGoogleId())
            .groups(roles)
            .expiresIn(Duration.ofDays(1))
            .sign();
    }
}
