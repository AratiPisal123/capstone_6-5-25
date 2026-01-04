package com.pharma.repository;

import com.pharma.entity.Brand;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;

@Singleton
public class BrandRepository {
    
    @Transactional
    public List<Brand> findByIsActiveTrue() {
        return Brand.findByIsActiveTrue();
    }
    
    @Transactional
    public Brand findByName(String name) {
        return Brand.findByName(name);
    }
    
    @Transactional
    public boolean existsByName(String name) {
        return Brand.existsByName(name);
    }
    
    @Transactional
    public void persist(Brand brand) {
        brand.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        Brand.deleteById(id);
    }
}
