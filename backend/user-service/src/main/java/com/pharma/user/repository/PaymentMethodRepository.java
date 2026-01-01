package com.pharma.user.repository;

import com.pharma.user.entity.PaymentMethod;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class PaymentMethodRepository implements PanacheRepository<PaymentMethod> {

    public List<PaymentMethod> findByUserId(Long userId) {
        return list("user.id", userId);
    }

    public PaymentMethod findDefaultByUserId(Long userId) {
        return find("user.id = ?1 and isDefault = true", userId).firstResult();
    }
}
