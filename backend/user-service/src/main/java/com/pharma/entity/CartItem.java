package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "cart_items")
public class CartItem extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cart_id", nullable = false)
    public Cart cart;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    public Integer quantity = 1;
    
    @NotNull(message = "Unit price snapshot is required")
    @Column(name = "unit_price_snapshot", nullable = false, precision = 10, scale = 2)
    public BigDecimal unitPriceSnapshot;
    
    @Column(name = "applied_promo_id")
    public Long appliedPromoId;
    
    @Column(name = "created_at")
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @PrePersist
    public void setDefaultValues() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }
    
    @PreUpdate
    public void updateTimestamp() {
        this.updatedAt = LocalDateTime.now();
    }
    
    public BigDecimal getTotalPrice() {
        if (unitPriceSnapshot != null && quantity != null) {
            return unitPriceSnapshot.multiply(BigDecimal.valueOf(quantity));
        }
        return BigDecimal.ZERO;
    }
    
    public void updateQuantity(Integer quantity) {
        if (quantity != null && quantity > 0) {
            this.quantity = quantity;
            this.updatedAt = LocalDateTime.now();
        }
    }
    
    // Panache queries
    public static List<CartItem> findByCartId(Long cartId) {
        return list("cart.id", cartId);
    }
    
    public static List<CartItem> findByProductId(Long productId) {
        return list("product.id", productId);
    }
    
    public static CartItem findByCartIdAndProductId(Long cartId, Long productId) {
        return find("cart.id = ?1 and product.id = ?2", cartId, productId).firstResult();
    }
}
