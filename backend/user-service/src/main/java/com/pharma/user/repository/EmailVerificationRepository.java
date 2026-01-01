package com.pharma.user.repository;

import com.pharma.user.entity.EmailVerification;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.util.Optional;

@ApplicationScoped
public class EmailVerificationRepository implements PanacheRepository<EmailVerification> {

    public Optional<EmailVerification> findByEmailAndIsVerifiedFalse(String email) {
        return find("email = ?1 and isVerified = false", email).firstResultOptional();
    }

    public Optional<EmailVerification> findByUserIdAndIsVerifiedFalse(Long userId) {
        return find("userId = ?1 and isVerified = false", userId).firstResultOptional();
    }

    public void deleteVerifiedAndExpired() {
        delete("isVerified = true or expiresAt < current_timestamp");
    }
}
