package com.pharma.repository;

import com.pharma.entity.FAQ;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.persistence.EntityManager;
import jakarta.inject.Inject;

import java.util.List;

@ApplicationScoped
public class FAQRepository implements PanacheRepository<FAQ> {
    
    @Inject
    EntityManager entityManager;
    
    public List<FAQ> findByIsActiveTrueOrderByPriorityDesc() {
        return list("isActive", true);
    }
    
    public List<FAQ> findByCategoryAndIsActiveTrueOrderByPriorityDesc(String category) {
        return list("category = ?1 and isActive = ?2", category, true);
    }
    
    public List<FAQ> searchFAQs(String search) {
        return list("isActive = true and (LOWER(question) LIKE LOWER(?1) OR LOWER(answer) LIKE LOWER(?1))", 
                   "%" + search.toLowerCase() + "%");
    }
    
    public List<String> findActiveCategories() {
        return entityManager.createQuery("SELECT DISTINCT f.category FROM FAQ f WHERE f.isActive = true ORDER BY f.category", String.class)
                          .getResultList();
    }
}
