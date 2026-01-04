package com.pharma.repository;

import com.pharma.entity.Subscription;
import com.pharma.entity.SubscriptionStatus;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class SubscriptionRepository implements PanacheRepository<Subscription> {
    
    public List<Subscription> findByUserId(Long userId) {
        return list("userId", userId);
    }
    
    public List<Subscription> findByUserIdAndStatus(Long userId, SubscriptionStatus status) {
        return list("userId = ?1 and status = ?2", userId, status);
    }
    
    public List<Subscription> findByUserIdAndProductIdAndStatus(Long userId, Long productId, SubscriptionStatus status) {
        return list("userId = ?1 and product.id = ?2 and status = ?3", userId, productId, status);
    }
    
    public List<Subscription> findActiveSubscriptions() {
        return list("status", SubscriptionStatus.ACTIVE);
    }
    
    public List<Subscription> findByProductId(Long productId) {
        return list("product.id", productId);
    }
}
