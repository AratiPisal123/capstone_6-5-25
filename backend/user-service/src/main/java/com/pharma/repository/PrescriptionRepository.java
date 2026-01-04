package com.pharma.repository;

import com.pharma.entity.Prescription;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@Singleton
public class PrescriptionRepository {
    
    @Transactional
    public List<Prescription> findByUserId(Long userId) {
        return Prescription.list("userId", userId);
    }
    
    @Transactional
    public List<Prescription> findByStatus(Prescription.PrescriptionStatus status) {
        return Prescription.list("status", status);
    }
    
    @Transactional
    public Optional<Prescription> findById(Long id) {
        return Prescription.findByIdOptional(id);
    }
    
    @Transactional
    public void persist(Prescription prescription) {
        prescription.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        Prescription.deleteById(id);
    }
}
