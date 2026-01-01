package com.pharma.user.resource;

import com.pharma.user.dto.AuthResponse;
import com.pharma.user.dto.ForgotPasswordRequest;
import com.pharma.user.dto.LoginRequest;
import com.pharma.user.dto.RegisterRequest;
import com.pharma.user.service.AuthService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class AuthResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/signup")
    public AuthResponse signup(@Valid RegisterRequest request) {
        return authService.register(request);
    }

    @POST
    @Path("/login")
    public AuthResponse login(@Valid LoginRequest request) {
        return authService.login(request);
    }

    @POST
    @Path("/forgot-password")
    public Response forgotPassword(@Valid ForgotPasswordRequest request) {
        try {
            authService.sendPasswordResetEmail(request.getEmail());
            return Response.ok("{\"message\": \"Password reset link sent to your email\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Failed to send password reset email\"}")
                    .build();
        }
    }
}
