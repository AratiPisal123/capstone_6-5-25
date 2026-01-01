package com.pharma.user.resource;

import com.pharma.user.dto.AddressDTO;
import com.pharma.user.entity.Address;
import com.pharma.user.service.AddressService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.validation.Valid;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import org.eclipse.microprofile.jwt.JsonWebToken;

import java.util.List;

@Path("/api/addresses")
@Consumes(MediaType.APPLICATION_JSON)
@Produces(MediaType.APPLICATION_JSON)
@Authenticated
public class AddressResource {

    @Inject
    JsonWebToken jwt;

    @Inject
    AddressService addressService;

    @GET
    public List<AddressDTO> list() {
        Long userId = currentUserId();
        return addressService.listByUser(userId).stream().map(addressService::toDTO).toList();
    }

    @POST
    public AddressDTO create(@Valid AddressDTO request) {
        return addressService.create(currentUserId(), request);
    }

    @PUT
    @Path("/{id}")
    public AddressDTO update(@PathParam("id") Long id, @Valid AddressDTO request) {
        return addressService.update(currentUserId(), id, request);
    }

    @DELETE
    @Path("/{id}")
    public void delete(@PathParam("id") Long id) {
        addressService.delete(currentUserId(), id);
    }

    @POST
    @Path("/{id}/default")
    public void setDefault(@PathParam("id") Long id) {
        addressService.setDefault(currentUserId(), id);
    }

    private Long currentUserId() {
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim == null) {
            throw new NotAuthorizedException("Missing userId claim");
        }
        if (userIdClaim instanceof Integer) {
            return ((Integer) userIdClaim).longValue();
        }
        if (userIdClaim instanceof Long) {
            return (Long) userIdClaim;
        }
        return Long.parseLong(userIdClaim.toString());
    }
}
