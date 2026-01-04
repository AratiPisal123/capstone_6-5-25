package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "carts")
public class Cart extends PanacheEntity {
    
    @Column(name = "user_id")
    public Long userId; // Reference to user-service user table
    
    @Size(max = 255)
    @Column(name = "session_id")
    public String sessionId;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public CartStatus status = CartStatus.ACTIVE;
    
    @Column(name = "created_at")
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "cart", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public Set<CartItem> cartItems = new HashSet<>();
    
    @PrePersist
    @PreUpdate
    public void updateTimeStamps() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
    
    public enum CartStatus {
        ACTIVE, CONVERTED, ABANDONED
    }
    
    // Business methods
    public boolean isActive() {
        return status == CartStatus.ACTIVE;
    }
    
    public void markAsConverted() {
        this.status = CartStatus.CONVERTED;
    }
    
    public void markAsAbandoned() {
        this.status = CartStatus.ABANDONED;
    }
    
    public int getTotalItems() {
        return cartItems.stream()
                .mapToInt(item -> item.quantity)
                .sum();
    }
    
    // Panache queries
    public static List<Cart> findByUserId(Long userId) {
        return list("userId", userId);
    }
    
    public static Cart findBySessionId(String sessionId) {
        return find("sessionId", sessionId).firstResult();
    }
    
    public static List<Cart> findByStatus(CartStatus status) {
        return list("status", status);
    }
    
    public static long countByUserId(Long userId) {
        return count("userId", userId);
    }
}
