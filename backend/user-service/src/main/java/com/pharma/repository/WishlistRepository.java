package com.pharma.repository;

import com.pharma.entity.WishlistItem;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;

@Singleton
public class WishlistRepository {
    
    @Transactional
    public List<WishlistItem> findByUserId(Long userId) {
        return WishlistItem.list("userId", userId);
    }
    
    @Transactional
    public void persist(WishlistItem wishlistItem) {
        wishlistItem.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        WishlistItem.deleteById(id);
    }
    
    @Transactional
    public void deleteByUserIdAndProductId(Long userId, Long productId) {
        WishlistItem.delete("userId = ?1 and product.id = ?2", userId, productId);
    }
}
