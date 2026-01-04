package com.pharma.service;

import com.pharma.entity.Product;
import com.pharma.repository.ProductRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProductService {
    
    @Inject
    ProductRepository productRepository;
    
    @Transactional
    public List<Product> getAllActiveProducts() {
        return productRepository.findByIsActiveTrue();
    }
    
    @Transactional
    public Optional<Product> getProductById(Long id) {
        Product product = Product.findById(id);
        return product != null && product.isActive ? Optional.of(product) : Optional.empty();
    }
    
    @Transactional
    public Optional<Product> getProductBySku(String sku) {
        return Optional.ofNullable(productRepository.findBySkuIgnoreCase(sku));
    }
    
    @Transactional
    public List<Product> getProductsByCategory(Long categoryId) {
        return productRepository.findByCategoryIdAndIsActiveTrue(categoryId);
    }
    
    @Transactional
    public List<Product> getProductsByBrand(Long brandId) {
        return productRepository.findByBrandIdAndIsActiveTrue(brandId);
    }
    
    @Transactional
    public List<Product> getNonPrescriptionProducts() {
        return productRepository.findByPrescriptionRequiredFalseAndIsActiveTrue();
    }
    
    @Transactional
    public List<Product> getPrescriptionProducts() {
        return productRepository.findByPrescriptionRequiredTrueAndIsActiveTrue();
    }
    
    @Transactional
    public List<Product> searchProducts(String keyword) {
        return productRepository.searchProducts(keyword);
    }
    
    @Transactional
    public List<Product> getProductsWithValidPrices() {
        return productRepository.findProductsWithValidPrices();
    }
    
    @Transactional
    public List<Product> getInStockProducts() {
        return productRepository.findInStockProducts();
    }
    
    @Transactional
    public Product createProduct(Product product) {
        product.persist();
        return product;
    }
    
    @Transactional
    public Product updateProduct(Product product) {
        product.persist();
        return product;
    }
    
    @Transactional
    public boolean deleteProduct(Long id) {
        Optional<Product> product = getProductById(id);
        if (product.isPresent()) {
            Product.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean productExistsBySku(String sku) {
        return productRepository.existsBySku(sku);
    }
    
    @Transactional
    public long getActiveProductCount() {
        return productRepository.countActiveProducts();
    }
    
    @Transactional
    public long getPrescriptionProductCount() {
        return productRepository.countPrescriptionProducts();
    }
}
