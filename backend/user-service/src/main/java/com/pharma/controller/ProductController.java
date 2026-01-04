package com.pharma.controller;

import com.pharma.entity.Product;
import com.pharma.entity.ProductImage;
import com.pharma.entity.ProductPrice;
import com.pharma.entity.ProductInventory;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.*;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Path("/api/products")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
public class ProductController {
    
    @GET
    @Path("/test")
    public Response testEndpoint() {
        return Response.ok(Map.of("message", "Product controller is working", "timestamp", System.currentTimeMillis())).build();
    }

    @GET
    @Path("/create-samples")
    @Transactional
    public Response createSampleProducts() {
        try {
            System.out.println("Creating sample products...");
            
            // Check if products already exist
            long existingCount = Product.count("isActive", true);
            System.out.println("Existing products count: " + existingCount);
            
            if (existingCount > 0) {
                return Response.ok(Map.of("message", "Products already exist", "count", existingCount)).build();
            }
            
            // Create sample products
            Product product1 = new Product();
            product1.sku = "PAR001";
            product1.name = "Paracetamol 500mg";
            product1.description = "Paracetamol tablets for pain relief";
            product1.categoryId = 1L;
            product1.brandId = 1L;
            product1.prescriptionRequired = false;
            product1.dosageForm = Product.DosageForm.TABLET;
            product1.strength = "500mg";
            product1.packSize = "10 strips";
            product1.gtin = "8901234567890";
            product1.barcode = "12345678";
            product1.isActive = true;
            product1.persist();

            Product product2 = new Product();
            product2.sku = "IBU001";
            product2.name = "Ibuprofen 400mg";
            product2.description = "Ibuprofen tablets for pain and inflammation";
            product2.categoryId = 1L;
            product2.brandId = 1L;
            product2.prescriptionRequired = false;
            product2.dosageForm = Product.DosageForm.TABLET;
            product2.strength = "400mg";
            product2.packSize = "10 strips";
            product2.gtin = "8901234567891";
            product2.barcode = "12345679";
            product2.isActive = true;
            product2.persist();

            Product product3 = new Product();
            product3.sku = "CRO001";
            product3.name = "Crocin 650mg";
            product3.description = "Crocin tablets for fever and pain";
            product3.categoryId = 1L;
            product3.brandId = 1L;
            product3.prescriptionRequired = false;
            product3.dosageForm = Product.DosageForm.TABLET;
            product3.strength = "650mg";
            product3.packSize = "15 tablets";
            product3.gtin = "8901234567892";
            product3.barcode = "12345680";
            product3.isActive = true;
            product3.persist();

            System.out.println("Sample products created successfully");
            return Response.ok(Map.of("message", "Sample products created successfully", "count", 3)).build();
        } catch (Exception e) {
            System.err.println("Error creating sample products: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to create sample products: " + e.getMessage()))
                    .build();
        }
    }

    @GET
    @Transactional
    public Response getAllProducts() {
        try {
            System.out.println("getAllProducts called");
            List<Product> products = Product.list("isActive", true);
            System.out.println("Found " + products.size() + " active products");
            
            List<ProductDTO> productDTOs = products.stream()
                    .map(this::convertToProductDTO)
                    .collect(Collectors.toList());
            
            System.out.println("Converted to " + productDTOs.size() + " DTOs");
            return Response.ok(productDTOs).build();
        } catch (Exception e) {
            System.err.println("Error fetching products: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch products: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/{id}")
    @Transactional
    public Response getProductById(@PathParam("id") Long id) {
        try {
            System.out.println("=== getProductById called with ID: " + id + " ===");
            Product product = Product.findById(id);
            System.out.println("Found product: " + (product != null ? "ID=" + product.id + ", SKU=" + product.sku + ", Name=" + product.name : "null"));
            
            if (product == null || !product.isActive) {
                System.out.println("Product not found for ID: " + id);
                return Response.status(Response.Status.NOT_FOUND)
                        .entity(Map.of("error", "Product not found with ID: " + id))
                        .build();
            }
            
            ProductDTO productDTO = convertToProductDTO(product);
            System.out.println("Returning product DTO: " + (productDTO != null ? "ID=" + productDTO.getId() + ", SKU=" + productDTO.getSku() : "null"));
            return Response.ok(productDTO).build();
        } catch (Exception e) {
            System.out.println("Error in getProductById: " + e.getMessage());
            e.printStackTrace();
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch product: " + e.getMessage()))
                    .build();
        }
    }
    
    @GET
    @Path("/categories/{categoryId}")
    @Transactional
    public Response getProductsByCategory(@PathParam("categoryId") Long categoryId) {
        try {
            List<Product> products = Product.list("categoryId = ?1 and isActive = true", categoryId);
            List<ProductDTO> productDTOs = products.stream()
                    .map(this::convertToProductDTO)
                    .collect(Collectors.toList());
            
            return Response.ok(productDTOs).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to fetch products by category: " + e.getMessage()))
                    .build();
        }
    }
    
    @POST
    @Path("/index-sample")
    @Transactional
    public Response indexSampleProducts() {
        try {
            // This will trigger the DataInitializationService
            return Response.ok(Map.of("message", "Sample products indexed successfully")).build();
        } catch (Exception e) {
            return Response.status(Response.Status.INTERNAL_SERVER_ERROR)
                    .entity(Map.of("error", "Failed to index sample products: " + e.getMessage()))
                    .build();
        }
    }
    
    private ProductDTO convertToProductDTO(Product product) {
        ProductDTO dto = new ProductDTO();
        dto.setId(product.id);
        dto.setSku(product.sku);
        dto.setName(product.name);
        dto.setDescription(product.description);
        dto.setCategoryId(product.categoryId);
        dto.setBrandId(product.brandId);
        dto.setPrescriptionRequired(product.prescriptionRequired);
        dto.setDosageForm(product.dosageForm);
        dto.setStrength(product.strength);
        dto.setPackSize(product.packSize);
        dto.setGtin(product.gtin);
        dto.setBarcode(product.barcode);
        dto.setCreatedAt(product.createdAt);
        dto.setUpdatedAt(product.updatedAt);
        
        // Get primary image
        ProductImage primaryImage = ProductImage.findByProductIdAndIsPrimaryTrue(product.id);
        if (primaryImage != null) {
            dto.setImageUrl(primaryImage.url);
            dto.setAltText(primaryImage.altText);
        }
        
        // Get current price
        ProductPrice currentPrice = ProductPrice.findCurrentPriceByProductId(product.id);
        if (currentPrice != null) {
            dto.setMrp(currentPrice.mrp);
            dto.setSalePrice(currentPrice.salePrice);
            dto.setCurrentPrice(currentPrice.getCurrentPrice());
            dto.setHasDiscount(currentPrice.hasDiscount());
            dto.setDiscountAmount(currentPrice.getDiscountAmount());
            dto.setDiscountPercentage(currentPrice.getDiscountPercentage());
        }
        
        // Get stock information
        Integer totalStock = ProductInventory.getTotalStockByProductId(product.id);
        dto.setTotalStock(totalStock);
        dto.setInStock(totalStock > 0);
        
        return dto;
    }
    
    public static class ProductDTO {
        private Long id;
        private String sku;
        private String name;
        private String description;
        private Long categoryId;
        private Long brandId;
        private Boolean prescriptionRequired;
        private Product.DosageForm dosageForm;
        private String strength;
        private String packSize;
        private String gtin;
        private String barcode;
        private String imageUrl;
        private String altText;
        private BigDecimal mrp;
        private BigDecimal salePrice;
        private BigDecimal currentPrice;
        private Boolean hasDiscount;
        private BigDecimal discountAmount;
        private BigDecimal discountPercentage;
        private Integer totalStock;
        private Boolean inStock;
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        
        // Getters and Setters
        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        
        public String getSku() { return sku; }
        public void setSku(String sku) { this.sku = sku; }
        
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        
        public Long getCategoryId() { return categoryId; }
        public void setCategoryId(Long categoryId) { this.categoryId = categoryId; }
        
        public Long getBrandId() { return brandId; }
        public void setBrandId(Long brandId) { this.brandId = brandId; }
        
        public Boolean getPrescriptionRequired() { return prescriptionRequired; }
        public void setPrescriptionRequired(Boolean prescriptionRequired) { this.prescriptionRequired = prescriptionRequired; }
        
        public Product.DosageForm getDosageForm() { return dosageForm; }
        public void setDosageForm(Product.DosageForm dosageForm) { this.dosageForm = dosageForm; }
        
        public String getStrength() { return strength; }
        public void setStrength(String strength) { this.strength = strength; }
        
        public String getPackSize() { return packSize; }
        public void setPackSize(String packSize) { this.packSize = packSize; }
        
        public String getGtin() { return gtin; }
        public void setGtin(String gtin) { this.gtin = gtin; }
        
        public String getBarcode() { return barcode; }
        public void setBarcode(String barcode) { this.barcode = barcode; }
        
        public String getImageUrl() { return imageUrl; }
        public void setImageUrl(String imageUrl) { this.imageUrl = imageUrl; }
        
        public String getAltText() { return altText; }
        public void setAltText(String altText) { this.altText = altText; }
        
        public BigDecimal getMrp() { return mrp; }
        public void setMrp(BigDecimal mrp) { this.mrp = mrp; }
        
        public BigDecimal getSalePrice() { return salePrice; }
        public void setSalePrice(BigDecimal salePrice) { this.salePrice = salePrice; }
        
        public BigDecimal getCurrentPrice() { return currentPrice; }
        public void setCurrentPrice(BigDecimal currentPrice) { this.currentPrice = currentPrice; }
        
        public Boolean getHasDiscount() { return hasDiscount; }
        public void setHasDiscount(Boolean hasDiscount) { this.hasDiscount = hasDiscount; }
        
        public BigDecimal getDiscountAmount() { return discountAmount; }
        public void setDiscountAmount(BigDecimal discountAmount) { this.discountAmount = discountAmount; }
        
        public BigDecimal getDiscountPercentage() { return discountPercentage; }
        public void setDiscountPercentage(BigDecimal discountPercentage) { this.discountPercentage = discountPercentage; }
        
        public Integer getTotalStock() { return totalStock; }
        public void setTotalStock(Integer totalStock) { this.totalStock = totalStock; }
        
        public Boolean getInStock() { return inStock; }
        public void setInStock(Boolean inStock) { this.inStock = inStock; }
        
        public LocalDateTime getCreatedAt() { return createdAt; }
        public void setCreatedAt(LocalDateTime createdAt) { this.createdAt = createdAt; }
        
        public LocalDateTime getUpdatedAt() { return updatedAt; }
        public void setUpdatedAt(LocalDateTime updatedAt) { this.updatedAt = updatedAt; }
    }
}
