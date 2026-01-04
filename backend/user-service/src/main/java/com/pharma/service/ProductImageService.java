package com.pharma.service;

import com.pharma.entity.ProductImage;
import com.pharma.repository.ProductImageRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class ProductImageService {
    
    @Inject
    ProductImageRepository productImageRepository;
    
    @Transactional
    public List<ProductImage> getImagesByProductId(Long productId) {
        return productImageRepository.findByProductId(productId);
    }
    
    @Transactional
    public Optional<ProductImage> getPrimaryImageByProductId(Long productId) {
        return productImageRepository.findByProductIdAndIsPrimaryTrue(productId);
    }
    
    @Transactional
    public List<ProductImage> getImagesByProductIdOrderBySortOrder(Long productId) {
        return productImageRepository.findByProductIdOrderBySortOrderAsc(productId);
    }
    
    @Transactional
    public ProductImage createProductImage(ProductImage image) {
        productImageRepository.persist(image);
        return image;
    }
    
    @Transactional
    public ProductImage updateProductImage(ProductImage image) {
        productImageRepository.persist(image);
        return image;
    }
    
    @Transactional
    public boolean deleteProductImage(Long id) {
        ProductImage image = ProductImage.findById(id);
        if (image != null) {
            productImageRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public ProductImage setAsPrimary(Long imageId) {
        ProductImage image = ProductImage.findById(imageId);
        if (image != null) {
            // Remove primary flag from all images of this product
            List<ProductImage> productImages = getImagesByProductId(image.product.id);
            productImages.forEach(img -> {
                img.isPrimary = false;
                productImageRepository.persist(img);
            });
            
            // Set primary flag on selected image
            image.isPrimary = true;
            productImageRepository.persist(image);
        }
        return image;
    }
}
