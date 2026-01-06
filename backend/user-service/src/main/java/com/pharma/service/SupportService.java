package com.pharma.service;

import com.pharma.entity.SupportTicket;
import com.pharma.entity.TicketMessage;
import com.pharma.entity.Notification;
import com.pharma.entity.FAQ;
import com.pharma.user.entity.User;
import com.pharma.user.entity.UserRole;
import com.pharma.repository.FAQRepository;
import com.pharma.repository.NotificationRepository;
import com.pharma.repository.SupportTicketRepository;
import com.pharma.repository.TicketMessageRepository;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.persistence.EntityManager;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@ApplicationScoped
public class SupportService {

    @Inject
    SupportTicketRepository supportTicketRepository;

    @Inject
    TicketMessageRepository ticketMessageRepository;

    @Inject
    FAQRepository faqRepository;

    @Inject
    NotificationRepository notificationRepository;

    @Inject
    Mailer mailer;

    @Inject
    ObjectMapper objectMapper;

    private static final String ADMIN_EMAIL = "pisalarati123@gmail.com";

    @Transactional
    public SupportTicket createTicket(User user, String subject, String description, 
                                    SupportTicket.TicketCategory category, SupportTicket.TicketPriority priority) {
        SupportTicket ticket = new SupportTicket();
        ticket.setUser(user);
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        ticket.setStatus(SupportTicket.TicketStatus.OPEN);

        // Set the ticketId before persisting
        ticket.setTicketId(System.currentTimeMillis()); // Use timestamp as unique ticketId
        ticket.persist();

        // Send email notification to admin (temporarily disabled for testing)
        try {
            sendTicketCreatedEmail(ticket);
        } catch (Exception e) {
            System.err.println("Failed to send email notification: " + e.getMessage());
            // Don't fail ticket creation if email fails
        }

        // Create notification for user (temporarily disabled for testing)
        try {
            Map<String, Object> payload = new HashMap<>();
            payload.put("ticketId", ticket.getTicketId());
            payload.put("subject", subject);
            
            createNotification(user, Notification.NotificationChannel.EMAIL, 
                              "ticket_created", payload);
        } catch (Exception e) {
            System.err.println("Failed to create notification: " + e.getMessage());
            // Don't fail ticket creation if notification fails
        }

        return ticket;
    }

