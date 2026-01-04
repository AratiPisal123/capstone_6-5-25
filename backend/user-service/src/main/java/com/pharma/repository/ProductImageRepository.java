package com.pharma.repository;

import com.pharma.entity.ProductImage;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class ProductImageRepository {
    
    @Transactional
    public List<ProductImage> findByProductId(Long productId) {
        return ProductImage.findByProductId(productId);
    }
    
    @Transactional
    public Optional<ProductImage> findByProductIdAndIsPrimaryTrue(Long productId) {
        ProductImage image = ProductImage.findByProductIdAndIsPrimaryTrue(productId);
        return Optional.ofNullable(image);
    }
    
    @Transactional
    public List<ProductImage> findByProductIdOrderBySortOrderAsc(Long productId) {
        return ProductImage.findByProductIdOrderBySortOrderAsc(productId);
    }
    
    @Transactional
    public void persist(ProductImage image) {
        image.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        ProductImage.deleteById(id);
    }
}
