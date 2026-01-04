package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "orders")
public class Order extends PanacheEntity {
    
    @Column(name = "user_id", nullable = false)
    public Long userId;
    
    @Column(name = "order_number", unique = true, nullable = false)
    public String orderNumber;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    public OrderStatus status = OrderStatus.PENDING;
    
    @Column(name = "total_amount", nullable = false)
    public Double totalAmount;
    
    @Column(name = "subtotal_amount")
    public Double subtotalAmount;
    
    @Column(name = "total_line_amount")
    public Double totalLineAmount;
    
    @Column(name = "payment_method", nullable = false)
    public String paymentMethod;
    
    @Column(name = "card_last4")
    public String cardLast4;
    
    @Column(name = "delivery_address")
    public String deliveryAddress;
    
    @Column(name = "delivery_phone")
    public String deliveryPhone;
    
    @Column(name = "prescription_required")
    public Boolean prescriptionRequired = false;
    
    @Column(name = "estimated_delivery")
    public String estimatedDelivery;
    
    @Column(name = "tracking_number")
    public String trackingNumber;
    
    @Column(name = "courier")
    public String courier;
    
    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public List<OrderItem> orderItems;
    
    @PrePersist
    @PreUpdate
    public void updateTimestamps() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
            // Generate order number
            orderNumber = "ORD-" + System.currentTimeMillis();
        }
        updatedAt = LocalDateTime.now();
    }
    
    public enum OrderStatus {
        PENDING, CONFIRMED, PACKED, SHIPPED, OUT_FOR_DELIVERY, DELIVERED, CANCELLED
    }
}
