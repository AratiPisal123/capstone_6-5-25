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
@Table(name = "categories")
public class Category extends PanacheEntity {
    
    @Column(name = "parent_id")
    public Long parentId;
    
    @NotBlank(message = "Category name is required")
    @Size(max = 255)
    @Column(nullable = false)
    public String name;
    
    @Size(max = 255)
    @Column(name = "slug", nullable = false, unique = true)
    public String slug;
    
    @Column(columnDefinition = "TEXT")
    public String description;
    
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
    public static Category findBySlug(String slug) {
        return find("slug", slug).firstResult();
    }
    
    public static List<Category> findByParentId(Long parentId) {
        return list("parentId", parentId);
    }
    
    public static List<Category> findByIsActiveTrue() {
        return list("isActive", true);
    }
    
    public static boolean existsBySlug(String slug) {
        return count("slug", slug) > 0;
    }
}
