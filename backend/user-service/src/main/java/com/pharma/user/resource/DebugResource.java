package com.pharma.user.resource;

import com.pharma.user.dto.LoginRequest;
import com.pharma.user.service.AuthService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;

@Path("/api/debug")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class DebugResource {

    @Inject
    AuthService authService;

    @POST
    @Path("/login-bypass-email")
    public Object loginBypassEmail(@Valid LoginRequest request) {
        try {
            System.out.println("🔍 DEBUG: Attempting login bypassing email verification");
            return authService.loginBypassEmailVerification(request);
        } catch (Exception e) {
            System.out.println("🔍 DEBUG: Login failed with error: " + e.getMessage());
            return new Object() {
                public String error = e.getMessage();
                public String type = e.getClass().getSimpleName();
            };
        }
    }
}
