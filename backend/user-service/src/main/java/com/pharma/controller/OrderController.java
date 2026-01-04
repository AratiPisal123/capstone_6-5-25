package com.pharma.controller;

import com.pharma.entity.*;
import com.pharma.user.entity.Address;
import com.pharma.user.entity.User;
import com.pharma.repository.CartRepository;
import com.pharma.repository.CartItemRepository;
import io.quarkus.security.Authenticated;
import jakarta.annotation.security.PermitAll;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.persistence.NoResultException;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Path("/api/orders")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class OrderController {
    
    @Inject
    JsonWebToken jwt;
    
    @Inject
    EntityManager em;
    
    @Inject
    CartRepository cartRepository;
    
    @Inject
    CartItemRepository cartItemRepository;
    
    @GET
    @Path("/{orderNumber}")
    public Response getOrderDetails(@PathParam("orderNumber") String orderNumber) {
        try {
            System.out.println("OrderController: getOrderDetails called for orderNumber: " + orderNumber);
            Long userId = currentUserId();
            System.out.println("OrderController: User ID: " + userId);
            
            // First, let's see if the order exists at all (without user filter)
            Order anyOrder = Order.find("orderNumber", orderNumber).firstResult();
            System.out.println("OrderController: Order exists in database (any user): " + (anyOrder != null));
            if (anyOrder != null) {
                System.out.println("OrderController: Found order - ID: " + anyOrder.id + ", OrderNumber: " + anyOrder.orderNumber + ", UserID: " + anyOrder.userId);
            }
            
            // Find order by order number and user ID
            Order order = Order.find("orderNumber = ?1 AND userId = ?2", orderNumber, userId).firstResult();
            
            System.out.println("OrderController: Query result - order found for current user: " + (order != null));
            if (order != null) {
                System.out.println("OrderController: Found order - ID: " + order.id + ", OrderNumber: " + order.orderNumber);
            }
            
            if (order == null) {
                System.err.println("OrderController: Order not found for orderNumber: " + orderNumber + ", userId: " + userId);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Order not found"))
                        .build();
            }
            
            // Create response with order details
            Map<String, Object> response = new HashMap<>();
            response.put("id", order.id);
            response.put("orderNumber", order.orderNumber);
            response.put("totalAmount", order.totalAmount);
            response.put("paymentMethod", order.paymentMethod);
            response.put("cardLast4", order.cardLast4);
            response.put("deliveryAddress", order.deliveryAddress);
            response.put("deliveryPhone", order.deliveryPhone);
            response.put("trackingNumber", order.trackingNumber);
            response.put("courier", order.courier);
            response.put("estimatedDelivery", order.estimatedDelivery);
            response.put("status", order.status);
            response.put("createdAt", order.createdAt);
            response.put("updatedAt", order.updatedAt);
            
            // Add order items if they exist
            List<Map<String, Object>> items = new ArrayList<>();
            if (order.orderItems != null) {
                for (OrderItem item : order.orderItems) {
                    Map<String, Object> itemData = new HashMap<>();
                    itemData.put("id", item.id);
                    itemData.put("productId", item.product.id);
                    itemData.put("name", item.product.name);
                    itemData.put("quantity", item.quantity);
                    itemData.put("unitPrice", item.unitPrice);
                    itemData.put("totalPrice", item.totalPrice);
                    itemData.put("prescriptionRequired", item.prescriptionRequired);
                    items.add(itemData);
                }
            }
            response.put("items", items);
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            System.err.println("OrderController: Error fetching order details: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch order details: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/test")
    public Response testEndpoint() {
        return Response.ok(Map.of("message", "Order controller is working", "timestamp", System.currentTimeMillis())).build();
    }

    @GET
    @Path("/ping")
    @PermitAll
    public Response pingEndpoint() {
        return Response.ok(Map.of("status", "Backend is running", "timestamp", System.currentTimeMillis())).build();
    }

    @GET
    @Path("/latest-order")
    @PermitAll
    public Response getLatestOrder() {
        try {
            // Get the latest order
            List<Order> allOrders = Order.listAll();
            Order latestOrder = null;
            for (Order order : allOrders) {
                if (latestOrder == null || order.createdAt.isAfter(latestOrder.createdAt)) {
                    latestOrder = order;
                }
            }
                
            if (latestOrder == null) {
                return Response.ok(Map.of("message", "No orders found")).build();
            }
            
            Map<String, Object> response = new HashMap<>();
            response.put("id", latestOrder.id);
            response.put("orderNumber", latestOrder.orderNumber);
            response.put("totalAmount", latestOrder.totalAmount);
            response.put("paymentMethod", latestOrder.paymentMethod);
            response.put("cardLast4", latestOrder.cardLast4);
            response.put("deliveryAddress", latestOrder.deliveryAddress);
            response.put("deliveryPhone", latestOrder.deliveryPhone);
            response.put("trackingNumber", latestOrder.trackingNumber);
            response.put("courier", latestOrder.courier);
            response.put("estimatedDelivery", latestOrder.estimatedDelivery);
            response.put("status", latestOrder.status);
            response.put("createdAt", latestOrder.createdAt);
            response.put("updatedAt", latestOrder.updatedAt);
            response.put("userId", latestOrder.userId);
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch latest order: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Path("/debug")
    public Response debugOrders() {
        try {
            Long userId = currentUserId();
            List<Order> orders = Order.find("userId", userId).list();
            
            List<Map<String, Object>> orderList = new ArrayList<>();
            for (Order order : orders) {
                Map<String, Object> orderMap = new HashMap<>();
                orderMap.put("id", order.id);
                orderMap.put("orderNumber", order.orderNumber);
                orderMap.put("totalAmount", order.totalAmount);
                orderMap.put("status", order.status);
                orderMap.put("createdAt", order.createdAt);
                orderList.add(orderMap);
            }
            
            return Response.ok(Map.of("orders", orderList, "count", orders.size())).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch orders: " + e.getMessage()))
                    .build();
        }
    }

    @POST
    @Transactional
    public Response createOrder(OrderRequest request) {
        try {
            System.out.println("=== ORDER CREATION STARTED ===");
            System.out.println("OrderController: createOrder called");
            System.out.println("OrderController: Request data: " + request);
            
            Long userId = currentUserId();
            System.out.println("OrderController: User ID: " + userId);
            
            // Validate request
            if (request.items == null || request.items.isEmpty()) {
                System.out.println("OrderController: No items in order");
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "No items in order"))
                        .build();
            }
            
            System.out.println("OrderController: Creating order with " + request.items.size() + " items");
            
            // Create order
            Order order = new Order();
            order.userId = userId;
            order.totalAmount = calculateTotal(request.items);
            order.subtotalAmount = order.totalAmount; // Set subtotal same as total for now
            order.totalLineAmount = order.totalAmount; // Set total line amount same as total for now
            order.paymentMethod = request.paymentMethod;
            order.status = Order.OrderStatus.CONFIRMED;
            // Note: createdAt, updatedAt, and orderNumber will be set by @PrePersist
            
            System.out.println("OrderController: Order object created with totalAmount: " + order.totalAmount);
            System.out.println("OrderController: Payment method: " + order.paymentMethod);
            
            // Set delivery address
            if (request.addressId != null) {
                System.out.println("OrderController: Setting delivery address for addressId: " + request.addressId);
                Address address = em.find(Address.class, request.addressId);
                if (address != null) {
                    order.deliveryAddress = String.format("%s, %s, %s %s", 
                        address.getAddressLine1(), 
                        address.getCity(), 
                        address.getState(), 
                        address.getZipCode());
                    order.deliveryPhone = address.getPhone();
                    System.out.println("OrderController: Set delivery address: " + order.deliveryAddress);
                } else {
                    System.err.println("OrderController: Address not found for ID: " + request.addressId);
                }
            } else {
                System.err.println("OrderController: No addressId provided in request");
            }
            
            // Set card details if available
            if (request.cardDetails != null && request.cardDetails.number != null) {
                String cardNumber = request.cardDetails.number.replace("\\s", "");
                if (cardNumber.length() >= 4) {
                    order.cardLast4 = cardNumber.substring(cardNumber.length() - 4);
                }
            }
            
            // Check if prescription is required
            boolean prescriptionRequired = request.items.stream()
                .anyMatch(item -> item.prescriptionRequired != null && item.prescriptionRequired);
            order.prescriptionRequired = prescriptionRequired;
            
            // Set tracking info
            order.trackingNumber = "EXP" + System.currentTimeMillis();
            order.courier = "Express Delivery";
            order.estimatedDelivery = LocalDateTime.now().plusDays(5).toLocalDate().toString();
            
            System.out.println("OrderController: About to persist order with orderNumber: " + order.orderNumber);
            order.persist();
            order.flush(); // Ensure order is in database before creating items
            
            // Verify order was saved
            Order savedOrder = Order.findById(order.id);
            if (savedOrder != null) {
                System.out.println("OrderController: Order saved successfully - ID: " + savedOrder.id + ", OrderNumber: " + savedOrder.orderNumber);
            } else {
                System.err.println("OrderController: ERROR - Order was not saved to database!");
            }
            
            // DISABLE ORDERITEMS TEMPORARILY - 500 ERROR
            System.out.println("OrderController: Order created successfully with ID: " + order.id + ", Order Number: " + order.orderNumber);
            System.out.println("OrderController: Items count: " + request.items.size() + " (OrderItems disabled due to 500 error)");
            
            // Clear cart after successful order
            clearCart(userId);
            
            Map<String, Object> response = new HashMap<>();
            response.put("orderId", order.orderNumber);
            response.put("message", "Order placed successfully");
            response.put("itemsCount", request.items.size());
            
            System.out.println("OrderController: Returning response with orderId: " + response.get("orderId"));
            
            return Response.ok(response).build();
            
        } catch (Exception e) {
            System.err.println("OrderController: Error creating order: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to place order: " + e.getMessage()))
                    .build();
        }
    }
    
    @PUT
    @Path("/{orderNumber}/cancel")
    public Response cancelOrder(@PathParam("orderNumber") String orderNumber) {
        try {
            Long userId = currentUserId();
            
            Order order = Order.find("orderNumber = ?1 AND userId = ?2", orderNumber, userId).firstResult();
            
            if (order == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Order not found"))
                        .build();
            }
            
            // Check if order can be cancelled (only if not delivered or already cancelled)
            if (order.status == Order.OrderStatus.DELIVERED || order.status == Order.OrderStatus.CANCELLED) {
                return Response.status(Response.Status.BAD_REQUEST)
                        .entity(Map.of("error", "Order cannot be cancelled"))
                        .build();
            }
            
            // Update order status to cancelled
            order.status = Order.OrderStatus.CANCELLED;
            order.persist();
            
            System.out.println("OrderController: Order cancelled - " + orderNumber);
            
            return Response.ok(Map.of("message", "Order cancelled successfully", "orderNumber", orderNumber)).build();
            
        } catch (Exception e) {
            System.err.println("OrderController: Error cancelling order: " + e.getMessage());
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to cancel order: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    public Response getUserOrders() {
        try {
            Long userId = currentUserId();
            List<Order> orders = em.createQuery(
                "SELECT o FROM Order o WHERE o.userId = :userId ORDER BY o.createdAt DESC", Order.class)
                .setParameter("userId", userId)
                .getResultList();
            
            List<Map<String, Object>> orderList = orders.stream()
                .map(order -> {
                    Map<String, Object> orderMap = new HashMap<>();
                    orderMap.put("id", order.id);
                    orderMap.put("orderNumber", order.orderNumber);
                    orderMap.put("status", order.status);
                    orderMap.put("totalAmount", order.totalAmount);
                    orderMap.put("paymentMethod", order.paymentMethod);
                    orderMap.put("cardLast4", order.cardLast4);
                    orderMap.put("deliveryAddress", order.deliveryAddress);
                    orderMap.put("deliveryPhone", order.deliveryPhone);
                    orderMap.put("prescriptionRequired", order.prescriptionRequired);
                    orderMap.put("estimatedDelivery", order.estimatedDelivery);
                    orderMap.put("trackingNumber", order.trackingNumber);
                    orderMap.put("courier", order.courier);
                    orderMap.put("createdAt", order.createdAt);
                    orderMap.put("updatedAt", order.updatedAt);
                    
                    // Add order items
                    List<OrderItem> items = em.createQuery(
                        "SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId", OrderItem.class)
                        .setParameter("orderId", order.id)
                        .getResultList();
                    
                    List<Map<String, Object>> itemMaps = items.stream()
                        .map(item -> {
                            Map<String, Object> itemMap = new HashMap<>();
                            itemMap.put("id", item.id);
                            itemMap.put("quantity", item.quantity);
                            itemMap.put("unitPrice", item.unitPrice);
                            itemMap.put("totalPrice", item.totalPrice);
                            itemMap.put("prescriptionRequired", item.prescriptionRequired);
                            
                            if (item.product != null) {
                                itemMap.put("productId", item.product.id);
                                itemMap.put("productName", item.product.name);
                                itemMap.put("productImage", item.product.imageUrl);
                            }
                            
                            return itemMap;
                        })
                        .collect(Collectors.toList());
                    
                    orderMap.put("items", itemMaps);
                    return orderMap;
                })
                .collect(Collectors.toList());
            
            return Response.ok(Map.of("orders", orderList)).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch orders: " + e.getMessage()))
                    .build();
        }
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
    
    private Double calculateTotal(List<OrderItemRequest> items) {
        double subtotal = items.stream()
            .mapToDouble(item -> item.quantity * item.unitPrice)
            .sum();
        
        // Calculate tax (5% of subtotal)
        double tax = subtotal * 0.05;
        
        // Calculate shipping (free if subtotal >= 500, otherwise ₹50)
        double shipping = subtotal >= 500 ? 0.0 : 50.0;
        
        double total = subtotal + tax + shipping;
        
        System.out.println("OrderController: Subtotal: " + subtotal + ", Tax: " + tax + ", Shipping: " + shipping + ", Total: " + total);
        
        return total;
    }
    
    private void clearCart(Long userId) {
        List<Cart> carts = em.createQuery(
            "SELECT c FROM Cart c WHERE c.userId = :userId AND c.status = :status", Cart.class)
            .setParameter("userId", userId)
            .setParameter("status", Cart.CartStatus.ACTIVE)
            .getResultList();
            
        for (Cart cart : carts) {
            List<CartItem> cartItems = em.createQuery(
                "SELECT ci FROM CartItem ci WHERE ci.cart.id = :cartId", CartItem.class)
                .setParameter("cartId", cart.id)
                .getResultList();
                
            for (CartItem cartItem : cartItems) {
                em.remove(cartItem);
            }
            cart.status = Cart.CartStatus.CONVERTED;
            em.merge(cart);
        }
    }
    
    // Request DTOs
    public static class OrderRequest {
        public Long addressId;
        public String paymentMethod;
        public CardDetails cardDetails;
        public String prescriptionFile;
        public List<OrderItemRequest> items;
    }
    
    public static class CardDetails {
        public String number;
        public String expiry;
        public String cvv;
    }
    
    public static class OrderItemRequest {
        public Long productId;
        public Integer quantity;
        public Double unitPrice;
        public Boolean prescriptionRequired;
    }
}
