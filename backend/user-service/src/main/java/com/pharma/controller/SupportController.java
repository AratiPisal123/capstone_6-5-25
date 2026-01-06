package com.pharma.controller;

import com.pharma.entity.SupportTicket;
import com.pharma.entity.TicketMessage;
import com.pharma.entity.FAQ;
import com.pharma.service.SupportService;
import com.pharma.user.entity.User;
import com.pharma.user.entity.UserRole;
import jakarta.inject.Inject;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.annotation.security.RolesAllowed;
import jakarta.persistence.EntityManager;
import java.util.List;
import java.util.Map;

@Path("/api/support")
public class SupportController {

    @Inject
    SupportService supportService;
    
    @Inject
    EntityManager entityManager;

    @Context
    SecurityContext securityContext;

    private User getCurrentUser() {
        try {
            // Get the email of the currently logged-in user from security context
            if (securityContext != null && securityContext.getUserPrincipal() != null) {
                String userEmail = securityContext.getUserPrincipal().getName();
                
                // Find the user by email from database
                List<User> users = entityManager.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                        .setParameter("email", userEmail)
                        .getResultList();
                
                if (!users.isEmpty()) {
                    return users.get(0); // Return the actual logged-in user
                }
                
                // If user not found in database, create a new user with the logged-in email
                User newUser = new User();
                newUser.setEmail(userEmail);
                newUser.setName("User"); // You might want to get this from the user profile
                newUser.setRole(UserRole.CUSTOMER);
                newUser.setEmailVerified(true);
                newUser.setMobileVerified(true);
                newUser.setCreatedAt(java.time.LocalDateTime.now());
                newUser.setUpdatedAt(java.time.LocalDateTime.now());
                newUser.setIsActive(true);
                
                entityManager.persist(newUser);
                entityManager.flush();
                
                return newUser;
            }
        } catch (Exception e) {
            System.err.println("Error getting logged-in user: " + e.getMessage());
        }
        
        // Fallback to demo user if no authenticated user found
        try {
            List<User> users = entityManager.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", "demo@pharma.com")
                    .getResultList();
            
            if (!users.isEmpty()) {
                return users.get(0);
            }
        } catch (Exception e) {
            System.err.println("Error fetching demo user: " + e.getMessage());
        }
        
        // Final fallback
        User user = new User();
        user.setId(1L);
        user.setEmail("demo@pharma.com");
        user.setName("Demo User");
        return user;
    }

