package com.pharma.user.repository;

import com.pharma.user.entity.Address;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.List;

@ApplicationScoped
public class AddressRepository implements PanacheRepository<Address> {

    public List<Address> findByUserId(Long userId) {
        return list("user.id", userId);
    }

    public Address findDefaultByUserId(Long userId) {
        return find("user.id = ?1 and isDefault = true", userId).firstResult();
    }
}
