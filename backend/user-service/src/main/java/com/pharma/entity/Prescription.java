package com.pharma.entity;

import io.quarkus.hibernate.orm.panache.PanacheEntity;
import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.HashSet;
import java.util.Set;

@Entity
@Table(name = "prescriptions")
public class Prescription extends PanacheEntity {
    
    @Column(name = "user_id", nullable = false)
    public Long userId; // Reference to user-service user table
    
    @Size(max = 255)
    @Column(name = "doctor_name")
    public String doctorName;
    
    @Size(max = 100)
    @Column(name = "doctor_registration_no")
    public String doctorRegistrationNo;
    
    @NotNull(message = "Prescription date is required")
    @Column(name = "prescription_date", nullable = false)
    public LocalDate prescriptionDate;
    
    @NotBlank(message = "File URL is required")
    @Column(name = "file_url", nullable = false)
    public String fileUrl;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    public PrescriptionStatus status = PrescriptionStatus.UPLOADED;
    
    @Column(name = "reviewed_by")
    public Long reviewedBy; // Reference to user-service user table
    
    @Column(columnDefinition = "TEXT", name = "review_notes")
    public String reviewNotes;
    
    @Column(name = "valid_until")
    public LocalDate validUntil;
    
    @Column(name = "created_at")
    public LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    public LocalDateTime updatedAt;
    
    @OneToMany(mappedBy = "prescription", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    public Set<PrescriptionProduct> prescriptionProducts = new HashSet<>();
    
    @PrePersist
    public void setDefaultValues() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.prescriptionDate = LocalDate.now();
        // Prescriptions typically valid for 3 months
        this.validUntil = LocalDate.now().plusMonths(3);
    }
    
    public boolean isExpired() {
        return validUntil != null && validUntil.isBefore(LocalDate.now());
    }
    
    public boolean isValid() {
        return !isExpired() && status == PrescriptionStatus.APPROVED;
    }
    
    public void approve(Long reviewedBy, String reviewNotes) {
        this.status = PrescriptionStatus.APPROVED;
        this.reviewedBy = reviewedBy;
        this.reviewNotes = reviewNotes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void reject(Long reviewedBy, String reviewNotes) {
        this.status = PrescriptionStatus.REJECTED;
        this.reviewedBy = reviewedBy;
        this.reviewNotes = reviewNotes;
        this.updatedAt = LocalDateTime.now();
    }
    
    public void markAsExpired() {
        this.status = PrescriptionStatus.EXPIRED;
        this.updatedAt = LocalDateTime.now();
    }
    
    public enum PrescriptionStatus {
        UPLOADED, UNDER_REVIEW, APPROVED, REJECTED, EXPIRED
    }
}
