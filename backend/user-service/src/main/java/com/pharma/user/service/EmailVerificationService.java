package com.pharma.user.service;

import com.pharma.user.dto.EmailVerificationRequest;
import com.pharma.user.dto.SendVerificationRequest;
import com.pharma.user.entity.EmailVerification;
import com.pharma.user.entity.User;
import com.pharma.user.repository.EmailVerificationRepository;
import com.pharma.user.repository.UserRepository;
import io.quarkus.mailer.Mail;
import io.quarkus.mailer.Mailer;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;

import java.time.LocalDateTime;
import java.util.Random;

@ApplicationScoped
public class EmailVerificationService {

    @Inject
    Mailer mailer;

    @Inject
    EmailVerificationRepository emailVerificationRepository;

    @Inject
    UserRepository userRepository;

    private static final int VERIFICATION_CODE_LENGTH = 6;
    private static final int VERIFICATION_EXPIRATION_MINUTES = 10;

    @Transactional
    public void sendVerificationCode(SendVerificationRequest request) {
        String verificationCode = generateVerificationCode();
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(VERIFICATION_EXPIRATION_MINUTES);

        // Delete any existing verification codes for this email
        emailVerificationRepository.delete("email", request.getEmail());

        // Create new verification record
        EmailVerification verification = new EmailVerification();
        verification.setEmail(request.getEmail());
        verification.setUserId(request.getUserId());
        verification.setVerificationCode(verificationCode);
        verification.setExpiresAt(expiresAt);
        verification.setIsVerified(false);

        emailVerificationRepository.persist(verification);

        // Send verification email
        sendVerificationEmail(request.getEmail(), verificationCode);
    }

    @Transactional
    public boolean verifyEmail(EmailVerificationRequest request) {
        EmailVerification verification = emailVerificationRepository
                .find("email = ?1 and verificationCode = ?2 and isVerified = false and expiresAt > current_timestamp",
                        request.getEmail(), request.getVerificationCode())
                .firstResult();

        if (verification == null) {
            return false;
        }

        // Mark as verified
        verification.setIsVerified(true);

        // Update user email verification status
        User user = userRepository.findById(verification.getUserId());
        if (user != null) {
            user.setEmailVerified(true);
        }

        return true;
    }

    private String generateVerificationCode() {
        Random random = new Random();
        StringBuilder code = new StringBuilder();
        for (int i = 0; i < VERIFICATION_CODE_LENGTH; i++) {
            code.append(random.nextInt(10));
        }
        return code.toString();
    }

    private void sendVerificationEmail(String email, String verificationCode) {
        String subject = "Verify Your Email Address";
        String body = String.format(
                "Hello,\n\n" +
                        "Thank you for registering with  BluWalls Medicines. Please use the verification code below to verify your email address:\n\n" +
                        "Verification Code: %s\n\n" +
                        "This code will expire in %d minutes.\n\n" +
                        "If you did not request this verification, please ignore this email.\n\n" +
                        "Best regards,\n" +
                        "Medbudy Team",
                verificationCode, VERIFICATION_EXPIRATION_MINUTES
        );

        mailer.send(Mail.withText(email, subject, body));
    }

    @Transactional
    public void cleanupExpiredVerifications() {
        emailVerificationRepository.deleteVerifiedAndExpired();
    }
}
