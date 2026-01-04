package com.pharma.service;

import com.pharma.entity.Brand;
import com.pharma.repository.BrandRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class BrandService {
    
    @Inject
    BrandRepository brandRepository;
    
    @Transactional
    public List<Brand> getAllActiveBrands() {
        return brandRepository.findByIsActiveTrue();
    }
    
    @Transactional
    public Optional<Brand> getBrandById(Long id) {
        Brand brand = Brand.findById(id);
        return brand != null && brand.isActive ? Optional.of(brand) : Optional.empty();
    }
    
    @Transactional
    public Optional<Brand> getBrandByName(String name) {
        return Optional.ofNullable(brandRepository.findByName(name));
    }
    
    @Transactional
    public Brand createBrand(Brand brand) {
        brand.persist();
        return brand;
    }
    
    @Transactional
    public Brand updateBrand(Brand brand) {
        brand.persist();
        return brand;
    }
    
    @Transactional
    public boolean deleteBrand(Long id) {
        Optional<Brand> brand = getBrandById(id);
        if (brand.isPresent()) {
            brandRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean brandExistsByName(String name) {
        return Brand.existsByName(name);
    }
}
