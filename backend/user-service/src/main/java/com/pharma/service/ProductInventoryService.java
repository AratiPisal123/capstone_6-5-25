package com.pharma.service;

import com.pharma.entity.ProductInventory;
import com.pharma.repository.ProductInventoryRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProductInventoryService {
    
    @Inject
    ProductInventoryRepository productInventoryRepository;
    
    @Transactional
    public List<ProductInventory> getInventoryByProductId(Long productId) {
        return productInventoryRepository.findByProductId(productId);
    }
    
    @Transactional
    public List<ProductInventory> getInventoryByWarehouseId(Long warehouseId) {
        return productInventoryRepository.findByWarehouseId(warehouseId);
    }
    
    @Transactional
    public Integer getTotalStockByProductId(Long productId) {
        return productInventoryRepository.getTotalStockByProductId(productId);
    }
    
    @Transactional
    public List<ProductInventory> getAvailableStockByProductId(Long productId) {
        return productInventoryRepository.findAvailableStockByProductId(productId);
    }
    
    @Transactional
    public List<ProductInventory> getLowStockItems() {
        return productInventoryRepository.findLowStockItems();
    }
    
    @Transactional
    public List<ProductInventory> getExpiringStock(LocalDate date) {
        return productInventoryRepository.findExpiringStock(date);
    }
    
    @Transactional
    public List<ProductInventory> getStockExpiringInDateRange(LocalDate startDate, LocalDate endDate) {
        return productInventoryRepository.findStockExpiringInDateRange(startDate, endDate);
    }
    
    @Transactional
    public ProductInventory createInventory(ProductInventory inventory) {
        productInventoryRepository.persist(inventory);
        return inventory;
    }
    
    @Transactional
    public ProductInventory updateInventory(ProductInventory inventory) {
        productInventoryRepository.persist(inventory);
        return inventory;
    }
    
    @Transactional
    public boolean deleteInventory(Long id) {
        ProductInventory inventory = ProductInventory.findById(id);
        if (inventory != null) {
            productInventoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean addStock(Long inventoryId, Integer quantity) {
        ProductInventory inventory = ProductInventory.findById(inventoryId);
        if (inventory != null) {
            inventory.addStock(quantity);
            productInventoryRepository.persist(inventory);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean removeStock(Long inventoryId, Integer quantity) {
        ProductInventory inventory = ProductInventory.findById(inventoryId);
        if (inventory != null) {
            boolean success = inventory.removeStock(quantity);
            if (success) {
                productInventoryRepository.persist(inventory);
            }
            return success;
        }
        return false;
    }
    
    @Transactional
    public void updateLowStockAlerts() {
        List<ProductInventory> lowStockItems = getLowStockItems();
        // Here you could implement notification logic
        // For example: send email, create alert, etc.
    }
    
    @Transactional
    public void updateExpiryAlerts() {
        LocalDate thirtyDaysFromNow = LocalDate.now().plusDays(30);
        List<ProductInventory> expiringItems = getExpiringStock(thirtyDaysFromNow);
        // Here you could implement notification logic
        // For example: send email, create alert, etc.
    }
}