    @Transactional
    public SupportTicket updateTicket(Long ticketId, User user, String subject, String description, 
                                    SupportTicket.TicketCategory category, SupportTicket.TicketPriority priority) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }

        // Verify user owns the ticket or is admin
        if (!ticket.getUser().getId().equals(user.getId()) && user.getRole() != UserRole.ADMIN) {
            throw new RuntimeException("You can only update your own tickets");
        }

        // Update ticket fields
        ticket.setSubject(subject);
        ticket.setDescription(description);
        ticket.setCategory(category);
        ticket.setPriority(priority);
        
        // Update timestamp
        ticket.setUpdatedAt(LocalDateTime.now());

        supportTicketRepository.persist(ticket);
        
        return ticket;
    }

    @Transactional
    public TicketMessage addMessage(Long ticketId, String message, TicketMessage.SenderType senderType, User sender) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }

        TicketMessage ticketMessage = new TicketMessage();
        ticketMessage.setTicket(ticket);
        ticketMessage.setMessage(message);
        ticketMessage.setSenderType(senderType);
        ticketMessage.setSender(sender);
        ticketMessage.setMessageId(System.currentTimeMillis()); // Set messageId

        ticketMessage.persist();

        // Update ticket status based on sender type
        if (senderType == TicketMessage.SenderType.USER) {
            ticket.setStatus(SupportTicket.TicketStatus.PENDING_INTERNAL);
        } else if (senderType == TicketMessage.SenderType.AGENT) {
            ticket.setStatus(SupportTicket.TicketStatus.PENDING_USER);
        }

        // Send email notification
        sendNewMessageEmail(ticket, ticketMessage);

        return ticketMessage;
    }

    public List<SupportTicket> getUserTickets(User user) {
        return supportTicketRepository.findByUserOrderByCreatedAtDesc(user);
    }

    public List<TicketMessage> getTicketMessages(Long ticketId) {
        return ticketMessageRepository.findByTicketIdOrderByCreatedAtAsc(ticketId);
    }

    public List<FAQ> getAllFAQs() {
        return faqRepository.findByIsActiveTrueOrderByPriorityDesc();
    }

    public List<FAQ> getFAQsByCategory(String category) {
        return faqRepository.findByCategoryAndIsActiveTrueOrderByPriorityDesc(category);
    }

    public List<FAQ> searchFAQs(String search) {
        return faqRepository.searchFAQs(search);
    }

    public List<String> getFAQCategories() {
        return faqRepository.findActiveCategories();
    }

    @Transactional
    public SupportTicket updateTicketStatus(Long ticketId, SupportTicket.TicketStatus status) {
        SupportTicket ticket = supportTicketRepository.findById(ticketId);
        if (ticket == null) {
            throw new RuntimeException("Ticket not found");
        }
        
        ticket.setStatus(status);
        return ticket;
    }

    private void sendTicketCreatedEmail(SupportTicket ticket) {
        String subject = "New Support Ticket #" + ticket.getTicketId() + " - " + ticket.getSubject();
        String body = String.format(
            "A new support ticket has been created:\n\n" +
            "Ticket ID: %d\n" +
            "Customer: %s (%s)\n" +
            "Category: %s\n" +
            "Priority: %s\n" +
            "Subject: %s\n" +
            "Description: %s\n\n" +
            "Please log in to the admin panel to respond.",
            ticket.getTicketId(),
            ticket.getUser().getName(),
            ticket.getUser().getEmail(),
            ticket.getCategory(),
            ticket.getPriority(),
            ticket.getSubject(),
            ticket.getDescription()
        );

        mailer.send(Mail.withText(ADMIN_EMAIL, subject, body));
    }

    private void sendNewMessageEmail(SupportTicket ticket, TicketMessage message) {
        String userEmail = ticket.getUser().getEmail();
        String subject = "Update on Support Ticket #" + ticket.getTicketId();
        
        String body;
        if (message.getSenderType() == TicketMessage.SenderType.AGENT) {
            body = String.format(
                "You have received a response to your support ticket #%d:\n\n" +
                "Message: %s\n\n" +
                "You can reply to this message through your account dashboard.",
                ticket.getTicketId(),
                message.getMessage()
            );
        } else {
            // Notify admin about user response
            body = String.format(
                "Customer has replied to ticket #%d:\n\n" +
                "Customer: %s (%s)\n" +
                "Message: %s",
                ticket.getTicketId(),
                ticket.getUser().getName(),
                ticket.getUser().getEmail(),
                message.getMessage()
            );
            userEmail = ADMIN_EMAIL;
        }

        mailer.send(Mail.withText(userEmail, subject, body));
    }

    private void createNotification(User user, Notification.NotificationChannel channel, 
                                  String templateKey, Map<String, Object> payload) {
        try {
            Notification notification = new Notification();
            notification.setUser(user);
            notification.setChannel(channel);
            notification.setTemplateKey(templateKey);
            
            // Properly serialize the payload to JSON
            String jsonPayload = objectMapper.writeValueAsString(payload);
            notification.setPayload(jsonPayload);
            
            notification.setStatus(Notification.NotificationStatus.QUEUED);
            notification.setNotificationId(System.currentTimeMillis());

            notification.persist();
        } catch (Exception e) {
            System.err.println("Error creating notification: " + e.getMessage());
            e.printStackTrace();
            throw new RuntimeException("Failed to create notification", e);
        }
    }

    // AI Chatbot integration method
    public String getAIResponse(String userMessage) {
        // Simple rule-based responses for common queries
        String lowerMessage = userMessage.toLowerCase();
        
        if (lowerMessage.contains("order") && lowerMessage.contains("track")) {
            return "To track your order, please go to your account dashboard and click on 'My Orders'. You can also use the tracking number sent to your email.";
        } else if (lowerMessage.contains("prescription")) {
            return "For prescription orders, please upload a valid prescription during checkout. Our pharmacists will verify it before processing your order.";
        } else if (lowerMessage.contains("payment")) {
            return "We accept credit/debit cards, UPI, net banking, and cash on delivery. All payment methods are secure and encrypted.";
        } else if (lowerMessage.contains("delivery")) {
            return "Standard delivery takes 3-5 business days. Express delivery is available in select cities for an additional charge.";
        } else if (lowerMessage.contains("return") || lowerMessage.contains("refund")) {
            return "We offer 15-day return policy for most products. Please note that prescription medicines cannot be returned once dispensed.";
        } else if (lowerMessage.contains("contact") || lowerMessage.contains("human")) {
            return "I can connect you with a human agent. Please create a support ticket or call our customer service at 1800-XXX-XXXX.";
        } else {
            return "I'm here to help! You can ask me about orders, prescriptions, payments, delivery, returns, or I can connect you with a human agent. What would you like to know?";
        }
    }

    // Send direct email to admin
    public void sendEmailToAdmin(String subject, String message, User user) {
        String body = String.format(
            "New message from customer:\n\n" +
            "Customer: %s (%s)\n" +
            "Subject: %s\n" +
            "Message: %s\n\n" +
            "Sent at: %s",
            user.getName(),
            user.getEmail(),
            subject,
            message,
            LocalDateTime.now()
        );

        mailer.send(Mail.withText(ADMIN_EMAIL, "Customer Inquiry: " + subject, body));
    }
}
