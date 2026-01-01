package com.pharma.user.repository;

import com.pharma.user.entity.PasswordReset;
import io.quarkus.hibernate.orm.panache.PanacheRepository;
import jakarta.enterprise.context.ApplicationScoped;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.UUID;

@ApplicationScoped
public class PasswordResetRepository implements PanacheRepository<PasswordReset> {

    public Optional<PasswordReset> findByTokenAndUnused(String resetToken) {
        return find("resetToken = ?1 and isUsed = false and expiresAt > current_timestamp", resetToken)
                .firstResultOptional();
    }

    public Optional<PasswordReset> findByEmailAndUnused(String email) {
        return find("email = ?1 and isUsed = false and expiresAt > current_timestamp", email)
                .firstResultOptional();
    }

    public void markAsUsed(String resetToken) {
        update("isUsed = true where resetToken = ?1", resetToken);
    }

    public void invalidatePreviousTokens(String email) {
        update("isUsed = true where email = ?1 and isUsed = false", email);
    }

    public String generateResetToken() {
        return UUID.randomUUID().toString().replace("-", "");
    }

    public void cleanupExpiredTokens() {
        delete("isUsed = true or expiresAt < current_timestamp");
    }
}
