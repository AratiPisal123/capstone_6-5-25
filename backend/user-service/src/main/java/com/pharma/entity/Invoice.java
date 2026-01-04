package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;
import com.pharma.user.entity.User;

@Entity
@Table(name = "invoices")
public class Invoice extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    public User user;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    public Order order;
    
    @Column(name = "invoice_number", nullable = false, unique = true)
    public String invoiceNumber;
    
    @Column(name = "order_number", nullable = false)
    public String orderNumber;
    
    @Column(name = "order_date", nullable = false)
    public LocalDateTime orderDate;
    
    @Column(name = "total_amount", nullable = false)
    public Double totalAmount;
    
    @Column(name = "payment_method", nullable = false)
    public String paymentMethod;
    
    @Column(name = "card_last4")
    public String cardLast4;
    
    @Column(name = "delivery_address", columnDefinition = "TEXT")
    public String deliveryAddress;
    
    @Column(name = "delivery_phone")
    public String deliveryPhone;
    
    @Column(name = "tracking_number")
    public String trackingNumber;
    
    @Column(name = "estimated_delivery")
    public String estimatedDelivery;
    
    @Column(name = "status", nullable = false)
    public String status;
    
    @Column(name = "items_data", columnDefinition = "TEXT")
    public String itemsData; // JSON string of items
    
    @Column(name = "download_count", nullable = false)
    public Integer downloadCount = 0;
    
    @Column(name = "last_downloaded")
    public LocalDateTime lastDownloaded;
    
    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at", nullable = false)
    public LocalDateTime updatedAt;
    
    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        if (updatedAt == null) {
            updatedAt = LocalDateTime.now();
        }
        if (invoiceNumber == null) {
            invoiceNumber = generateInvoiceNumber();
        }
    }
    
    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    private String generateInvoiceNumber() {
        long timestamp = System.currentTimeMillis();
        return "INV-" + timestamp;
    }
}
