package com.pharma.user.resource;

import com.pharma.user.dto.EmailVerificationRequest;
import com.pharma.user.dto.SendVerificationRequest;
import com.pharma.user.service.EmailVerificationService;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

@Path("/api/email-verification")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
public class EmailVerificationResource {

    @Inject
    EmailVerificationService emailVerificationService;

    @POST
    @Path("/send")
    public Response sendVerificationCode(@Valid SendVerificationRequest request) {
        try {
            emailVerificationService.sendVerificationCode(request);
            return Response.ok("{\"message\": \"Verification code sent to your email\"}").build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity("{\"error\": \"Failed to send verification code\"}")
                    .build();
        }
    }

    @POST
    @Path("/verify")
    public Response verifyEmail(@Valid EmailVerificationRequest request) {
        try {
            boolean isVerified = emailVerificationService.verifyEmail(request);
            if (isVerified) {
                return Response.ok("{\"message\": \"Email verified successfully\"}").build();
            } else {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity("{\"error\": \"Invalid or expired verification code\"}")
                        .build();
            }
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity("{\"error\": \"Verification failed\"}")
                    .build();
        }
    }
}
