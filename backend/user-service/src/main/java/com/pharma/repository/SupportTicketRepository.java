package com.pharma.repository;

import com.pharma.entity.SupportTicket;
import com.pharma.user.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class SupportTicketRepository implements PanacheRepository<SupportTicket> {
    
    public List<SupportTicket> findByUserOrderByCreatedAtDesc(User user) {
        return list("user", user);
    }
    
    public List<SupportTicket> findByStatus(SupportTicket.TicketStatus status) {
        return list("status", status);
    }
    
    public List<SupportTicket> findByUserAndStatus(User user, SupportTicket.TicketStatus status) {
        return list("user = ?1 and status = ?2", user, status);
    }
    
    public List<SupportTicket> findByCategory(SupportTicket.TicketCategory category) {
        return list("category", category);
    }
    
    public long countByStatus(SupportTicket.TicketStatus status) {
        return count("status", status);
    }
}
