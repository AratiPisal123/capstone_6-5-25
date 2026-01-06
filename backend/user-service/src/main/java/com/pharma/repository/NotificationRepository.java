package com.pharma.repository;

import com.pharma.entity.Notification;
import com.pharma.user.entity.User;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class NotificationRepository implements PanacheRepository<Notification> {
    
    public List<Notification> findByUserOrderByCreatedAtDesc(User user) {
        return list("user", user);
    }
    
    public List<Notification> findByStatus(Notification.NotificationStatus status) {
        return list("status", status);
    }
    
    public List<Notification> findByUserAndStatus(User user, Notification.NotificationStatus status) {
        return list("user = ?1 and status = ?2", user, status);
    }
    
    public long countByStatus(Notification.NotificationStatus status) {
        return count("status", status);
    }
}
