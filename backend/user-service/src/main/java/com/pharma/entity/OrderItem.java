package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "order_items")
public class OrderItem extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "order_id", nullable = false)
    public Order order;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;
    
    @Column(name = "quantity", nullable = false)
    public Integer quantity;
    
    @Column(name = "unit_price")
    public Double unitPrice;
    
    @Column(name = "total_price")
    public Double totalPrice;
    
    @Column(name = "product_name_snapshot")
    public String productNameSnapshot;
    
    @Column(name = "prescription_required")
    public Boolean prescriptionRequired = false;
    
    @Column(name = "created_at", nullable = false)
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @PrePersist
    @PreUpdate
    public void onUpdate() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
        // Calculate total price
        if (unitPrice != null && quantity != null) {
            totalPrice = unitPrice * quantity;
        }
        // Set product name snapshot
        if (product != null && product.name != null) {
            productNameSnapshot = product.name;
        }
    }
}