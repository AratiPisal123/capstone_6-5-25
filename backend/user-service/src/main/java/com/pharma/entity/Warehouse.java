package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "warehouses")
public class Warehouse extends PanacheEntity {
    
    @NotBlank(message = "Warehouse name is required")
    @Size(max = 255)
    @Column(nullable = false)
    public String name;
    
    @NotBlank(message = "Warehouse code is required")
    @Size(max = 50)
    @Column(nullable = false, unique = true)
    public String code;
    
    @Size(max = 255)
    @Column(name = "address_line1")
    public String addressLine1;
    
    @Size(max = 255)
    @Column(name = "address_line2")
    public String addressLine2;
    
    @Size(max = 100)
    public String city;
    
    @Size(max = 100)
    public String state;
    
    @Size(max = 20)
    @Column(name = "postal_code")
    public String postalCode;
    
    @Size(max = 100)
    public String country = "India";
    
    @Column(name = "is_active")
    public Boolean isActive = true;
    
    @Column(name = "created_at")
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @PrePersist
    @PreUpdate
    public void updateTimeStamps() {
        if (createdAt == null) {
            createdAt = LocalDateTime.now();
        }
        updatedAt = LocalDateTime.now();
    }
    
    // Panache queries
    public static List<Warehouse> findByIsActiveTrue() {
        return list("isActive", true);
    }
    
    public static Warehouse findByCode(String code) {
        return find("code", code).firstResult();
    }
    
    public static boolean existsByCode(String code) {
        return count("code", code) > 0;
    }
}
