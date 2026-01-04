package com.pharma.repository;

import com.pharma.entity.Warehouse;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;

@Singleton
public class WarehouseRepository {
    
    @Transactional
    public List<Warehouse> findByIsActiveTrue() {
        return Warehouse.findByIsActiveTrue();
    }
    
    @Transactional
    public Warehouse findByCode(String code) {
        return Warehouse.findByCode(code);
    }
    
    @Transactional
    public boolean existsByCode(String code) {
        return Warehouse.existsByCode(code);
    }
    
    @Transactional
    public void persist(Warehouse warehouse) {
        warehouse.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        Warehouse.deleteById(id);
    }
}
