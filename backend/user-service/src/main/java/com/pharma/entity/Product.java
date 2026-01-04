package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "products")
public class Product extends PanacheEntity {
    
    @NotBlank(message = "SKU is required")
    @Size(max = 100)
    @Column(name = "sku", nullable = false, unique = true)
    public String sku;
    
    @NotBlank(message = "Product name is required")
    @Size(max = 500)
    @Column(nullable = false)
    public String name;
    
    @Column(columnDefinition = "TEXT")
    public String description;
    
    @Column(name = "category_id")
    public Long categoryId;
    
    @Column(name = "brand_id")
    public Long brandId;
    
    @Column(name = "prescription_required")
    public Boolean prescriptionRequired = false;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public DosageForm dosageForm;
    
    @Size(max = 100)
    @Column(name = "strength")
    public String strength;
    
    @Size(max = 100)
    @Column(name = "pack_size")
    public String packSize;
    
    @Size(max = 50)
    @Column(name = "gtin")
    public String gtin;
    
    @Size(max = 50)
    @Column(name = "barcode")
    public String barcode;
    
    @Size(max = 500)
    @Column(name = "image_url")
    public String imageUrl;
    
    @Column(name = "is_active")
    public Boolean isActive = true;
    
    @Column(name = "created_at")
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    // Relationships
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public Set<ProductPrice> productPrices = new HashSet<>();
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public Set<ProductInventory> productInventories = new HashSet<>();
    
    @OneToMany(mappedBy = "product", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public Set<ProductImage> productImages = new HashSet<>();
    
    @PrePersist
    @PreUpdate
    public void updateTimeStamps() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
    
    public enum DosageForm {
        TABLET, SYRUP, CAPSULE, INJECTION, CREAM, OINTMENT, DROPS, INHALER
    }
    
    // Business methods
    public boolean isLowStock() {
        return productInventories.stream()
                .anyMatch(pi -> pi.quantityAvailable <= pi.reorderLevel);
    }
    
    public boolean isExpiringSoon(int days) {
        return productInventories.stream()
                .anyMatch(pi -> pi.expiryDate != null && 
                               pi.expiryDate.isBefore(LocalDate.now().plusDays(days)));
    }
    
    public boolean isExpired() {
        return productInventories.stream()
                .anyMatch(pi -> pi.expiryDate != null && 
                               pi.expiryDate.isBefore(LocalDate.now()));
    }
    
    public boolean isInStock() {
        return productInventories.stream()
                .anyMatch(pi -> pi.quantityAvailable > 0 && !isExpired());
    }
    
    public Integer getTotalStock() {
        return productInventories.stream()
                .mapToInt(pi -> pi.quantityAvailable)
                .sum();
    }
    
    public java.math.BigDecimal getCurrentPrice() {
        ProductPrice currentPrice = ProductPrice.findCurrentPriceByProductId(this.id);
        return currentPrice != null ? currentPrice.getCurrentPrice() : java.math.BigDecimal.ZERO;
    }
}
