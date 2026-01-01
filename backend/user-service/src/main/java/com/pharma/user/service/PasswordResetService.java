package com.pharma.user.service;

import com.pharma.user.dto.ForgotPasswordRequest;
import com.pharma.user.dto.ResetPasswordRequest;
import com.pharma.user.entity.PasswordReset;
import com.pharma.user.entity.User;
import com.pharma.user.repository.PasswordResetRepository;
import com.pharma.user.repository.UserRepository;
import at.favre.lib.crypto.bcrypt.BCrypt;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;

import java.time.LocalDateTime;

@ApplicationScoped
public class PasswordResetService {

    @Inject
    Mailer mailer;

    @Inject
    PasswordResetRepository passwordResetRepository;

    @Inject
    UserRepository userRepository;

    @Inject
    PasswordService passwordService;

    private static final int RESET_EXPIRATION_HOURS = 1;

    @Transactional
    public void sendPasswordResetEmail(ForgotPasswordRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new BadRequestException("If your email is registered, you will receive a password reset link"));

        // Invalidate any previous reset tokens
        passwordResetRepository.invalidatePreviousTokens(user.getEmail());

        // Generate new reset token
        String resetToken = passwordResetRepository.generateResetToken();
        LocalDateTime expiresAt = LocalDateTime.now().plusHours(RESET_EXPIRATION_HOURS);

        // Create password reset record
        PasswordReset passwordReset = new PasswordReset();
        passwordReset.setUserId(user.getId());
        passwordReset.setEmail(user.getEmail());
        passwordReset.setResetToken(resetToken);
        passwordReset.setExpiresAt(expiresAt);
        passwordReset.setIsUsed(false);

        passwordResetRepository.persist(passwordReset);

        // Send reset email
        sendResetEmail(user.getEmail(), resetToken);
    }

    @Transactional
    public boolean resetPassword(ResetPasswordRequest request) {
        System.out.println("=== PASSWORD RESET DEBUG ===");
        System.out.println("Attempting to reset password with token: " + request.getResetToken());
        
        PasswordReset passwordReset = passwordResetRepository.findByTokenAndUnused(request.getResetToken())
                .orElse(null);

        if (passwordReset == null) {
            System.out.println("❌ Invalid or expired reset token");
            return false;
        }

        System.out.println("✅ Found valid reset token for user ID: " + passwordReset.getUserId());

        // Get user and update password
        User user = userRepository.findById(passwordReset.getUserId());
        if (user != null) {
            String oldPassword = user.getPassword();
            String hashedPassword = passwordService.hashPassword(request.getNewPassword());
            
            System.out.println("🔐 Updating password for user: " + user.getEmail());
            System.out.println("🔐 Old password hash: " + oldPassword);
            System.out.println("🔐 New password hash: " + hashedPassword);
            
            // Update the password
            user.setPassword(hashedPassword);
            
            // Force the entity to be saved by calling persist
            userRepository.persist(user);
            
            // Verify the update by immediately checking
            User updatedUser = userRepository.findById(user.getId());
            System.out.println("🔐 After update - password hash: " + updatedUser.getPassword());
            System.out.println("🔐 Password update successful: " + !updatedUser.getPassword().equals(oldPassword));
        } else {
            System.out.println("❌ User not found for ID: " + passwordReset.getUserId());
            return false;
        }

        // Mark token as used
        passwordResetRepository.markAsUsed(request.getResetToken());
        System.out.println("✅ Reset token marked as used");

        System.out.println("=== END PASSWORD RESET DEBUG ===");
        return true;
    }

    private void sendResetEmail(String email, String resetToken) {
        // Use environment variable or default to localhost
        String frontendUrl = System.getProperty("quarkus.frontend.url", "http://localhost:3000");
        String resetLink = String.format("%s/reset-password?token=%s", frontendUrl, resetToken);

        String subject = "Reset Your Password";
        String body = String.format(
                "Hello,\n\n" +
                        "You requested to reset your password for your BluWalls Medbudy account.\n\n" +
                        "Click the link below to reset your password:\n" +
                        "%s\n\n" +
                        "This link will expire in %d hour(s).\n\n" +
                        "If you are testing locally and the link doesn't work, try:\n" +
                        "http://localhost:3000/reset-password?token=%s\n\n" +
                        "If you did not request this password reset, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "BluWalls Medbudy Team",
                resetLink, RESET_EXPIRATION_HOURS, resetToken
        );

        mailer.send(Mail.withText(email, subject, body));
    }

    @Transactional
    public void cleanupExpiredTokens() {
        passwordResetRepository.cleanupExpiredTokens();
    }
}
