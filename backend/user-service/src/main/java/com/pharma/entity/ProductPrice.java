package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "product_prices")
public class ProductPrice extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;
    
    @Column(name = "currency", length = 10)
    public String currency = "INR";
    
    @NotNull(message = "MRP is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "MRP must be greater than 0")
    @Column(name = "mrp", nullable = false, precision = 10, scale = 2)
    public BigDecimal mrp;
    
    @Column(name = "sale_price", precision = 10, scale = 2)
    public BigDecimal salePrice;
    
    @Column(name = "valid_from")
    public LocalDateTime validFrom;
    
    @Column(name = "valid_to")
    public LocalDateTime validTo;
    
    @PrePersist
    public void setDefaultValues() {
        if (validFrom == null) {
            validFrom = LocalDateTime.now();
        }
    }
    
    public boolean isValid() {
        LocalDateTime now = LocalDateTime.now();
        boolean afterValidFrom = validFrom == null || !now.isBefore(validFrom);
        boolean beforeValidTo = validTo == null || !now.isAfter(validTo);
        return afterValidFrom && beforeValidTo;
    }
    
    public BigDecimal getCurrentPrice() {
        return salePrice != null && isValid() ? salePrice : mrp;
    }
    
    public boolean hasDiscount() {
        return salePrice != null && isValid() && salePrice.compareTo(mrp) < 0;
    }
    
    public BigDecimal getDiscountAmount() {
        if (hasDiscount()) {
            return mrp.subtract(salePrice);
        }
        return BigDecimal.ZERO;
    }
    
    public BigDecimal getDiscountPercentage() {
        if (hasDiscount()) {
            return getDiscountAmount().divide(mrp, 2, BigDecimal.ROUND_HALF_UP)
                    .multiply(BigDecimal.valueOf(100));
        }
        return BigDecimal.ZERO;
    }
    
    // Panache queries
    public static List<ProductPrice> findByProductId(Long productId) {
        return list("product.id", productId);
    }
    
    public static ProductPrice findCurrentPriceByProductId(Long productId) {
        LocalDateTime now = LocalDateTime.now();
        return find("product.id = ?1 and validFrom <= ?2 and (validTo is null or validTo >= ?2)", 
                productId, now).firstResult();
    }
}
