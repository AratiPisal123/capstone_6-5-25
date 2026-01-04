package com.pharma.repository;

import com.pharma.entity.CartItem;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class CartItemRepository {
    
    @Transactional
    public List<CartItem> findByCartId(Long cartId) {
        return CartItem.list("cart.id", cartId);
    }
    
    @Transactional
    public Optional<CartItem> findByCartIdAndProductId(Long cartId, Long productId) {
        return CartItem.find("cart.id = ?1 and product.id = ?2", cartId, productId).firstResultOptional();
    }
    
    @Transactional
    public void persist(CartItem cartItem) {
        cartItem.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        CartItem.deleteById(id);
    }
}
