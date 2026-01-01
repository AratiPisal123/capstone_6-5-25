package com.pharma.user.resource;

import com.pharma.user.dto.UserDTO;
import com.pharma.user.entity.User;
import com.pharma.user.service.UserService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/api/user")
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class UserResource {

    @Inject
    JsonWebToken jwt;

    @Inject
    UserService userService;

    @GET
    public UserDTO me() {
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim == null) {
            // fallback: some tokens might not include numeric claim; in that case just fail
            throw new jakarta.ws.rs.NotAuthorizedException("Missing userId claim");
        }

        Long userId;
        if (userIdClaim instanceof Integer) {
            userId = ((Integer) userIdClaim).longValue();
        } else if (userIdClaim instanceof Long) {
            userId = (Long) userIdClaim;
        } else {
            userId = Long.parseLong(userIdClaim.toString());
        }

        User user = userService.getById(userId);
        return userService.toDTO(user);
    }

    @PUT
    @Path("/profile")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateProfile(UserDTO updateData) {
        try {
            System.out.println("Received profile update request: " + updateData);
            
            Object userIdClaim = jwt.getClaim("userId");
            if (userIdClaim == null) {
                throw new jakarta.ws.rs.NotAuthorizedException("Missing userId claim");
            }

            Long userId;
            if (userIdClaim instanceof Integer) {
                userId = ((Integer) userIdClaim).longValue();
            } else if (userIdClaim instanceof Long) {
                userId = (Long) userIdClaim;
            } else {
                userId = Long.parseLong(userIdClaim.toString());
            }

            System.out.println("Updating user ID: " + userId);
            User user = userService.getById(userId);
            
            // Update user fields
            if (updateData.getName() != null) {
                user.setName(updateData.getName());
                System.out.println("Updated name to: " + updateData.getName());
            }
            if (updateData.getMobile() != null) {
                user.setMobile(updateData.getMobile());
                System.out.println("Updated mobile to: " + updateData.getMobile());
            }
            if (updateData.getProfileImage() != null) {
                user.setProfileImage(updateData.getProfileImage());
                System.out.println("Updated profile image to: " + updateData.getProfileImage());
            }
            
            userService.update(user);
            System.out.println("User updated successfully");
            
            return Response.ok(userService.toDTO(user)).build();
        } catch (Exception e) {
            System.err.println("Error updating profile: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(java.util.Map.of("error", "Failed to update profile: " + e.getMessage()))
                .build();
        }
    }

    @POST
    @Path("/profile-picture-url")
    @Consumes(MediaType.APPLICATION_JSON)
    public Response updateProfilePictureUrl(java.util.Map<String, String> request) {
        try {
            String imageUrl = request.get("imageUrl");
            System.out.println("Received profile picture URL update");
            System.out.println("Image URL length: " + (imageUrl != null ? imageUrl.length() : "null"));
            System.out.println("Image URL prefix: " + (imageUrl != null && imageUrl.length() > 50 ? imageUrl.substring(0, 50) + "..." : imageUrl));
            
            if (imageUrl == null || imageUrl.trim().isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                    .entity(java.util.Map.of("error", "Image URL is required"))
                    .build();
            }
            
            Object userIdClaim = jwt.getClaim("userId");
            if (userIdClaim == null) {
                throw new jakarta.ws.rs.NotAuthorizedException("Missing userId claim");
            }

            Long userId;
            if (userIdClaim instanceof Integer) {
                userId = ((Integer) userIdClaim).longValue();
            } else if (userIdClaim instanceof Long) {
                userId = (Long) userIdClaim;
            } else {
                userId = Long.parseLong(userIdClaim.toString());
            }

            System.out.println("Updating profile picture for user ID: " + userId);
            User user = userService.getById(userId);
            
            // Store the image URL (could be base64 data or external URL)
            user.setProfileImage(imageUrl);
            
            userService.update(user);
            System.out.println("Profile picture updated successfully in database");
            
            return Response.ok(java.util.Map.of(
                "message", "Profile picture updated successfully",
                "profileImage", imageUrl.substring(0, Math.min(100, imageUrl.length())) + "..."
            )).build();
        } catch (Exception e) {
            System.err.println("Error updating profile picture: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(java.util.Map.of("error", "Failed to update profile picture: " + e.getMessage()))
                .build();
        }
    }
}
