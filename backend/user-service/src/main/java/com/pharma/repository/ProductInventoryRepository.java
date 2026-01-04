package com.pharma.repository;

import com.pharma.entity.ProductInventory;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;

@Singleton
public class ProductInventoryRepository {
    
    @Transactional
    public List<ProductInventory> findByProductId(Long productId) {
        return ProductInventory.findByProductId(productId);
    }
    
    @Transactional
    public List<ProductInventory> findByWarehouseId(Long warehouseId) {
        return ProductInventory.findByWarehouseId(warehouseId);
    }
    
    @Transactional
    public Integer getTotalStockByProductId(Long productId) {
        return ProductInventory.getTotalStockByProductId(productId);
    }
    
    @Transactional
    public List<ProductInventory> findAvailableStockByProductId(Long productId) {
        return ProductInventory.findAvailableStockByProductId(productId);
    }
    
    @Transactional
    public List<ProductInventory> findLowStockItems() {
        return ProductInventory.findLowStockItems();
    }
    
    @Transactional
    public List<ProductInventory> findExpiringStock(LocalDate date) {
        return ProductInventory.findExpiringStock(date);
    }
    
    @Transactional
    public List<ProductInventory> findStockExpiringInDateRange(LocalDate startDate, LocalDate endDate) {
        return ProductInventory.findStockExpiringInDateRange(startDate, endDate);
    }
    
    @Transactional
    public void persist(ProductInventory inventory) {
        inventory.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        ProductInventory.deleteById(id);
    }
}
