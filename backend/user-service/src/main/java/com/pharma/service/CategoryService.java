package com.pharma.service;

import com.pharma.entity.Category;
import com.pharma.repository.CategoryRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import java.util.List;
import java.util.Optional;

@ApplicationScoped
public class CategoryService {
    
    @Inject
    CategoryRepository categoryRepository;
    
    @Transactional
    public List<Category> getAllActiveCategories() {
        return categoryRepository.findByIsActiveTrue();
    }
    
    @Transactional
    public Optional<Category> getCategoryById(Long id) {
        Category category = Category.findById(id);
        return category != null && category.isActive ? Optional.of(category) : Optional.empty();
    }
    
    @Transactional
    public Optional<Category> getCategoryBySlug(String slug) {
        return Optional.ofNullable(categoryRepository.findBySlug(slug));
    }
    
    @Transactional
    public List<Category> getRootCategories() {
        return categoryRepository.findByParentId(null);
    }
    
    @Transactional
    public List<Category> getSubCategories(Long parentId) {
        return categoryRepository.findByParentId(parentId);
    }
    
    @Transactional
    public Category createCategory(Category category) {
        category.persist();
        return category;
    }
    
    @Transactional
    public Category updateCategory(Category category) {
        category.persist();
        return category;
    }
    
    @Transactional
    public boolean deleteCategory(Long id) {
        Optional<Category> category = getCategoryById(id);
        if (category.isPresent()) {
            categoryRepository.deleteById(id);
            return true;
        }
        return false;
    }
    
    @Transactional
    public boolean categoryExistsBySlug(String slug) {
        return Category.existsBySlug(slug);
    }
}
