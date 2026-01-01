package com.pharma.user.resource;

import com.pharma.user.dto.ForgotPasswordRequest;
import com.pharma.user.dto.ResetPasswordRequest;
import com.pharma.user.service.PasswordResetService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/password-reset")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class PasswordResetResource {

    @Inject
    PasswordResetService passwordResetService;

    @POST
    @Path("/forgot")
    public Response forgotPassword(@Valid ForgotPasswordRequest request) {
        try {
            passwordResetService.sendPasswordResetEmail(request);
            return Response.ok("{\"message\": \"If your email is registered, you will receive a password reset link\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Failed to send password reset email\"}")
                    .build();
        }
    }

    @POST
    @Path("/reset")
    public Response resetPassword(@Valid ResetPasswordRequest request) {
        try {
            boolean success = passwordResetService.resetPassword(request);
            if (success) {
                return Response.ok("{\"message\": \"Password reset successfully\"}").build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Invalid or expired reset token\"}")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Password reset failed\"}")
                    .build();
        }
    }
}
