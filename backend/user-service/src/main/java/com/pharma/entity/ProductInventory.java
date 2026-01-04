package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "product_inventory")
public class ProductInventory extends PanacheEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "product_id", nullable = false)
    public Product product;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "warehouse_id", nullable = false)
    public Warehouse warehouse;
    
    @NotNull(message = "Quantity available is required")
    @Min(value = 0, message = "Quantity cannot be negative")
    @Column(name = "quantity_available", nullable = false)
    public Integer quantityAvailable = 0;
    
    @Min(value = 0, message = "Reorder level cannot be negative")
    @Column(name = "reorder_level")
    public Integer reorderLevel = 10;
    
    @Size(max = 100)
    @Column(name = "lot_number")
    public String lotNumber;
    
    @Column(name = "expiry_date")
    public LocalDate expiryDate;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @PrePersist
    @PreUpdate
    public void updateTimestamp() {
        updatedAt = LocalDateTime.now();
    }
    
    public boolean isLowStock() {
        return this.quantityAvailable <= reorderLevel;
    }
    
    public boolean isExpiringSoon(int days) {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDate.now().plusDays(days));
    }
    
    public boolean isExpired() {
        if (expiryDate == null) return false;
        return expiryDate.isBefore(LocalDate.now());
    }
    
    public boolean isInStock() {
        return this.quantityAvailable > 0 && !isExpired();
    }
    
    public void addStock(Integer quantity) {
        if (quantity != null && quantity > 0) {
            this.quantityAvailable += quantity;
        }
    }
    
    public boolean removeStock(Integer quantity) {
        if (quantity != null && quantity > 0 && this.quantityAvailable >= quantity) {
            this.quantityAvailable -= quantity;
            return true;
        }
        return false;
    }
    
    // Panache queries
    @Transactional
    public static List<ProductInventory> findByProductId(Long productId) {
        return list("product.id", productId);
    }
    
    @Transactional
    public static List<ProductInventory> findByWarehouseId(Long warehouseId) {
        return list("warehouse.id", warehouseId);
    }
    
    @Transactional
    public static Integer getTotalStockByProductId(Long productId) {
        return find("product.id = ?1", productId).stream()
                .mapToInt(pi -> ((ProductInventory) pi).quantityAvailable)
                .sum();
    }
    
    public static List<ProductInventory> findAvailableStockByProductId(Long productId) {
        return list("product.id = ?1 and quantityAvailable > 0", productId);
    }
    
    public static List<ProductInventory> findLowStockItems() {
        return list("quantityAvailable <= reorderLevel");
    }
    
    public static List<ProductInventory> findExpiringStock(LocalDate date) {
        return list("expiryDate <= ?1", date);
    }
    
    public static List<ProductInventory> findStockExpiringInDateRange(LocalDate startDate, LocalDate endDate) {
        return list("expiryDate between ?1 and ?2", startDate, endDate);
    }
}
