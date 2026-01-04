package com.pharma.service;

import com.pharma.entity.WishlistItem;
import com.pharma.entity.Product;
import com.pharma.repository.WishlistRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class WishlistService {
    
    @Inject
    WishlistRepository wishlistRepository;
    
    @Inject
    EntityManager em;
    
    @Transactional
    public List<WishlistItem> getWishlistByUserId(Long userId) {
        return wishlistRepository.findByUserId(userId);
    }
    
    @Transactional
    public Optional<WishlistItem> getWishlistItemById(Long id) {
        return Optional.ofNullable(em.find(WishlistItem.class, id));
    }
    
    @Transactional
    public WishlistItem addToWishlist(Long userId, Long productId) {
        // Check if item already exists in wishlist
        List<WishlistItem> existingItems = getWishlistByUserId(userId);
        boolean alreadyExists = existingItems.stream()
                .anyMatch(item -> item.getProduct() != null && item.getProduct().id.equals(productId));
        
        if (alreadyExists) {
            return null; // Already in wishlist
        }
        
        WishlistItem wishlistItem = new WishlistItem();
        wishlistItem.setUserId(userId);
        wishlistItem.setProduct(em.find(Product.class, productId));
        wishlistRepository.persist(wishlistItem);
        return wishlistItem;
    }
    
    @Transactional
    public boolean removeFromWishlist(Long userId, Long productId) {
        List<WishlistItem> items = getWishlistByUserId(userId);
        Optional<WishlistItem> itemToRemove = items.stream()
                .filter(item -> item.getProduct() != null && item.getProduct().id.equals(productId))
                .findFirst();
        
        if (itemToRemove.isPresent()) {
            wishlistRepository.deleteById(itemToRemove.get().getId());
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean removeWishlistItem(Long itemId) {
        WishlistItem item = WishlistItem.findById(itemId);
        if (item != null) {
            wishlistRepository.deleteById(itemId);
            return true;
        }
        return false;
    }
    
    @Transactional
    public void clearWishlist(Long userId) {
        List<WishlistItem> items = getWishlistByUserId(userId);
        items.forEach(item -> wishlistRepository.deleteById(item.getId()));
    }
    
    @Transactional
    public boolean isInWishlist(Long userId, Long productId) {
        List<WishlistItem> items = getWishlistByUserId(userId);
        return items.stream()
                .anyMatch(item -> item.getProduct() != null && item.getProduct().id.equals(productId));
    }
    
    @Transactional
    public int getWishlistCount(Long userId) {
        return getWishlistByUserId(userId).size();
    }
}
