package com.pharma.dto;

import java.time.LocalDate;
import java.math.BigDecimal;

public class SubscriptionDTO {
    private Long id;
    private Long userId;
    private ProductDTO product;
    private Integer quantity;
    private String frequency;
    private BigDecimal unitPrice;
    private BigDecimal discountPercentage;
    private LocalDate startDate;
    private LocalDate endDate;
    private LocalDate nextDeliveryDate;
    private LocalDate lastDeliveryDate;
    private Integer totalDeliveries;
    private Integer remainingDeliveries;
    private String deliveryAddress;
    private String specialInstructions;
    private String status;
    private LocalDate createdAt;
    private LocalDate updatedAt;

    // Getters and Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
    public Long getUserId() { return userId; }
    public void setUserId(Long userId) { this.userId = userId; }
    
    public ProductDTO getProduct() { return product; }
    public void setProduct(ProductDTO product) { this.product = product; }
    
    public Integer getQuantity() { return quantity; }
    public void setQuantity(Integer quantity) { this.quantity = quantity; }
    
    public String getFrequency() { return frequency; }
    public void setFrequency(String frequency) { this.frequency = frequency; }
    
    public BigDecimal getUnitPrice() { return unitPrice; }
    public void setUnitPrice(BigDecimal unitPrice) { this.unitPrice = unitPrice; }
    
    public BigDecimal getDiscountPercentage() { return discountPercentage; }
    public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }
    
    public LocalDate getStartDate() { return startDate; }
    public void setStartDate(LocalDate startDate) { this.startDate = startDate; }
    
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
    
    public String getStatus() { return status; }
    public void setStatus(String status) { this.status = status; }
    
    public LocalDate getCreatedAt() { return createdAt; }
    public void setCreatedAt(LocalDate createdAt) { this.createdAt = createdAt; }
    
    public LocalDate getUpdatedAt() { return updatedAt; }
    public void setUpdatedAt(LocalDate updatedAt) { this.updatedAt = updatedAt; }
}
