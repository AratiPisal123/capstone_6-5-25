package com.pharma.service;

import com.pharma.entity.Warehouse;
import com.pharma.repository.WarehouseRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class WarehouseService {
    
    @Inject
    WarehouseRepository warehouseRepository;
    
    @Transactional
    public List<Warehouse> getAllActiveWarehouses() {
        return warehouseRepository.findByIsActiveTrue();
    }
    
    @Transactional
    public Optional<Warehouse> getWarehouseById(Long id) {
        Warehouse warehouse = Warehouse.findById(id);
        return warehouse != null && warehouse.isActive ? Optional.of(warehouse) : Optional.empty();
    }
    
    @Transactional
    public Optional<Warehouse> getWarehouseByCode(String code) {
        return Optional.ofNullable(warehouseRepository.findByCode(code));
    }
    
    @Transactional
    public Warehouse createWarehouse(Warehouse warehouse) {
        warehouseRepository.persist(warehouse);
        return warehouse;
    }
    
    @Transactional
    public Warehouse updateWarehouse(Warehouse warehouse) {
        warehouseRepository.persist(warehouse);
        return warehouse;
    }
    
    @Transactional
    public boolean deleteWarehouse(Long id) {
        Optional<Warehouse> warehouse = getWarehouseById(id);
        if (warehouse.isPresent()) {
            warehouseRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean warehouseExistsByCode(String code) {
        return Warehouse.existsByCode(code);
    }
}
