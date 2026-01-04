package com.pharma.controller;

import com.pharma.entity.Category;
import com.pharma.repository.CategoryRepository;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import java.util.List;

@Path("/api/categories")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class CategoryController {
    
    @Inject
    CategoryRepository categoryRepository;
    
    @GET
    @Transactional
    public Response getAllCategories() {
        try {
            List<Category> categories = categoryRepository.findByIsActiveTrue();
            return Response.ok(categories).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Failed to fetch categories: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    @Transactional
    public Response getCategoryById(@PathParam("id") Long id) {
        try {
            Category category = Category.findById(id);
            if (category == null || !category.isActive) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(java.util.Map.of("error", "Category not found"))
                        .build();
            }
            return Response.ok(category).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Failed to fetch category: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/slug/{slug}")
    @Transactional
    public Response getCategoryBySlug(@PathParam("slug") String slug) {
        try {
            Category category = categoryRepository.findBySlug(slug);
            if (category == null || !category.isActive) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(java.util.Map.of("error", "Category not found"))
                        .build();
            }
            return Response.ok(category).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Failed to fetch category: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/root")
    @Transactional
    public Response getRootCategories() {
        try {
            List<Category> rootCategories = categoryRepository.findByParentId(null);
            return Response.ok(rootCategories).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Failed to fetch root categories: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}/subcategories")
    @Transactional
    public Response getSubCategories(@PathParam("id") Long parentId) {
        try {
            List<Category> subCategories = categoryRepository.findByParentId(parentId);
            return Response.ok(subCategories).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(java.util.Map.of("error", "Failed to fetch subcategories: " + e.getMessage()))
                    .build();
        }
    }
}
