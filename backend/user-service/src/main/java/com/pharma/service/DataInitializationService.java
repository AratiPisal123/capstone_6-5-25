package com.pharma.service;

import com.pharma.entity.*;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class DataInitializationService {

    private static final String[] CATALOG_IMAGE_URLS = new String[] {
            "https://5.imimg.com/data5/SELLER/Default/2024/3/402766879/SJ/UD/EJ/16610750/teicoplanin-injection-500x500.png",
            "https://media.istockphoto.com/id/1300036753/photo/falling-antibiotics-healthcare-background.jpg?s=612x612&w=0&k=20&c=oquxJiLqE33ePw2qML9UtKJgyYUqjkLFwxT84Pr-WPk=",
            "https://www.foundationmedicine.com/sites/default/files/styles/responsive_8_5_1050w/public/image/FPO_05_Single_OH__F1_CDx.png.webp?h=f71fd3ca&itok=5iMWEqbL",
            "https://www.designerpeople.com/wp-content/uploads/2018/05/Inspiring-Healthcare-Products-Packaging-Design-9.jpg"
    };

    private static final List<String> CATALOG_SKUS = List.of(
            "PARA001",
            "IBUP400",
            "AMOX500",
            "TEIC400",
            "VITD1000",
            "CET10",
            "MET500",
            "ASP75",
            "VITC500",
            "BENCOLD",
            "CAL500",
            "OMEP20",
            "DIA850",
            "LEV500",
            "ATOR10",
            "LOS50",
            "GLIM2",
            "PANT40",
            "AZI250",
            "IRB150"
    );
    
    void onStart(@Observes StartupEvent ev) {
        long existingCatalogProducts = Product.count("sku in ?1", CATALOG_SKUS);
        if (existingCatalogProducts < CATALOG_SKUS.size()) {
            System.out.println("Ensuring database has sample catalogue data...");
            initializeData();
            System.out.println("Database initialization completed!");
        }
    }
    
    @Transactional
    public void initializeData() {
        // Create warehouses
        createWarehouses();
        
        // Create categories
        createCategories();
        
        // Create brands
        createBrands();
        
        // Create products
        createProducts();
    }
    
    private void createWarehouses() {
        Warehouse wh1 = Warehouse.findByCode("WH001");
        if (wh1 == null) {
            wh1 = new Warehouse();
            wh1.code = "WH001";
        }
        wh1.name = "Main Warehouse";
        wh1.addressLine1 = "123 Industrial Area";
        wh1.city = "Mumbai";
        wh1.state = "Maharashtra";
        wh1.postalCode = "400001";
        wh1.country = "India";
        wh1.isActive = true;
        wh1.persist();
        
        Warehouse wh2 = Warehouse.findByCode("WH002");
        if (wh2 == null) {
            wh2 = new Warehouse();
            wh2.code = "WH002";
        }
        wh2.name = "Regional Warehouse";
        wh2.addressLine1 = "456 Tech Park";
        wh2.city = "Bangalore";
        wh2.state = "Karnataka";
        wh2.postalCode = "560001";
        wh2.country = "India";
        wh2.isActive = true;
        wh2.persist();
    }
    
    private void createCategories() {
        Category painRelief = Category.findBySlug("pain-relief");
        if (painRelief == null) {
            painRelief = new Category();
            painRelief.slug = "pain-relief";
        }
        painRelief.name = "Pain Relief";
        painRelief.description = "Medicines for pain and fever relief";
        painRelief.isActive = true;
        painRelief.persist();
        
        Category antibiotics = Category.findBySlug("antibiotics");
        if (antibiotics == null) {
            antibiotics = new Category();
            antibiotics.slug = "antibiotics";
        }
        antibiotics.name = "Antibiotics";
        antibiotics.description = "Antibiotic medications for bacterial infections";
        antibiotics.isActive = true;
        antibiotics.persist();
        
        Category vitamins = Category.findBySlug("vitamins-supplements");
        if (vitamins == null) {
            vitamins = new Category();
            vitamins.slug = "vitamins-supplements";
        }
        vitamins.name = "Vitamins & Supplements";
        vitamins.description = "Essential vitamins and dietary supplements";
        vitamins.isActive = true;
        vitamins.persist();
        
        Category coldCough = Category.findBySlug("cold-cough");
        if (coldCough == null) {
            coldCough = new Category();
            coldCough.slug = "cold-cough";
        }
        coldCough.name = "Cold & Cough";
        coldCough.description = "Medications for cold, cough and allergy relief";
        coldCough.isActive = true;
        coldCough.persist();
        
        Category diabetes = Category.findBySlug("diabetes-care");
        if (diabetes == null) {
            diabetes = new Category();
            diabetes.slug = "diabetes-care";
        }
        diabetes.name = "Diabetes Care";
        diabetes.description = "Medications and supplies for diabetes management";
        diabetes.isActive = true;
        diabetes.persist();
    }
    
    private void createBrands() {
        Brand cipla = Brand.findByName("Cipla");
        if (cipla == null) {
            cipla = new Brand();
            cipla.name = "Cipla";
        }
        cipla.manufacturerName = "Cipla Limited";
        cipla.isActive = true;
        cipla.persist();
        
        Brand pfizer = Brand.findByName("Pfizer");
        if (pfizer == null) {
            pfizer = new Brand();
            pfizer.name = "Pfizer";
        }
        pfizer.manufacturerName = "Pfizer Inc.";
        pfizer.isActive = true;
        pfizer.persist();
        
        Brand bayer = Brand.findByName("Bayer");
        if (bayer == null) {
            bayer = new Brand();
            bayer.name = "Bayer";
        }
        bayer.manufacturerName = "Bayer AG";
        bayer.isActive = true;
        bayer.persist();
        
        Brand gsk = Brand.findByName("GSK");
        if (gsk == null) {
            gsk = new Brand();
            gsk.name = "GSK";
        }
        gsk.manufacturerName = "GlaxoSmithKline";
        gsk.isActive = true;
        gsk.persist();
        
        Brand abbott = Brand.findByName("Abbott");
        if (abbott == null) {
            abbott = new Brand();
            abbott.name = "Abbott";
        }
        abbott.manufacturerName = "Abbott Laboratories";
        abbott.isActive = true;
        abbott.persist();
    }
    
    private void createProducts() {
        Warehouse mainWarehouse = Warehouse.findByCode("WH001");
        if (mainWarehouse == null) {
            List<Warehouse> warehouses = Warehouse.listAll();
            mainWarehouse = warehouses.isEmpty() ? null : warehouses.get(0);
        }
        if (mainWarehouse == null) {
            return;
        }

        Category painRelief = Category.findBySlug("pain-relief");
        Category antibiotics = Category.findBySlug("antibiotics");
        Category vitamins = Category.findBySlug("vitamins-supplements");
        Category coldCough = Category.findBySlug("cold-cough");
        Category diabetes = Category.findBySlug("diabetes-care");

        Brand cipla = Brand.findByName("Cipla");
        Brand pfizer = Brand.findByName("Pfizer");
        Brand bayer = Brand.findByName("Bayer");
        Brand gsk = Brand.findByName("GSK");
        Brand abbott = Brand.findByName("Abbott");
        
        // Sample products
        createProduct("PARA001", "Paracetamol 500mg", "Paracetamol tablet for pain and fever relief", 
            painRelief != null ? painRelief.id : null, cipla != null ? cipla.id : null, Product.DosageForm.TABLET, "500mg", "10 strips", mainWarehouse);
        
        createProduct("IBUP400", "Ibuprofen 400mg", "Ibuprofen for pain and inflammation", 
            painRelief != null ? painRelief.id : null, pfizer != null ? pfizer.id : null, Product.DosageForm.TABLET, "400mg", "10 strips", mainWarehouse);
        
        createProduct("AMOX500", "Amoxicillin 500mg", "Amoxicillin for bacterial infections", 
            antibiotics != null ? antibiotics.id : null, gsk != null ? gsk.id : null, Product.DosageForm.CAPSULE, "500mg", "15 capsules", mainWarehouse, true);

        createProduct("TEIC400", "Teicoplanin Injection 400mg", "Teicoplanin injection for severe bacterial infections", 
            antibiotics != null ? antibiotics.id : null, pfizer != null ? pfizer.id : null, Product.DosageForm.INJECTION, "400mg", "1 vial", mainWarehouse, true);
        
        createProduct("VITD1000", "Vitamin D3 1000 IU", "Vitamin D supplement for bone health", 
            vitamins != null ? vitamins.id : null, abbott != null ? abbott.id : null, Product.DosageForm.CAPSULE, "1000 IU", "60 capsules", mainWarehouse);
        
        createProduct("CET10", "Cetrizine 10mg", "Antihistamine for allergies", 
            coldCough != null ? coldCough.id : null, cipla != null ? cipla.id : null, Product.DosageForm.TABLET, "10mg", "10 tablets", mainWarehouse);
        
        createProduct("MET500", "Metformin 500mg", "Metformin for diabetes", 
            diabetes != null ? diabetes.id : null, abbott != null ? abbott.id : null, Product.DosageForm.TABLET, "500mg", "20 tablets", mainWarehouse, true);
        
        createProduct("ASP75", "Aspirin 75mg", "Low dose aspirin for heart health", 
            painRelief != null ? painRelief.id : null, bayer != null ? bayer.id : null, Product.DosageForm.TABLET, "75mg", "30 tablets", mainWarehouse);
        
        createProduct("VITC500", "Vitamin C 500mg", "Vitamin C for immunity", 
            vitamins != null ? vitamins.id : null, abbott != null ? abbott.id : null, Product.DosageForm.TABLET, "500mg", "100 tablets", mainWarehouse);
        
        createProduct("BENCOLD", "Benadryl Cough Syrup", "Cough syrup for dry cough", 
            coldCough != null ? coldCough.id : null, pfizer != null ? pfizer.id : null, Product.DosageForm.SYRUP, "100ml", "1 bottle", mainWarehouse);
        
        createProduct("CAL500", "Calcium Carbonate 500mg", "Calcium supplement for bones", 
            vitamins != null ? vitamins.id : null, abbott != null ? abbott.id : null, Product.DosageForm.TABLET, "500mg", "60 tablets", mainWarehouse);
        
        createProduct("OMEP20", "Omeprazole 20mg", "Acid reflux medication", 
            antibiotics != null ? antibiotics.id : null, pfizer != null ? pfizer.id : null, Product.DosageForm.CAPSULE, "20mg", "14 capsules", mainWarehouse, true);
        
        createProduct("DIA850", "Metformin 850mg", "Diabetes medication", 
            diabetes != null ? diabetes.id : null, abbott != null ? abbott.id : null, Product.DosageForm.TABLET, "850mg", "30 tablets", mainWarehouse, true);
        
        createProduct("LEV500", "Levofloxacin 500mg", "Antibiotic for infections", 
            antibiotics != null ? antibiotics.id : null, cipla != null ? cipla.id : null, Product.DosageForm.TABLET, "500mg", "10 tablets", mainWarehouse, true);
        
        createProduct("ATOR10", "Atorvastatin 10mg", "Cholesterol medication", 
            diabetes != null ? diabetes.id : null, pfizer != null ? pfizer.id : null, Product.DosageForm.TABLET, "10mg", "30 tablets", mainWarehouse, true);
        
        createProduct("LOS50", "Losartan 50mg", "Blood pressure medication", 
            diabetes != null ? diabetes.id : null, cipla != null ? cipla.id : null, Product.DosageForm.TABLET, "50mg", "20 tablets", mainWarehouse, true);
        
        createProduct("GLIM2", "Glimepiride 2mg", "Diabetes medication", 
            diabetes != null ? diabetes.id : null, abbott != null ? abbott.id : null, Product.DosageForm.TABLET, "2mg", "15 tablets", mainWarehouse, true);
        
        createProduct("PANT40", "Pantoprazole 40mg", "Stomach ulcer medication", 
            antibiotics != null ? antibiotics.id : null, gsk != null ? gsk.id : null, Product.DosageForm.TABLET, "40mg", "14 tablets", mainWarehouse, true);
        
        createProduct("AZI250", "Azithromycin 250mg", "Antibiotic for infections", 
            antibiotics != null ? antibiotics.id : null, pfizer != null ? pfizer.id : null, Product.DosageForm.TABLET, "250mg", "6 tablets", mainWarehouse, true);
        
        createProduct("IRB150", "Irbesartan 150mg", "Blood pressure medication", 
            diabetes != null ? diabetes.id : null, cipla != null ? cipla.id : null, Product.DosageForm.TABLET, "150mg", "20 tablets", mainWarehouse, true);
    }
    
    private void createProduct(String sku, String name, String description, Long categoryId, Long brandId, 
            Product.DosageForm dosageForm, String strength, String packSize, Warehouse warehouse) {
        createProduct(sku, name, description, categoryId, brandId, dosageForm, strength, packSize, warehouse, false);
    }
    
    private void createProduct(String sku, String name, String description, Long categoryId, Long brandId, 
            Product.DosageForm dosageForm, String strength, String packSize, Warehouse warehouse, Boolean prescriptionRequired) {
        
        Product product = Product.find("sku", sku).firstResult();
        if (product == null) {
            product = new Product();
            product.sku = sku;
        }
        product.name = name;
        product.description = description;
        product.categoryId = categoryId;
        product.brandId = brandId;
        product.prescriptionRequired = prescriptionRequired;
        product.dosageForm = dosageForm;
        product.strength = strength;
        product.packSize = packSize;
        product.gtin = "8901234567890";
        product.barcode = sku;
        product.isActive = true;

        int imageIndex = Math.abs(sku.hashCode()) % CATALOG_IMAGE_URLS.length;
        product.imageUrl = CATALOG_IMAGE_URLS[imageIndex];
        
        product.persist();
        
        // Create price
        if (ProductPrice.count("product.id", product.id) == 0) {
            createProductPrice(product);
        }
        
        // Create inventory
        if (ProductInventory.count("product.id", product.id) == 0) {
            createProductInventory(product, warehouse);
        }
        
        // Create image
        ProductImage primaryImage = ProductImage.findByProductIdAndIsPrimaryTrue(product.id);
        if (primaryImage == null) {
            createProductImage(product);
        } else {
            primaryImage.url = product.imageUrl;
            primaryImage.altText = product.name + " - " + product.strength + " " + product.dosageForm;
            primaryImage.isPrimary = true;
        }
    }
    
    private void createProductPrice(Product product) {
        BigDecimal mrp = BigDecimal.valueOf(50 + Math.random() * 200); // 50-250
        BigDecimal salePrice = mrp.multiply(BigDecimal.valueOf(0.85 + Math.random() * 0.1)); // 5-15% discount
        
        ProductPrice price = new ProductPrice();
        price.product = product;
        price.currency = "INR";
        price.mrp = mrp;
        price.salePrice = salePrice;
        price.validFrom = LocalDateTime.now();
        price.persist();
    }
    
    private void createProductInventory(Product product, Warehouse warehouse) {
        ProductInventory inventory = new ProductInventory();
        inventory.product = product;
        inventory.warehouse = warehouse;
        inventory.quantityAvailable = 50 + (int)(Math.random() * 200); // 50-250 units
        inventory.reorderLevel = 10;
        inventory.lotNumber = "LOT" + System.currentTimeMillis();
        inventory.expiryDate = LocalDate.now().plusMonths(12 + (int)(Math.random() * 24)); // 1-3 years expiry
        inventory.persist();
    }
    
    private void createProductImage(Product product) {
        // Use imageUrl from product entity instead of generating picsum URLs
        String imageUrl = product.imageUrl;
        
        ProductImage image = new ProductImage();
        image.product = product;
        image.url = imageUrl;
        image.altText = product.name + " - " + product.strength + " " + product.dosageForm;
        image.sortOrder = 1;
        image.isPrimary = true;
        image.persist();
    }
}
