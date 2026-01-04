package com.pharma.controller;

import com.pharma.entity.Brand;
import com.pharma.repository.BrandRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/brands")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class BrandController {
    
    @Inject
    BrandRepository brandRepository;
    
    @GET
    @Transactional
    public Response getAllBrands() {
        try {
            List<Brand> brands = brandRepository.findByIsActiveTrue();
            return Response.ok(brands).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Failed to fetch brands: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    @Transactional
    public Response getBrandById(@PathParam("id") Long id) {
        try {
            Brand brand = Brand.findById(id);
            if (brand == null || !brand.isActive) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(java.util.Map.of("error", "Brand not found"))
                        .build();
            }
            return Response.ok(brand).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Failed to fetch brand: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/root")
    @Transactional
    public Response getRootBrands() {
        try {
            List<Brand> rootBrands = brandRepository.findByIsActiveTrue();
            return Response.ok(rootBrands).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Failed to fetch root brands: " + e.getMessage()))
                    .build();
        }
    }
}
