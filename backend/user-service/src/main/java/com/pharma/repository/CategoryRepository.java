package com.pharma.repository;

import com.pharma.entity.Category;
import jakarta.inject.Singleton;
import jakarta.transaction.Transactional;
import java.util.List;

@Singleton
public class CategoryRepository {
    
    @Transactional
    public List<Category> findByParentId(Long parentId) {
        return Category.findByParentId(parentId);
    }
    
    @Transactional
    public List<Category> findByIsActiveTrue() {
        return Category.findByIsActiveTrue();
    }
    
    @Transactional
    public Category findBySlug(String slug) {
        return Category.findBySlug(slug);
    }
    
    @Transactional
    public boolean existsBySlug(String slug) {
        return Category.existsBySlug(slug);
    }
    
    @Transactional
    public void persist(Category category) {
        category.persist();
    }
    
    @Transactional
    public void deleteById(Long id) {
        Category.deleteById(id);
    }
}
