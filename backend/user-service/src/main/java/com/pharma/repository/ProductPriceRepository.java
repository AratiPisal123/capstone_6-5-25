package com.pharma.repository;

import com.pharma.entity.ProductPrice;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Singleton
public class ProductPriceRepository {
    
    @Transactional
    public List<ProductPrice> findByProductId(Long productId) {
        return ProductPrice.findByProductId(productId);
    }
    
    @Transactional
    public Optional<ProductPrice> findCurrentPriceByProductId(Long productId) {
        ProductPrice price = ProductPrice.findCurrentPriceByProductId(productId);
        return Optional.ofNullable(price);
    }
    
    @Transactional
    public void persist(ProductPrice price) {
        price.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        ProductPrice.deleteById(id);
    }
}
