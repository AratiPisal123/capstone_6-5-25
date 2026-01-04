package com.pharma.controller;

import com.pharma.entity.Product;
import com.pharma.entity.ProductImage;
import com.pharma.entity.ProductInventory;
import com.pharma.entity.ProductPrice;
import com.pharma.entity.WishlistItem;
import com.pharma.service.WishlistService;
import io.quarkus.security.Authenticated;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.NotAuthorizedException;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;
import org.eclipse.microprofile.jwt.JsonWebToken;

@Path("/api/wishlist")
@Produces(MediaType.APPLICATION_JSON)
@Consumes(MediaType.APPLICATION_JSON)
@Authenticated
public class WishlistController {

    @Inject
    JsonWebToken jwt;

    @Inject
    WishlistService wishlistService;

    @GET
    @Transactional
    public Response getWishlist() {
        Long userId = currentUserId();
        List<WishlistItem> items = wishlistService.getWishlistByUserId(userId);

        List<ProductDTO> products = items.stream()
                .map(WishlistItem::getProduct)
                .filter(p -> p != null && Boolean.TRUE.equals(p.isActive))
                .map(this::convertToProductDTO)
                .collect(Collectors.toList());

        return Response.ok(products).build();
    }

    @POST
    @Transactional
    public Response addToWishlist(AddWishlistRequest request) {
        Long userId = currentUserId();
        if (request == null || request.productId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "productId is required"))
                    .build();
        }

        WishlistItem created = wishlistService.addToWishlist(userId, request.productId);
        if (created == null) {
            return Response.ok(Map.of("message", "Already in wishlist")).build();
        }

        return Response.ok(Map.of("message", "Added to wishlist")).build();
    }

    @DELETE
    @Path("/{productId}")
    @Transactional
    public Response removeFromWishlist(@PathParam("productId") Long productId) {
        Long userId = currentUserId();
        if (productId == null) {
            return Response.status(Response.Status.BAD_REQUEST)
                    .entity(Map.of("error", "productId is required"))
                    .build();
        }

        boolean removed = wishlistService.removeFromWishlist(userId, productId);
        if (removed) {
            return Response.ok(Map.of("message", "Removed from wishlist")).build();
        }

        return Response.ok(Map.of("message", "Not in wishlist")).build();
    }

    private Long currentUserId() {
        Object userIdClaim = jwt.getClaim("userId");
        if (userIdClaim == null) {
            throw new NotAuthorizedException("Missing userId claim");
        }
        if (userIdClaim instanceof Integer) {
            return ((Integer) userIdClaim).longValue();
        }
        if (userIdClaim instanceof Long) {
            return (Long) userIdClaim;
        }
        return Long.parseLong(userIdClaim.toString());
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

        ProductImage primaryImage = ProductImage.findByProductIdAndIsPrimaryTrue(product.id);
        if (primaryImage != null) {
            dto.setImageUrl(primaryImage.url);
            dto.setAltText(primaryImage.altText);
        }

        ProductPrice currentPrice = ProductPrice.findCurrentPriceByProductId(product.id);
        if (currentPrice != null) {
            dto.setMrp(currentPrice.mrp);
            dto.setSalePrice(currentPrice.salePrice);
            dto.setCurrentPrice(currentPrice.getCurrentPrice());
            dto.setHasDiscount(currentPrice.hasDiscount());
            dto.setDiscountAmount(currentPrice.getDiscountAmount());
            dto.setDiscountPercentage(currentPrice.getDiscountPercentage());
        }

        Integer totalStock = ProductInventory.getTotalStockByProductId(product.id);
        dto.setTotalStock(totalStock);
        dto.setInStock(totalStock > 0);

        return dto;
    }

    public static class AddWishlistRequest {
        public Long productId;
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
