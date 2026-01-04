package com.pharma.service;

import com.pharma.entity.Prescription;
import com.pharma.repository.PrescriptionRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class PrescriptionService {
    
    @Inject
    PrescriptionRepository prescriptionRepository;
    
    @Transactional
    public List<Prescription> getPrescriptionsByUserId(Long userId) {
        return prescriptionRepository.findByUserId(userId);
    }
    
    @Transactional
    public List<Prescription> getPrescriptionsByStatus(Prescription.PrescriptionStatus status) {
        return prescriptionRepository.findByStatus(status);
    }
    
    @Transactional
    public Optional<Prescription> getPrescriptionById(Long id) {
        return prescriptionRepository.findById(id);
    }
    
    @Transactional
    public Prescription createPrescription(Prescription prescription) {
        prescriptionRepository.persist(prescription);
        return prescription;
    }
    
    @Transactional
    public Prescription updatePrescription(Prescription prescription) {
        prescriptionRepository.persist(prescription);
        return prescription;
    }
    
    @Transactional
    public boolean approvePrescription(Long prescriptionId, Long reviewedBy, String reviewNotes) {
        Optional<Prescription> prescriptionOpt = getPrescriptionById(prescriptionId);
        if (prescriptionOpt.isPresent()) {
            Prescription prescription = prescriptionOpt.get();
            prescription.approve(reviewedBy, reviewNotes);
            prescriptionRepository.persist(prescription);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean rejectPrescription(Long prescriptionId, Long reviewedBy, String reviewNotes) {
        Optional<Prescription> prescriptionOpt = getPrescriptionById(prescriptionId);
        if (prescriptionOpt.isPresent()) {
            Prescription prescription = prescriptionOpt.get();
            prescription.reject(reviewedBy, reviewNotes);
            prescriptionRepository.persist(prescription);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean deletePrescription(Long id) {
        Optional<Prescription> prescription = getPrescriptionById(id);
        if (prescription.isPresent()) {
            prescriptionRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public List<Prescription> getExpiredPrescriptions() {
        return getPrescriptionsByStatus(Prescription.PrescriptionStatus.EXPIRED);
    }
    
    @Transactional
    public List<Prescription> getPendingReviewPrescriptions() {
        return getPrescriptionsByStatus(Prescription.PrescriptionStatus.UNDER_REVIEW);
    }
    
    @Transactional
    public List<Prescription> getApprovedPrescriptions() {
        return getPrescriptionsByStatus(Prescription.PrescriptionStatus.APPROVED);
    }
    
    @Transactional
    public void markExpiredPrescriptions() {
        List<Prescription> allPrescriptions = prescriptionRepository.findByUserId(null); // Get all prescriptions
        LocalDate now = LocalDate.now();
        
        allPrescriptions.stream()
                .filter(p -> p.validUntil != null && p.validUntil.isBefore(now))
                .forEach(p -> {
                    p.markAsExpired();
                    prescriptionRepository.persist(p);
                });
    }
}
