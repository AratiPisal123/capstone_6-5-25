package com.pharma.controller;

import com.pharma.entity.Invoice;
import com.pharma.entity.Order;
import com.pharma.user.entity.User;
import com.pharma.user.entity.Address;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import org.eclipse.microprofile.jwt.JsonWebToken;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Path("/api/invoices")
@Authenticated
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class InvoiceController {
    
    @Inject
    JsonWebToken jwt;
    
    @Inject
    jakarta.persistence.EntityManager em;
    
    @GET
    public Response getUserInvoices() {
        try {
            Long userId = currentUserId();
            List<Invoice> invoices = Invoice.find("user.id = ?1 ORDER BY createdAt DESC", userId).list();
            
            List<Map<String, Object>> invoiceList = invoices.stream()
                .map(this::convertToInvoiceDTO)
                .collect(Collectors.toList());
            
            return Response.ok(Map.of("invoices", invoiceList)).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch invoices: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{invoiceNumber}")
    public Response getInvoice(@PathParam("invoiceNumber") String invoiceNumber) {
        try {
            Long userId = currentUserId();
            Invoice invoice = Invoice.find("invoiceNumber = ?1 AND user.id = ?2", invoiceNumber, userId).firstResult();
            
            if (invoice == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Invoice not found"))
                        .build();
            }
            
            // Increment download count
            invoice.downloadCount = (invoice.downloadCount != null ? invoice.downloadCount : 0) + 1;
            invoice.lastDownloaded = LocalDateTime.now();
            invoice.persist();
            
            return Response.ok(convertToInvoiceDTO(invoice)).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch invoice: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Transactional
    public Response createInvoice(Map<String, Object> request) {
        try {
            Long userId = currentUserId();
            String orderNumber = (String) request.get("orderNumber");
            
            // Find the order
            Order order = Order.find("orderNumber = ?1 AND userId = ?2", orderNumber, userId).firstResult();
            if (order == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Order not found"))
                        .build();
            }
            
            // Check if invoice already exists for this order
            Invoice existingInvoice = Invoice.find("order.id = ?1", order.id).firstResult();
            if (existingInvoice != null) {
                return Response.ok(convertToInvoiceDTO(existingInvoice)).build();
            }
            
            // Create new invoice
            Invoice invoice = new Invoice();
            invoice.user = em.find(User.class, userId);
            invoice.order = order;
            invoice.orderNumber = orderNumber;
            invoice.orderDate = order.createdAt;
            invoice.totalAmount = order.totalAmount;
            invoice.paymentMethod = order.paymentMethod;
            invoice.cardLast4 = order.cardLast4;
            invoice.deliveryAddress = order.deliveryAddress;
            invoice.deliveryPhone = order.deliveryPhone;
            invoice.trackingNumber = order.trackingNumber;
            invoice.estimatedDelivery = order.estimatedDelivery;
            invoice.status = order.status.toString();
            
            // Get order items
            List<Map<String, Object>> items = em.createQuery(
                "SELECT oi FROM OrderItem oi WHERE oi.order.id = :orderId", com.pharma.entity.OrderItem.class)
                .setParameter("orderId", order.id)
                .getResultList()
                .stream()
                .map(item -> {
                    Map<String, Object> itemMap = new HashMap<>();
                    itemMap.put("id", item.id);
                    itemMap.put("productId", item.product.id);
                    itemMap.put("name", item.product.name);
                    itemMap.put("quantity", item.quantity);
                    itemMap.put("unitPrice", item.unitPrice);
                    itemMap.put("totalPrice", item.totalPrice);
                    itemMap.put("prescriptionRequired", item.prescriptionRequired);
                    return itemMap;
                })
                .collect(Collectors.toList());
            
            // Convert items to JSON string
            invoice.itemsData = items.toString();
            
            invoice.persist();
            
            return Response.status(Response.Status.CREATED)
                    .entity(convertToInvoiceDTO(invoice))
                    .build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to create invoice: " + e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Path("/{invoiceNumber}")
    @Transactional
    public Response deleteInvoice(@PathParam("invoiceNumber") String invoiceNumber) {
        try {
            Long userId = currentUserId();
            Invoice invoice = Invoice.find("invoiceNumber = ?1 AND user.id = ?2", invoiceNumber, userId).firstResult();
            
            if (invoice == null) {
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Invoice not found"))
                        .build();
            }
            
            invoice.delete();
            
            return Response.ok(Map.of("message", "Invoice deleted successfully")).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to delete invoice: " + e.getMessage()))
                    .build();
        }
    }
    
    @DELETE
    @Transactional
    public Response deleteAllInvoices() {
        try {
            Long userId = currentUserId();
            List<Invoice> invoices = Invoice.find("user.id = ?1", userId).list();
            
            for (Invoice invoice : invoices) {
                invoice.delete();
            }
            
            return Response.ok(Map.of("message", "All invoices deleted successfully")).build();
            
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to delete invoices: " + e.getMessage()))
                    .build();
        }
    }
    
    private Map<String, Object> convertToInvoiceDTO(Invoice invoice) {
        Map<String, Object> dto = new HashMap<>();
        dto.put("id", invoice.id);
        dto.put("invoiceNumber", invoice.invoiceNumber);
        dto.put("orderNumber", invoice.orderNumber);
        dto.put("orderDate", invoice.orderDate);
        dto.put("totalAmount", invoice.totalAmount);
        dto.put("paymentMethod", invoice.paymentMethod);
        dto.put("cardLast4", invoice.cardLast4);
        dto.put("deliveryAddress", invoice.deliveryAddress);
        dto.put("deliveryPhone", invoice.deliveryPhone);
        dto.put("trackingNumber", invoice.trackingNumber);
        dto.put("estimatedDelivery", invoice.estimatedDelivery);
        dto.put("status", invoice.status);
        dto.put("downloadCount", invoice.downloadCount);
        dto.put("lastDownloaded", invoice.lastDownloaded);
        dto.put("createdAt", invoice.createdAt);
        dto.put("updatedAt", invoice.updatedAt);
        
        // Parse items data
        try {
            if (invoice.itemsData != null && !invoice.itemsData.isEmpty()) {
                // Simple JSON parsing (you might want to use a proper JSON library)
                dto.put("items", parseItemsData(invoice.itemsData));
            } else {
                dto.put("items", new ArrayList<>());
            }
        } catch (Exception e) {
            dto.put("items", new ArrayList<>());
        }
        
        return dto;
    }
    
    private List<Map<String, Object>> parseItemsData(String itemsData) {
        // Simple JSON parsing - in production, use a proper JSON library
        List<Map<String, Object>> items = new ArrayList<>();
        
        // This is a simplified parser - you might want to use Jackson or Gson
        try {
            // For now, return empty list - you can implement proper JSON parsing
            // when you have the OrderItem data properly structured
        } catch (Exception e) {
            // Return empty list on parsing error
        }
        
        return items;
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
