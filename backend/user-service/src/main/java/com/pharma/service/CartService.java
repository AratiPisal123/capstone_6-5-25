package com.pharma.service;

import com.pharma.entity.Cart;
import com.pharma.entity.CartItem;
import com.pharma.entity.Product;
import com.pharma.repository.CartRepository;
import com.pharma.repository.CartItemRepository;
import com.pharma.repository.ProductRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CartService {
    
    @Inject
    CartRepository cartRepository;
    
    @Inject
    CartItemRepository cartItemRepository;
    
    @Inject
    ProductRepository productService;
    
    @Transactional
    public Optional<Cart> getActiveCartByUserId(Long userId) {
        List<Cart> carts = cartRepository.findByUserId(userId);
        return carts.stream()
                .filter(Cart::isActive)
                .findFirst();
    }
    
    @Transactional
    public Optional<Cart> getCartBySessionId(String sessionId) {
        return cartRepository.findBySessionId(sessionId);
    }
    
    @Transactional
    public List<CartItem> getCartItems(Long cartId) {
        return cartItemRepository.findByCartId(cartId);
    }
    
    @Transactional
    public Cart createCart(Long userId, String sessionId) {
        Cart cart = new Cart();
        cart.userId = userId;
        cart.sessionId = sessionId;
        cart.status = Cart.CartStatus.ACTIVE;
        cartRepository.persist(cart);
        return cart;
    }
    
    @Transactional
    public CartItem addToCart(Long userId, String sessionId, Long productId, Integer quantity) {
        // Validate product exists
        Product product = Product.findById(productId);
        if (product == null || !Boolean.TRUE.equals(product.isActive)) {
            throw new IllegalArgumentException("Product not found or inactive");
        }
        
        // Find or create cart
        Cart cart = findOrCreateCart(userId, sessionId);
        
        // Check if item already exists in cart
        Optional<CartItem> existingItem = cartItemRepository.findByCartIdAndProductId(cart.id, productId);
        
        if (existingItem.isPresent()) {
            CartItem item = existingItem.get();
            item.updateQuantity(item.quantity + quantity);
            cartItemRepository.persist(item);
            return item;
        } else {
            CartItem newItem = new CartItem();
            newItem.cart = cart;
            newItem.product = product;
            newItem.quantity = quantity;
            newItem.unitPriceSnapshot = product.getCurrentPrice();
            cartItemRepository.persist(newItem);
            return newItem;
        }
    }
    
    @Transactional
    public Optional<CartItem> updateCartItem(Long itemId, Integer quantity) {
        Optional<CartItem> itemOpt = Optional.ofNullable(CartItem.findById(itemId));
        if (itemOpt.isPresent()) {
            CartItem item = itemOpt.get();
            item.updateQuantity(quantity);
            cartItemRepository.persist(item);
        }
        return itemOpt;
    }
    
    @Transactional
    public boolean removeCartItem(Long itemId) {
        CartItem item = CartItem.findById(itemId);
        if (item != null) {
            cartItemRepository.deleteById(itemId);
            return true;
        }
        return false;
    }
    
    @Transactional
    public void clearCart(Long userId, String sessionId) {
        Optional<Cart> cart = findActiveCart(userId, sessionId);
        if (cart.isPresent()) {
            List<CartItem> items = cartItemRepository.findByCartId(cart.get().id);
            items.forEach(item -> cartItemRepository.deleteById(item.id));
        }
    }
    
    @Transactional
    public void markCartAsConverted(Long cartId) {
        Optional<Cart> cartOpt = Optional.ofNullable(Cart.findById(cartId));
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.markAsConverted();
            cartRepository.persist(cart);
        }
    }
    
    @Transactional
    public void markCartAsAbandoned(Long cartId) {
        Optional<Cart> cartOpt = Optional.ofNullable(Cart.findById(cartId));
        if (cartOpt.isPresent()) {
            Cart cart = cartOpt.get();
            cart.markAsAbandoned();
            cartRepository.persist(cart);
        }
    }
    
    private Cart findOrCreateCart(Long userId, String sessionId) {
        Optional<Cart> cart = findActiveCart(userId, sessionId);
        
        if (cart.isEmpty()) {
            return createCart(userId, sessionId);
        }
        
        return cart.get();
    }
    
    private Optional<Cart> findActiveCart(Long userId, String sessionId) {
        if (userId != null) {
            return getActiveCartByUserId(userId);
        } else if (sessionId != null) {
            return getCartBySessionId(sessionId);
        }
        return Optional.empty();
    }
}
