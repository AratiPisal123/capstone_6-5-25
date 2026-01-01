package com.pharma.user.exception;

import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;
import jakarta.ws.rs.NotFoundException;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.ext.ExceptionMapper;
import jakarta.ws.rs.ext.Provider;

import java.util.Map;

@Provider
public class GlobalExceptionHandler implements ExceptionMapper<Throwable> {

    @Override
    public Response toResponse(Throwable exception) {
        int status = Response.Status.INTERNAL_SERVER_ERROR.getStatusCode();

        if (exception instanceof BadRequestException) {
            status = Response.Status.BAD_REQUEST.getStatusCode();
        } else if (exception instanceof NotAuthorizedException) {
            status = Response.Status.UNAUTHORIZED.getStatusCode();
        } else if (exception instanceof NotFoundException || exception instanceof UserNotFoundException) {
            status = Response.Status.NOT_FOUND.getStatusCode();
        }

        String message = exception.getMessage() == null ? "Unexpected error" : exception.getMessage();
        return Response.status(status)
            .type(MediaType.APPLICATION_JSON)
            .entity(Map.of("message", message))
            .build();
    }
}
