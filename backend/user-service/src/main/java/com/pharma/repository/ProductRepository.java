package com.pharma.repository;

import com.pharma.entity.Product;
import io.quarkus.panache.common.Page;
import io.quarkus.panache.common.Parameters;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.util.List;

import jakarta.inject.Singleton;

@Singleton
public class ProductRepository {
    
    @Transactional
    public List<Product> findByIsActiveTrue() {
        return Product.list("isActive", true);
    }
    
    @Transactional
    public List<Product> findByCategoryIdAndIsActiveTrue(Long categoryId) {
        return Product.list("categoryId = ?1 and isActive = true", categoryId);
    }
    
    @Transactional
    public List<Product> findByBrandIdAndIsActiveTrue(Long brandId) {
        return Product.list("brandId = ?1 and isActive = true", brandId);
    }
    
    @Transactional
    public List<Product> findByPrescriptionRequiredFalseAndIsActiveTrue() {
        return Product.list("prescriptionRequired = false and isActive = true");
    }
    
    @Transactional
    public List<Product> findByPrescriptionRequiredTrueAndIsActiveTrue() {
        return Product.list("prescriptionRequired = true and isActive = true");
    }
    
    @Transactional
    public List<Product> searchProducts(String keyword) {
        return Product.list("LOWER(name) LIKE LOWER(?1) or LOWER(description) LIKE LOWER(?2)", keyword, keyword);
    }
    
    @Transactional
    public List<Product> findProductsWithValidPrices() {
        return Product.list("isActive = true and exists (select 1 from ProductPrice pp where pp.product.id = id and pp.validFrom <= CURRENT_TIMESTAMP and (pp.validTo is null or pp.validTo >= CURRENT_TIMESTAMP))");
    }
    
    @Transactional
    public List<Product> findInStockProducts() {
        return Product.list("isActive = true and exists (select 1 from ProductInventory pi where pi.product.id = id and pi.quantityAvailable > 0)");
    }
    
    @Transactional
    public Product findBySkuIgnoreCase(String sku) {
        // Remove any trailing/leading whitespace and convert to uppercase for comparison
        String normalizedSku = sku != null ? sku.trim().toUpperCase() : null;
        return Product.find("sku COLLATE utf8mb4_unicode_ci", normalizedSku).firstResult();
    }
    
    @Transactional
    public boolean existsBySku(String sku) {
        return Product.count("sku", sku) > 0;
    }
    
    @Transactional
    public long countActiveProducts() {
        return Product.count("isActive", true);
    }
    
    @Transactional
    public long countPrescriptionProducts() {
        return Product.count("isActive = true and prescriptionRequired = true");
    }
}
