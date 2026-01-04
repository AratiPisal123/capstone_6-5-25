package com.pharma.repository;

import com.pharma.entity.Cart;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class CartRepository {
    
    @Transactional
    public List<Cart> findByUserId(Long userId) {
        return Cart.list("userId", userId);
    }
    
    @Transactional
    public Optional<Cart> findBySessionId(String sessionId) {
        return Cart.find("sessionId", sessionId).firstResultOptional();
    }
    
    @Transactional
    public List<Cart> findByStatus(Cart.CartStatus status) {
        return Cart.list("status", status);
    }
    
    @Transactional
    public void persist(Cart cart) {
        cart.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        Cart.deleteById(id);
    }
}
