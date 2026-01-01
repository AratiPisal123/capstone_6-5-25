package com.pharma.user.resource;

import com.pharma.user.entity.User;
import com.pharma.user.repository.UserRepository;
import com.pharma.user.service.PasswordService;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Form;

@Path("/api/admin")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AdminResource {

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordService passwordService;

    @POST
    @Path("/force-password-update")
    @Transactional
    public Response forcePasswordUpdate(Form form) {
        try {
            String email = form.asMap().getFirst("email");
            String newPassword = form.asMap().getFirst("newPassword");
            
            System.out.println("=== FORCE PASSWORD UPDATE ===");
            System.out.println("Email: " + email);
            System.out.println("New Password: " + newPassword);
            
            User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
            
            String oldPassword = user.getPassword();
            String hashedPassword = passwordService.hashPassword(newPassword);
            
            System.out.println("Old hash: " + oldPassword);
            System.out.println("New hash: " + hashedPassword);
            
            // Force update
            user.setPassword(hashedPassword);
            userRepository.persist(user);
            
            // Verify
            User updated = userRepository.findById(user.getId());
            boolean updatedSuccessfully = !updated.getPassword().equals(oldPassword);
            
            System.out.println("Update successful: " + updatedSuccessfully);
            System.out.println("=== END FORCE UPDATE ===");
            
            return Response.ok().entity(new Object() {
                public boolean success = updatedSuccessfully;
                public String message = updatedSuccessfully ? "Password updated successfully" : "Password update failed";
            }).build();
            
        } catch (Exception e) {
            System.err.println("Force update failed: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(new Object() {
                    public boolean success = false;
                    public String error = e.getMessage();
                }).build();
        }
    }
}
