package com.pharma.controller;

import com.pharma.entity.Cart;
import com.pharma.entity.CartItem;
import com.pharma.entity.Product;
import com.pharma.repository.CartRepository;
import com.pharma.repository.CartItemRepository;
import com.pharma.repository.ProductRepository;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.NotAuthorizedException;
import org.eclipse.microprofile.jwt.JsonWebToken;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Path("/api/cart")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class CartController {
    
    @Inject
    JsonWebToken jwt;
    
    @Inject
    CartRepository cartRepository;
    
    @Inject
    CartItemRepository cartItemRepository;
    
    @Inject
    ProductRepository productRepository;
    
    @GET
    @Path("/items")
    @Transactional
    public Response getCartItems() {
        try {
            Long userId = currentUserId();
            
            List<Cart> carts = cartRepository.findByUserId(userId);
            Cart cart = carts.stream()
                    .filter(c -> c.isActive())
                    .findFirst()
                    .orElse(null);
            
            if (cart == null) {
                return Response.ok(Map.of("items", List.of())).build();
            }
            
            List<CartItem> items = cartItemRepository.findByCartId(cart.id);
            List<Map<String, Object>> cartItemsWithDetails = items.stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.id);
                    itemMap.put("quantity", item.quantity);
                    itemMap.put("unitPriceSnapshot", item.unitPriceSnapshot);
                    itemMap.put("totalPrice", item.getTotalPrice());
                    itemMap.put("createdAt", item.createdAt);
                    itemMap.put("updatedAt", item.updatedAt);
                    
                    // Add product details
                    if (item.product != null) {
                        Map<String, Object> productMap = new HashMap<>();
                        productMap.put("id", item.product.id);
                        productMap.put("sku", item.product.sku);
                        productMap.put("name", item.product.name);
                        productMap.put("description", item.product.description);
                        productMap.put("prescriptionRequired", item.product.prescriptionRequired);
                        productMap.put("dosageForm", item.product.dosageForm);
                        productMap.put("strength", item.product.strength);
                        productMap.put("packSize", item.product.packSize);
                        productMap.put("isActive", item.product.isActive);
                        
                        // Get current price
                        productMap.put("currentPrice", item.product.getCurrentPrice());
                        productMap.put("mrp", item.product.getCurrentPrice()); // Using current price as MRP
                        
                        // Get primary image
                        try {
                            com.pharma.entity.ProductImage primaryImage = 
                                com.pharma.entity.ProductImage.findByProductIdAndIsPrimaryTrue(item.product.id);
                            if (primaryImage != null) {
                                productMap.put("imageUrl", primaryImage.url);
                                productMap.put("altText", primaryImage.altText);
                            }
                        } catch (Exception e) {
                            // Ignore image errors
                        }
                        
                        itemMap.put("product", productMap);
                    }
                    
                    return itemMap;
                })
                .collect(java.util.stream.Collectors.toList());
            
            return Response.ok(Map.of("items", cartItemsWithDetails, "cartId", cart.id)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch cart items: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/items")
    @Transactional
    public Response addToCart(CartItemRequest request) {
        try {
            Long userId = currentUserId();
            
            // Validate product exists
            Product product = Product.findById(request.productId);
            if (product == null || !product.isActive) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Product not found"))
                        .build();
            }
            
            // Find or create cart
            Cart cart = findOrCreateCart(userId, null);
            
            // Check if item already exists in cart
            Optional<CartItem> existingItemOpt = cartItemRepository.findByCartIdAndProductId(cart.id, request.productId);
            
            if (existingItemOpt.isPresent()) {
                CartItem existingItem = existingItemOpt.get();
                existingItem.quantity = request.quantity;
                existingItem.updatedAt = java.time.LocalDateTime.now();
                cartItemRepository.persist(existingItem);
            } else {
                CartItem newItem = new CartItem();
                newItem.cart = cart;
                newItem.product = product;
                newItem.quantity = request.quantity;
                newItem.unitPriceSnapshot = product.getCurrentPrice();
                cartItemRepository.persist(newItem);
            }
            
            return Response.ok(Map.of("message", "Item added to cart")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to add item to cart: " + e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/items/{itemId}")
    @Transactional
    public Response updateCartItem(@PathParam("itemId") Long itemId, CartItemRequest request) {
        try {
            CartItem item = CartItem.findById(itemId);
            if (item == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Cart item not found"))
                        .build();
            }
            
            item.quantity = request.quantity;
            cartItemRepository.persist(item);
            
            return Response.ok(Map.of("message", "Cart item updated")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to update cart item: " + e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/items/{itemId}")
    @Transactional
    public Response removeCartItem(@PathParam("itemId") Long itemId) {
        try {
            CartItem item = CartItem.findById(itemId);
            if (item == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Cart item not found"))
                        .build();
            }
            
            cartItemRepository.deleteById(itemId);
            return Response.ok(Map.of("message", "Item removed from cart")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to remove cart item: " + e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/clear")
    @Transactional
    public Response clearCart(@QueryParam("userId") Long userId, @QueryParam("sessionId") String sessionId) {
        try {
            Cart cart = findActiveCart(userId, sessionId);
            if (cart != null) {
                cartItemRepository.findByCartId(cart.id).forEach(item -> {
                    cartItemRepository.deleteById(item.id);
                });
            }
            
            return Response.ok(Map.of("message", "Cart cleared")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to clear cart: " + e.getMessage()))
                    .build();
        }
    }
    
    private Cart findOrCreateCart(Long userId, String sessionId) {
        Cart cart = findActiveCart(userId, sessionId);
        
        if (cart == null) {
            cart = new Cart();
            cart.userId = userId;
            cart.sessionId = sessionId;
            cart.status = Cart.CartStatus.ACTIVE;
            cartRepository.persist(cart);
        }
        
        return cart;
    }
    
    private Cart findActiveCart(Long userId, String sessionId) {
        if (userId != null) {
            List<Cart> carts = cartRepository.findByUserId(userId);
            return carts.stream()
                    .filter(c -> c.isActive())
                    .findFirst()
                    .orElse(null);
        } else if (sessionId != null) {
            return cartRepository.findBySessionId(sessionId).orElse(null);
        }
        return null;
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
    
    public static class CartItemRequest {
        public Long productId;
        public Integer quantity;
        public Long userId;
        public String sessionId;
    }
}
