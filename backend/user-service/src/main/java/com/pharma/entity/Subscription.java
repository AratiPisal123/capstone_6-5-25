package com.pharma.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "subscriptions")
public class Subscription {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(name = "user_id", nullable = false)
    private Long userId; // Reference to user-service user table
    
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "product_id", nullable = false)
    private Product product;
    
    @NotNull(message = "Quantity is required")
    @Min(value = 1, message = "Quantity must be at least 1")
    @Column(nullable = false)
    private Integer quantity;
    
    @NotNull(message = "Unit price is required")
    @Column(name = "unit_price", nullable = false, precision = 10, scale = 2)
    private BigDecimal unitPrice;
    
    @Column(name = "discount_percentage", precision = 5, scale = 2)
    private BigDecimal discountPercentage = BigDecimal.ZERO;
    
    @Enumerated(EnumType.STRING)
    @Column
    private SubscriptionFrequency frequency;
    
    @Column(name = "start_date", nullable = false)
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "next_delivery_date")
    private LocalDate nextDeliveryDate;
    
    @Column(name = "last_delivery_date")
    private LocalDate lastDeliveryDate;
    
    @Column(name = "total_deliveries")
    private Integer totalDeliveries = 0;
    
    @Column(name = "remaining_deliveries")
    private Integer remainingDeliveries;
    
    @Column(name = "delivery_address")
    private String deliveryAddress;
    
    @Column(name = "special_instructions")
    private String specialInstructions;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private SubscriptionStatus status = SubscriptionStatus.ACTIVE;
    
    @Column(name = "paused_at")
    private LocalDateTime pausedAt;
    
    @Column(name = "cancelled_at")
    private LocalDateTime cancelledAt;
    
    @Column(name = "cancellation_reason")
    private String cancellationReason;
    
    @Column(name = "created_at")
    private LocalDateTime createdAt;
    
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
    
    public Subscription() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        this.startDate = LocalDate.now();
        // Don't calculate next delivery date here since frequency might be null
    }
    
    public void calculateNextDeliveryDate() {
        if (startDate == null || frequency == null) return;
        
        LocalDate baseDate = lastDeliveryDate != null ? lastDeliveryDate : startDate;
        
        switch (frequency) {
            case MONTHLY:
                nextDeliveryDate = baseDate.plusMonths(1);
                break;
            case BIMONTHLY:
                nextDeliveryDate = baseDate.plusMonths(2);
                break;
            case QUARTERLY:
                nextDeliveryDate = baseDate.plusMonths(3);
                break;
            case WEEKLY:
                nextDeliveryDate = baseDate.plusWeeks(1);
                break;
            case BIWEEKLY:
                nextDeliveryDate = baseDate.plusWeeks(2);
                break;
        }
    }
    
    public boolean isDueForDelivery() {
        return nextDeliveryDate != null && 
               nextDeliveryDate.isBefore(LocalDate.now()) && 
               status == SubscriptionStatus.ACTIVE;
    }
    
    public boolean isExpired() {
        return endDate != null && endDate.isBefore(LocalDate.now());
    }
    
    public BigDecimal getEffectivePrice() {
        if (discountPercentage.compareTo(BigDecimal.ZERO) > 0) {
            BigDecimal discountAmount = unitPrice.multiply(discountPercentage.divide(BigDecimal.valueOf(100)));
            return unitPrice.subtract(discountAmount);
        }
        return unitPrice;
    }
    
    public void processDelivery() {
        lastDeliveryDate = LocalDate.now();
        totalDeliveries++;
        if (remainingDeliveries != null) {
            remainingDeliveries--;
            if (remainingDeliveries <= 0) {
                status = SubscriptionStatus.COMPLETED;
            }
        }
        calculateNextDeliveryDate();
    }
    
    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
    
    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public Product getProduct() { return product; }
    public void setProduct(Product product) { this.product = product; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }
    
    public SubscriptionFrequency getFrequency() { return frequency; }
    public void setFrequency(SubscriptionFrequency frequency) { 
        this.frequency = frequency;
        calculateNextDeliveryDate();
    }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { 
        this.startDate = startDate;
        calculateNextDeliveryDate();
    }
    
    public LocalDate getEndDate() { return endDate; }
    public void setEndDate(LocalDate endDate) { this.endDate = endDate; }
    
    public LocalDate getNextDeliveryDate() { return nextDeliveryDate; }
    public void setNextDeliveryDate(LocalDate nextDeliveryDate) { this.nextDeliveryDate = nextDeliveryDate; }
    
    public LocalDate getLastDeliveryDate() { return lastDeliveryDate; }
    public void setLastDeliveryDate(LocalDate lastDeliveryDate) { this.lastDeliveryDate = lastDeliveryDate; }
    
    public Integer getTotalDeliveries() { return totalDeliveries; }
    public void setTotalDeliveries(Integer totalDeliveries) { this.totalDeliveries = totalDeliveries; }
    
    public Integer getRemainingDeliveries() { return remainingDeliveries; }
    public void setRemainingDeliveries(Integer remainingDeliveries) { this.remainingDeliveries = remainingDeliveries; }
    
    public String getDeliveryAddress() { return deliveryAddress; }
    public void setDeliveryAddress(String deliveryAddress) { this.deliveryAddress = deliveryAddress; }
    
    public String getSpecialInstructions() { return specialInstructions; }
    public void setSpecialInstructions(String specialInstructions) { this.specialInstructions = specialInstructions; }
    
    public SubscriptionStatus getStatus() { return status; }
    public void setStatus(SubscriptionStatus status) { 
        this.status = status;
        this.updatedAt = LocalDateTime.now();
    }
    
    public LocalDateTime getPausedAt() { return pausedAt; }
    public void setPausedAt(LocalDateTime pausedAt) { this.pausedAt = pausedAt; }
    
    public LocalDateTime getCancelledAt() { return cancelledAt; }
    public void setCancelledAt(LocalDateTime cancelledAt) { this.cancelledAt = cancelledAt; }
    
    public String getCancellationReason() { return cancellationReason; }
    public void setCancellationReason(String cancellationReason) { this.cancellationReason = cancellationReason; }
    
    public LocalDateTime getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
    
    public LocalDateTime getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
}
