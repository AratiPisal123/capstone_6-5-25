package com.pharma.repository;

import com.pharma.entity.TicketMessage;
import com.pharma.entity.SupportTicket;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class TicketMessageRepository implements PanacheRepository<TicketMessage> {
    
    public List<TicketMessage> findByTicketOrderByCreatedAtAsc(SupportTicket ticket) {
        return list("ticket", ticket);
    }
    
    public List<TicketMessage> findByTicketIdOrderByCreatedAtAsc(Long ticketId) {
        return list("ticket.ticketId", ticketId);
    }
}
