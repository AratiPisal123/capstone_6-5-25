package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "product_images")
public class ProductImage extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;
    
    @NotBlank(message = "Image URL is required")
    @Size(max = 500)
    @Column(nullable = false)
    public String url;
    
    @Size(max = 255)
    @Column(name = "alt_text")
    public String altText;
    
    @Column(name = "sort_order")
    public Integer sortOrder = 0;
    
    @Column(name = "is_primary")
    public Boolean isPrimary = false;
    
    @Column(name = "created_at")
    public LocalDateTime createdAt;
    
    @PrePersist
    public void setDefaultValues() {
        this.createdAt = LocalDateTime.now();
    }
    
    // Panache queries
    public static List<ProductImage> findByProductId(Long productId) {
        return list("product.id", productId);
    }
    
    public static ProductImage findByProductIdAndIsPrimaryTrue(Long productId) {
        return find("product.id = ?1 and isPrimary = true", productId).firstResult();
    }
    
    public static List<ProductImage> findByProductIdOrderBySortOrderAsc(Long productId) {
        return list("product.id = ?1 order by sortOrder asc", productId);
    }
}
