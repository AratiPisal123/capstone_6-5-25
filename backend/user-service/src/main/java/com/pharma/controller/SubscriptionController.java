package com.pharma.controller;

import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import io.quarkus.security.Authenticated;
import jakarta.transaction.Transactional;
import com.pharma.entity.Subscription;
import com.pharma.entity.Product;
import com.pharma.entity.SubscriptionStatus;
import com.pharma.entity.SubscriptionFrequency;
import com.pharma.repository.SubscriptionRepository;
import com.pharma.dto.SubscriptionDTO;
import com.pharma.dto.ProductDTO;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@Path("/api/subscriptions")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class SubscriptionController {
    
    @Inject
    JsonWebToken jwt;
    
    @Inject
    SubscriptionRepository subscriptionRepository;
    
    private Long getCurrentUserId() {
        // Try to get user ID from 'sub' claim first
        Object subClaim = jwt.getClaim("sub");
        if (subClaim != null) {
            try {
                // The 'sub' claim might be a number (JsonLongNumber) or string
                if (subClaim instanceof Number) {
                    return ((Number) subClaim).longValue();
                } else if (subClaim instanceof String) {
                    return Long.parseLong((String) subClaim);
                } else {
                    // Try to convert to string then parse
                    return Long.parseLong(subClaim.toString());
                }
            } catch (NumberFormatException e) {
                // If 'sub' is not a number, try other claims
                System.err.println("Failed to parse user ID from 'sub' claim: " + subClaim);
            }
        }
        
        // Try to get user ID from other possible claims
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim != null) {
            try {
                if (userIdClaim instanceof Number) {
                    return ((Number) userIdClaim).longValue();
                } else if (userIdClaim instanceof String) {
                    return Long.parseLong((String) userIdClaim);
                } else {
                    return Long.parseLong(userIdClaim.toString());
                }
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse user ID from 'userId' claim: " + userIdClaim);
            }
        }
        
        // Try to get user ID from 'id' claim
        Object idClaim = jwt.getClaim("id");
        if (idClaim != null) {
            try {
                if (idClaim instanceof Number) {
                    return ((Number) idClaim).longValue();
                } else if (idClaim instanceof String) {
                    return Long.parseLong((String) idClaim);
                } else {
                    return Long.parseLong(idClaim.toString());
                }
            } catch (NumberFormatException e) {
                System.err.println("Failed to parse user ID from 'id' claim: " + idClaim);
            }
        }
        
        // If no valid user ID found, throw an exception
        throw new RuntimeException("Unable to extract user ID from JWT token. Available claims: " + jwt.getClaimNames());
    }
    
    private SubscriptionDTO convertToDTO(Subscription subscription) {
        SubscriptionDTO dto = new SubscriptionDTO();
        dto.setId(subscription.getId());
        dto.setUserId(subscription.getUserId());
        dto.setQuantity(subscription.getQuantity());
        dto.setFrequency(subscription.getFrequency().toString());
        dto.setUnitPrice(subscription.getUnitPrice());
        dto.setDiscountPercentage(subscription.getDiscountPercentage());
        dto.setStartDate(subscription.getStartDate());
        dto.setEndDate(subscription.getEndDate());
        dto.setNextDeliveryDate(subscription.getNextDeliveryDate());
        dto.setLastDeliveryDate(subscription.getLastDeliveryDate());
        dto.setTotalDeliveries(subscription.getTotalDeliveries());
        dto.setRemainingDeliveries(subscription.getRemainingDeliveries());
        dto.setDeliveryAddress(subscription.getDeliveryAddress());
        dto.setSpecialInstructions(subscription.getSpecialInstructions());
        dto.setStatus(subscription.getStatus().toString());
        dto.setCreatedAt(subscription.getCreatedAt().toLocalDate());
        dto.setUpdatedAt(subscription.getUpdatedAt().toLocalDate());
        
        // Convert product to DTO
        if (subscription.getProduct() != null) {
            ProductDTO productDTO = new ProductDTO();
            productDTO.setId(subscription.getProduct().id);
            productDTO.setSku(subscription.getProduct().sku);
            productDTO.setName(subscription.getProduct().name);
            productDTO.setDescription(subscription.getProduct().description);
            productDTO.setCategoryId(subscription.getProduct().categoryId);
            productDTO.setBrandId(subscription.getProduct().brandId);
            productDTO.setPrescriptionRequired(subscription.getProduct().prescriptionRequired);
            productDTO.setDosageForm(subscription.getProduct().dosageForm.toString());
            productDTO.setStrength(subscription.getProduct().strength);
            productDTO.setPackSize(subscription.getProduct().packSize);
            productDTO.setGtin(subscription.getProduct().gtin);
            productDTO.setBarcode(subscription.getProduct().barcode);
            productDTO.setImageUrl(subscription.getProduct().imageUrl);
            productDTO.setIsActive(subscription.getProduct().isActive);
            productDTO.setCurrentPrice(subscription.getProduct().getCurrentPrice());
            dto.setProduct(productDTO);
        }
        
        return dto;
    }
    
    @GET
    public Response getUserSubscriptions() {
        try {
            Long userId = getCurrentUserId();
            List<Subscription> subscriptions = subscriptionRepository.findByUserId(userId);
            
            // Filter out cancelled subscriptions
            List<Subscription> activeSubscriptions = subscriptions.stream()
                    .filter(sub -> sub.getStatus() != SubscriptionStatus.CANCELLED)
                    .collect(java.util.stream.Collectors.toList());
            
            // Convert to DTOs to avoid lazy loading issues
            List<SubscriptionDTO> subscriptionDTOs = activeSubscriptions.stream()
                    .map(this::convertToDTO)
                    .collect(java.util.stream.Collectors.toList());
            
            return Response.ok(subscriptionDTOs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch subscriptions"))
                    .build();
        }
    }
    
    @POST
    @Transactional
    public Response createSubscription(SubscriptionRequest request) {
        try {
            Long userId = getCurrentUserId();
            
            // Validate product exists
            Product product = Product.findById(request.getProductId());
            if (product == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Product not found"))
                        .build();
            }
            
            // Check if user already has an active subscription for this product
            List<Subscription> existingSubscriptions = subscriptionRepository.findByUserIdAndProductIdAndStatus(
                userId, request.getProductId(), SubscriptionStatus.ACTIVE);
            
            if (!existingSubscriptions.isEmpty()) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Active subscription already exists for this product"))
                        .build();
            }
            
            // Create new subscription
            Subscription subscription = new Subscription();
            subscription.setUserId(userId);
            subscription.setProduct(product);
            subscription.setQuantity(request.getQuantity());
            subscription.setFrequency(SubscriptionFrequency.valueOf(request.getFrequency().toUpperCase()));
            subscription.setUnitPrice(product.getCurrentPrice());
            subscription.setNextDeliveryDate(request.getNextDeliveryDate());
            subscription.setDeliveryAddress(request.getDeliveryAddress());
            subscription.setSpecialInstructions(request.getSpecialInstructions());
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setRemainingDeliveries(request.getRemainingDeliveries());
            
            // Calculate next delivery date based on frequency
            subscription.calculateNextDeliveryDate();
            
            System.out.println("=== Attempting to persist subscription ===");
            System.out.println("User ID: " + subscription.getUserId());
            System.out.println("Product ID: " + subscription.getProduct().id);
            System.out.println("Quantity: " + subscription.getQuantity());
            System.out.println("Frequency: " + subscription.getFrequency());
            System.out.println("Unit Price: " + subscription.getUnitPrice());
            System.out.println("Next Delivery Date: " + subscription.getNextDeliveryDate());
            System.out.println("Status: " + subscription.getStatus());
            
            // Manually handle the transaction
            subscriptionRepository.persist(subscription);
            
            System.out.println("=== Subscription persisted successfully ===");
            
            return Response.status(Response.Status.CREATED)
                    .entity(convertToDTO(subscription))
                    .build();
                    
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to create subscription: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    public Response getSubscription(@PathParam("id") Long id) {
        try {
            Long userId = getCurrentUserId();
            Subscription subscription = subscriptionRepository.findById(id);
            
            if (subscription == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Subscription not found"))
                        .build();
            }
            
            // Ensure user can only access their own subscriptions
            if (!subscription.getUserId().equals(userId)) {
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "Access denied"))
                        .build();
            }
            
            return Response.ok(subscription).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch subscription"))
                    .build();
        }
    }
    
    @PUT
    @Path("/{id}")
    @Transactional
    public Response updateSubscription(@PathParam("id") Long id, SubscriptionRequest request) {
        try {
            Long userId = getCurrentUserId();
            Subscription subscription = subscriptionRepository.findById(id);
            
            if (subscription == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Subscription not found"))
                        .build();
            }
            
            // Ensure user can only update their own subscriptions
            if (!subscription.getUserId().equals(userId)) {
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "Access denied"))
                        .build();
            }
            
            // Update subscription fields
            if (request.getQuantity() != null) {
                subscription.setQuantity(request.getQuantity());
            }
            if (request.getFrequency() != null) {
                subscription.setFrequency(SubscriptionFrequency.valueOf(request.getFrequency().toUpperCase()));
            }
            if (request.getDeliveryAddress() != null) {
                subscription.setDeliveryAddress(request.getDeliveryAddress());
            }
            if (request.getSpecialInstructions() != null) {
                subscription.setSpecialInstructions(request.getSpecialInstructions());
            }
            if (request.getNextDeliveryDate() != null) {
                subscription.setNextDeliveryDate(request.getNextDeliveryDate());
            }
            if (request.getRemainingDeliveries() != null) {
                subscription.setRemainingDeliveries(request.getRemainingDeliveries());
            }
            
            return Response.ok(subscription).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to update subscription"))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/pause")
    @Transactional
    public Response pauseSubscription(@PathParam("id") Long id) {
        try {
            Long userId = getCurrentUserId();
            Subscription subscription = subscriptionRepository.findById(id);
            
            if (subscription == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Subscription not found"))
                        .build();
            }
            
            if (!subscription.getUserId().equals(userId)) {
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "Access denied"))
                        .build();
            }
            
            if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Only active subscriptions can be paused"))
                        .build();
            }
            
            subscription.setStatus(SubscriptionStatus.PAUSED);
            subscription.setPausedAt(LocalDateTime.now());
            
            return Response.ok(Map.of("message", "Subscription paused successfully")).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to pause subscription"))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/resume")
    @Transactional
    public Response resumeSubscription(@PathParam("id") Long id) {
        try {
            Long userId = getCurrentUserId();
            Subscription subscription = subscriptionRepository.findById(id);
            
            if (subscription == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Subscription not found"))
                        .build();
            }
            
            if (!subscription.getUserId().equals(userId)) {
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "Access denied"))
                        .build();
            }
            
            if (subscription.getStatus() != SubscriptionStatus.PAUSED) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Only paused subscriptions can be resumed"))
                        .build();
            }
            
            subscription.setStatus(SubscriptionStatus.ACTIVE);
            subscription.setPausedAt(null);
            
            return Response.ok(Map.of("message", "Subscription resumed successfully")).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to resume subscription"))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/skip")
    @Transactional
    public Response skipNextDelivery(@PathParam("id") Long id) {
        try {
            Long userId = getCurrentUserId();
            Subscription subscription = subscriptionRepository.findById(id);
            
            if (subscription == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Subscription not found"))
                        .build();
            }
            
            if (!subscription.getUserId().equals(userId)) {
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "You can only skip your own subscriptions"))
                        .build();
            }
            
            if (subscription.getStatus() != SubscriptionStatus.ACTIVE) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Only active subscriptions can be skipped"))
                        .build();
            }
            
            // Calculate next delivery date by adding one frequency period
            LocalDate nextDelivery = subscription.getNextDeliveryDate();
            switch (subscription.getFrequency()) {
                case WEEKLY:
                    nextDelivery = nextDelivery.plusWeeks(1);
                    break;
                case BIWEEKLY:
                    nextDelivery = nextDelivery.plusWeeks(2);
                    break;
                case MONTHLY:
                    nextDelivery = nextDelivery.plusMonths(1);
                    break;
                case BIMONTHLY:
                    nextDelivery = nextDelivery.plusMonths(2);
                    break;
                case QUARTERLY:
                    nextDelivery = nextDelivery.plusMonths(3);
                    break;
            }
            
            subscription.setNextDeliveryDate(nextDelivery);
            subscription.setLastDeliveryDate(LocalDate.now());
            
            return Response.ok(Map.of("message", "Next delivery skipped successfully")).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to skip next delivery"))
                    .build();
        }
    }
    
    @POST
    @Path("/{id}/cancel")
    @Transactional
    public Response cancelSubscription(@PathParam("id") Long id) {
        try {
            Long userId = getCurrentUserId();
            Subscription subscription = subscriptionRepository.findById(id);
            
            if (subscription == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Subscription not found"))
                        .build();
            }
            
            if (!subscription.getUserId().equals(userId)) {
                return Response.status(Response.Status.FORBIDDEN)
                        .entity(Map.of("error", "Access denied"))
                        .build();
            }
            
            if (subscription.getStatus() == SubscriptionStatus.CANCELLED) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Subscription is already cancelled"))
                        .build();
            }
            
            subscription.setStatus(SubscriptionStatus.CANCELLED);
            subscription.setCancelledAt(LocalDateTime.now());
            subscription.setCancellationReason("Cancelled by user");
            
            return Response.ok(Map.of("message", "Subscription cancelled successfully")).build();
            
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to cancel subscription: " + e.getMessage()))
                    .build();
        }
    }
    
    // Request DTO for subscription creation/update
    public static class SubscriptionRequest {
        private Long productId;
        private Integer quantity;
        private String frequency;
        private String deliveryAddress;
        private String specialInstructions;
        private java.time.LocalDate nextDeliveryDate;
        private Integer remainingDeliveries;
        
        // Getters and Setters
        public Long getProductId() { return productId; }
        public void setProductId(Long productId) { this.productId = productId; }
        
        public Integer getQuantity() { return quantity; }
        public void setQuantity(Integer quantity) { this.quantity = quantity; }
        
        public String getFrequency() { return frequency; }
        public void setFrequency(String frequency) { this.frequency = frequency; }
        
        public String getDeliveryAddress() { return deliveryAddress; }
        public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
        
        public String getSpecialInstructions() { return specialInstructions; }
        public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
        
        public java.time.LocalDate getNextDeliveryDate() { return nextDeliveryDate; }
        public void setNextDeliveryDate(java.time.LocalDate nextDeliveryDate) { this.nextDeliveryDate = nextDeliveryDate; }
        
        public Integer getRemainingDeliveries() { return remainingDeliveries; }
        public void setRemainingDeliveries(Integer remainingDeliveries) { this.remainingDeliveries = remainingDeliveries; }
    }
}
