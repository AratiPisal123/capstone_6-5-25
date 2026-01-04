package com.pharma.service;

import com.pharma.entity.Product;
import com.pharma.entity.ProductPrice;
import com.pharma.repository.ProductPriceRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProductPriceService {
    
    @Inject
    ProductPriceRepository productPriceRepository;
    
    @Transactional
    public List<ProductPrice> getPricesByProductId(Long productId) {
        return productPriceRepository.findByProductId(productId);
    }
    
    @Transactional
    public Optional<ProductPrice> getCurrentPriceByProductId(Long productId) {
        return productPriceRepository.findCurrentPriceByProductId(productId);
    }
    
    @Transactional
    public ProductPrice createProductPrice(ProductPrice price) {
        if (price.validFrom == null) {
            price.validFrom = LocalDateTime.now();
        }
        productPriceRepository.persist(price);
        return price;
    }
    
    @Transactional
    public ProductPrice updateProductPrice(ProductPrice price) {
        productPriceRepository.persist(price);
        return price;
    }
    
    @Transactional
    public boolean deleteProductPrice(Long id) {
        ProductPrice price = ProductPrice.findById(id);
        if (price != null) {
            productPriceRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public ProductPrice createNewPriceForProduct(Long productId, java.math.BigDecimal mrp, java.math.BigDecimal salePrice) {
        ProductPrice price = new ProductPrice();
        price.product = Product.findById(productId);
        price.currency = "INR";
        price.mrp = mrp;
        price.salePrice = salePrice;
        price.validFrom = LocalDateTime.now();
        
        return createProductPrice(price);
    }
    
    @Transactional
    public void deactivateOldPrices(Long productId) {
        List<ProductPrice> prices = getPricesByProductId(productId);
        LocalDateTime now = LocalDateTime.now();
        
        prices.stream()
                .filter(p -> p.validTo == null || p.validTo.isAfter(now))
                .forEach(p -> {
                    p.validTo = now.minusDays(1);
                    productPriceRepository.persist(p);
                });
    }
    
    @Transactional
    public java.math.BigDecimal getEffectivePrice(Long productId) {
        Optional<ProductPrice> currentPrice = getCurrentPriceByProductId(productId);
        return currentPrice.map(ProductPrice::getCurrentPrice).orElse(java.math.BigDecimal.ZERO);
    }
}
