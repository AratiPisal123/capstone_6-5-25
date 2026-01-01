package com.pharma.user.service;

import at.favre.lib.crypto.bcrypt.BCrypt;
import jakarta.enterprise.context.ApplicationScoped;

@ApplicationScoped
public class PasswordService {

    private static final int BCRYPT_COST = 12;

    public String hashPassword(String password) {
        return BCrypt.withDefaults().hashToString(BCRYPT_COST, password.toCharArray());
    }

    public boolean verifyPassword(String password, String hash) {
        System.out.println("🔐 PASSWORD VERIFICATION DEBUG");
        System.out.println("Input password: " + password);
        System.out.println("Stored hash: " + hash);
        
        BCrypt.Result result = BCrypt.verifyer().verify(password.toCharArray(), hash);
        System.out.println("BCrypt verification result: " + result.verified);
        System.out.println("BCrypt verification details: " + result.details);
        
        if (!result.verified) {
            System.out.println("❌ PASSWORD VERIFICATION FAILED");
            // Let's try to understand why
            if (result.details.toString().contains("invalid hash")) {
                System.out.println("Issue: Invalid hash format");
            } else if (result.details.toString().contains("invalid password")) {
                System.out.println("Issue: Password doesn't match hash");
            }
        } else {
            System.out.println("✅ PASSWORD VERIFICATION SUCCESS");
        }
        
        return result.verified;
    }
}
