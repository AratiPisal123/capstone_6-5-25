package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Entity
@Table(name = "brands")
public class Brand extends PanacheEntity {
    
    @NotBlank(message = "Brand name is required")
    @Size(max = 255)
    @Column(nullable = false, unique = true)
    public String name;
    
    @Size(max = 255)
    @Column(name = "manufacturer_name")
    public String manufacturerName;
    
    @Size(max = 500)
    @Column(name = "logo_url")
    public String logoUrl;
    
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
    public static Brand findByName(String name) {
        return find("name", name).firstResult();
    }
    
    public static List<Brand> findByIsActiveTrue() {
        return list("isActive", true);
    }
    
    public static boolean existsByName(String name) {
        return count("name", name) > 0;
    }
}