    @POST
    @Path("/tickets")
    @RolesAllowed({"CUSTOMER", "ADMIN"})
    @Consumes("application/json")
    public Response createTicket(Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            
            // Extract data from map
            String subject = (String) request.get("subject");
            String description = (String) request.get("description");
            String categoryStr = (String) request.get("category");
            String priorityStr = (String) request.get("priority");
            
            // Convert strings to enums
            SupportTicket.TicketCategory category = SupportTicket.TicketCategory.valueOf(categoryStr);
            SupportTicket.TicketPriority priority = SupportTicket.TicketPriority.valueOf(priorityStr);
            
            SupportTicket ticket = supportService.createTicket(
                user,
                subject,
                description,
                category,
                priority
            );
            return Response.ok(ticket).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Failed to create ticket: " + e.getMessage())).build();
        }
    }

    @GET
    @Path("/tickets")
    @RolesAllowed({"CUSTOMER", "ADMIN"})
    public Response getUserTickets() {
        try {
            User user = getCurrentUser();
            List<SupportTicket> tickets = supportService.getUserTickets(user);
            return Response.ok(tickets).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @PUT
    @Path("/tickets/{ticketId}")
    @RolesAllowed({"CUSTOMER", "ADMIN"})
    @Consumes("application/json")
    public Response updateTicket(@PathParam("ticketId") Long ticketId, Map<String, Object> request) {
        try {
            User user = getCurrentUser();
            
            // Extract data from map
            String subject = (String) request.get("subject");
            String description = (String) request.get("description");
            String categoryStr = (String) request.get("category");
            String priorityStr = (String) request.get("priority");
            
            // Convert strings to enums
            SupportTicket.TicketCategory category = SupportTicket.TicketCategory.valueOf(categoryStr);
            SupportTicket.TicketPriority priority = SupportTicket.TicketPriority.valueOf(priorityStr);
            
            SupportTicket ticket = supportService.updateTicket(
                ticketId,
                user,
                subject,
                description,
                category,
                priority
            );
            return Response.ok(ticket).build();
        } catch (Exception e) {
            e.printStackTrace();
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", "Failed to update ticket: " + e.getMessage())).build();
        }
    }

    @GET
    @Path("/tickets/{ticketId}")
    @RolesAllowed({"CUSTOMER", "ADMIN"})
    public Response getTicketMessages(@PathParam("ticketId") Long ticketId) {
        try {
            List<TicketMessage> messages = supportService.getTicketMessages(ticketId);
            return Response.ok(Map.of("messages", messages)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @POST
    @Path("/tickets/{ticketId}/messages")
    @RolesAllowed({"CUSTOMER", "ADMIN"})
    public Response addMessage(@PathParam("ticketId") Long ticketId, MessageRequest request) {
        try {
            User user = getCurrentUser();
            TicketMessage.SenderType senderType = user.getRole() == UserRole.ADMIN ? 
                TicketMessage.SenderType.AGENT : TicketMessage.SenderType.USER;
            
            TicketMessage message = supportService.addMessage(ticketId, request.getMessage(), senderType, user);
            return Response.ok(message).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @PUT
    @Path("/tickets/{ticketId}/status")
    @RolesAllowed("ADMIN")
    public Response updateTicketStatus(@PathParam("ticketId") Long ticketId, StatusRequest request) {
        try {
            SupportTicket ticket = supportService.updateTicketStatus(ticketId, request.getStatus());
            return Response.ok(ticket).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @GET
    @Path("/faqs")
    public Response getAllFAQs() {
        try {
            List<FAQ> faqs = supportService.getAllFAQs();
            return Response.ok(faqs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @GET
    @Path("/faqs/category/{category}")
    public Response getFAQsByCategory(@PathParam("category") String category) {
        try {
            List<FAQ> faqs = supportService.getFAQsByCategory(category);
            return Response.ok(faqs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @GET
    @Path("/faqs/search")
    public Response searchFAQs(@QueryParam("q") String query) {
        try {
            List<FAQ> faqs = supportService.searchFAQs(query);
            return Response.ok(faqs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.BAD_REQUEST)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @GET
    @Path("/faqs/categories")
    public Response getFAQCategories() {
        try {
            List<String> categories = supportService.getFAQCategories();
            return Response.ok(categories).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @POST
    @Path("/chat")
    @RolesAllowed({"CUSTOMER", "ADMIN"})
    public Response sendChatMessage(ChatRequest request) {
        try {
            String response = supportService.getAIResponse(request.getMessage());
            return Response.ok(Map.of("response", response)).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    @POST
    @Path("/contact")
    @RolesAllowed({"CUSTOMER", "ADMIN"})
    public Response sendContactMessage(ContactRequest request) {
        try {
            User user = getCurrentUser();
            supportService.sendEmailToAdmin(request.getSubject(), request.getMessage(), user);
            return Response.ok(Map.of("message", "Your message has been sent successfully. We'll get back to you within 24 hours.")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                .entity(Map.of("error", e.getMessage())).build();
        }
    }

    // DTOs
    public static class TicketRequest {
        private String subject;
        private String description;
        private SupportTicket.TicketCategory category;
        private SupportTicket.TicketPriority priority;
        private String categoryString;  // For string to enum conversion
        private String priorityString;  // For string to enum conversion

        // Getters and setters
        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public SupportTicket.TicketCategory getCategory() { return category; }
        public void setCategory(SupportTicket.TicketCategory category) { this.category = category; }
        public SupportTicket.TicketPriority getPriority() { return priority; }
        public void setPriority(SupportTicket.TicketPriority priority) { this.priority = priority; }
        public String getCategoryString() { return categoryString; }
        public void setCategoryString(String categoryString) { this.categoryString = categoryString; }
        public String getPriorityString() { return priorityString; }
        public void setPriorityString(String priorityString) { this.priorityString = priorityString; }
    }

    public static class MessageRequest {
        private String message;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class StatusRequest {
        private SupportTicket.TicketStatus status;

        public SupportTicket.TicketStatus getStatus() { return status; }
        public void setStatus(SupportTicket.TicketStatus status) { this.status = status; }
    }

    public static class ChatRequest {
        private String message;

        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }

    public static class ContactRequest {
        private String subject;
        private String message;

        public String getSubject() { return subject; }
        public void setSubject(String subject) { this.subject = subject; }
        public String getMessage() { return message; }
        public void setMessage(String message) { this.message = message; }
    }
}
