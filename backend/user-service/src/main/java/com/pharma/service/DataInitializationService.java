package com.pharma.service;

import com.pharma.entity.*;
import com.pharma.user.entity.User;
import io.quarkus.runtime.StartupEvent;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.enterprise.event.Observes;
import jakarta.inject.Inject;
import jakarta.persistence.EntityManager;
import jakarta.transaction.Transactional;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@ApplicationScoped
public class DataInitializationService {

    @Inject
    EntityManager entityManager;

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
        // Run support data initialization asynchronously to avoid connection issues
        new Thread(() -> {
            try {
                Thread.sleep(5000); // Wait for application to fully start
                initializeSupportData();
            } catch (InterruptedException e) {
                Thread.currentThread().interrupt();
                System.err.println("Support data initialization interrupted: " + e.getMessage());
            } catch (Exception e) {
                System.err.println("Error during support data initialization: " + e.getMessage());
                e.printStackTrace();
            }
        }).start();
        
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
    
    @Transactional
    public void initializeSupportData() {
        // Create FAQs
        createFAQs();
        
        // Create demo user if not exists
        createDemoUser();
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
    
    private void createFAQs() {
        // Check if FAQs already exist
        if (FAQ.count() > 0) {
            System.out.println("FAQs already exist, skipping FAQ creation.");
            return;
        }
        
        System.out.println("Creating sample FAQs...");
        
        // Order related FAQs
        createFAQ("How do I track my order?", 
            "You can track your order by going to your account dashboard and clicking on \"My Orders\". You can also use the tracking number sent to your email.", 
            "ORDER", 1);
            
        createFAQ("What payment methods do you accept?", 
            "We accept credit/debit cards, UPI, net banking, and cash on delivery. All payment methods are secure and encrypted.", 
            "PAYMENT", 2);
            
        createFAQ("How long does delivery take?", 
            "Standard delivery takes 3-5 business days. Express delivery is available in select cities for an additional charge.", 
            "DELIVERY", 1);
            
        createFAQ("How do I upload a prescription?", 
            "During checkout, you can upload your prescription by clicking on the \"Upload Prescription\" button. Make sure the prescription is clear and valid.", 
            "PRESCRIPTION", 1);
            
        createFAQ("What is your return policy?", 
            "We offer 15-day return policy for most products. Please note that prescription medicines cannot be returned once dispensed.", 
            "PRODUCT", 1);
            
        createFAQ("How do I contact customer support?", 
            "You can reach our customer support through the support page, by calling 1800-XXX-XXXX, or by emailing support@pharma.com.", 
            "OTHER", 1);
            
        createFAQ("Is my personal information secure?", 
            "Yes, we use industry-standard encryption to protect your personal and medical information. Your privacy is our top priority.", 
            "OTHER", 2);
            
        createFAQ("Can I cancel my order?", 
            "You can cancel your order before it has been processed for shipping. Once shipped, you will need to follow the return process.", 
            "ORDER", 2);
            
        createFAQ("Do you deliver to my location?", 
            "We deliver to most major cities and towns across India. You can check delivery availability by entering your PIN code during checkout.", 
            "DELIVERY", 2);
            
        createFAQ("Are your medicines authentic?", 
            "Yes, all our medicines are sourced from authorized distributors and manufacturers. We ensure 100% authenticity and quality.", 
            "PRODUCT", 2);
            
        createFAQ("What should I do if I receive a damaged product?", 
            "If you receive a damaged product, please contact our support team immediately with photos of the damaged item. We will arrange for a replacement or refund.", 
            "PRODUCT", 3);
            
        createFAQ("How do I know if my prescription is valid?", 
            "A valid prescription must be from a registered medical practitioner, dated within the last 6 months, and clearly show the patient details and prescribed medication.", 
            "PRESCRIPTION", 2);
            
        createFAQ("Can I change my delivery address after placing an order?", 
            "You can change your delivery address only if the order hasn't been shipped yet. Please contact our support team immediately for address changes.", 
            "DELIVERY", 3);
            
        createFAQ("What if the medicine I want is out of stock?", 
            "If a medicine is out of stock, you can add it to your wishlist and we will notify you when it becomes available. Our team can also suggest suitable alternatives.", 
            "PRODUCT", 3);
            
        createFAQ("How do I apply discount codes?", 
            "You can apply discount codes during checkout in the \"Promo Code\" field. Only one discount code can be used per order.", 
            "PAYMENT", 3);
            
        createFAQ("Is there a minimum order value?", 
            "No, there is no minimum order value. You can order as little or as much as you need.", 
            "ORDER", 3);
            
        createFAQ("What if I receive the wrong medicine?", 
            "If you receive the wrong medicine, please do not consume it. Contact our support team immediately and we will arrange for the correct medicine to be delivered.", 
            "PRODUCT", 4);
            
        createFAQ("How do I check my order history?", 
            "You can check your complete order history in your account dashboard under \"My Orders\". All past and current orders are listed there.", 
            "ORDER", 4);
            
        createFAQ("Can someone else pick up my order?", 
            "Yes, someone else can pick up your order if they provide the order number and a valid ID proof at our pickup location.", 
            "DELIVERY", 4);
            
        createFAQ("Do you offer express delivery?", 
            "Yes, we offer express delivery in major cities for an additional charge. Delivery time is typically 1-2 business days.", 
            "DELIVERY", 4);
            
        createFAQ("What if I have an allergic reaction?", 
            "If you experience any allergic reaction, stop using the medicine immediately and seek medical attention. Report the reaction to our support team.", 
            "PRESCRIPTION", 3);
            
        createFAQ("How do I know my order is confirmed?", 
            "You will receive an order confirmation email with all details once your order is successfully placed and payment is processed.", 
            "ORDER", 5);
            
        createFAQ("Can I order medicines for someone else?", 
            "Yes, you can order medicines for family members, but you will need to provide their valid prescription and details during checkout.", 
            "PRESCRIPTION", 4);
            
        createFAQ("What if my payment fails?", 
            "If your payment fails, please check your payment details and try again. If the issue persists, contact your bank or try a different payment method.", 
            "PAYMENT", 4);
            
        createFAQ("How do I track my prescription uploads?", 
            "You can view all your uploaded prescriptions in your account dashboard under \"My Prescriptions\". Each upload is tracked with status updates.", 
            "PRESCRIPTION", 5);
            
        createFAQ("Do you have a mobile app?", 
            "Yes, you can download our mobile app from the App Store or Google Play Store for a better mobile experience.", 
            "OTHER", 3);
            
        createFAQ("What are your customer support hours?", 
            "Our customer support is available 24/7 through phone, email, and live chat. We are always here to help you!", 
            "OTHER", 4);
            
        createFAQ("How do I leave feedback?", 
            "You can leave feedback for products and services in your account dashboard or by emailing us at feedback@pharma.com.", 
            "OTHER", 5);
            
        createFAQ("What if I need emergency medicine?", 
            "For emergency medical needs, please contact your nearest hospital or emergency services immediately. We are not an emergency medical service.", 
            "OTHER", 6);
        
        System.out.println("Created " + FAQ.count() + " FAQs successfully.");
    }
    
    private void createFAQ(String question, String answer, String category, int priority) {
        FAQ faq = new FAQ();
        faq.setQuestion(question);     // Use setter method
        faq.setAnswer(answer);         // Use setter method
        faq.setCategory(category);     // Use setter method
        faq.setPriority(priority);     // Use setter method
        faq.setIsActive(true);         // Use setter method
        // faqId and timestamps will be set by @PrePersist method
        faq.persist();
    }
    
    private void createDemoUser() {
        // Check if demo user already exists (using native query since User doesn't extend PanacheEntity)
        try {
            List<User> users = entityManager.createQuery("SELECT u FROM User u WHERE u.email = :email", User.class)
                    .setParameter("email", "demo@pharma.com")
                    .getResultList();
            if (!users.isEmpty()) {
                System.out.println("Demo user already exists, skipping user creation.");
                return;
            }
        } catch (Exception e) {
            System.out.println("Error checking for demo user: " + e.getMessage());
        }
        
        System.out.println("Creating demo user...");
        
        try {
            User user = new User();
            user.setName("Demo User");
            user.setEmail("demo@pharma.com");
            user.setMobile("9999999999");
            user.setPassword("$2a$12$h6bK8Xo2k.3Qqv0y1m8bEOT5aYJ5cB1o0t3oPSePpF0u0wM5vR1Qe");
            user.setRole(com.pharma.user.entity.UserRole.CUSTOMER);
            user.setEmailVerified(true);
            user.setMobileVerified(true);
            user.setCreatedAt(LocalDateTime.now());
            user.setUpdatedAt(LocalDateTime.now());
            user.setLastLogin(LocalDateTime.now());
            user.setIsActive(true);
            
            // Use EntityManager to persist the user
            entityManager.persist(user);
            entityManager.flush();
            
            System.out.println("Demo user created successfully.");
        } catch (Exception e) {
            System.out.println("Error creating demo user: " + e.getMessage());
            e.printStackTrace();
        }
    }
}
