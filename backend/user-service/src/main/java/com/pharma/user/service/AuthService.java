package com.pharma.user.service;

import at.favre.lib.crypto.bcrypt.BCrypt;
import com.pharma.user.dto.AuthResponse;
import com.pharma.user.dto.LoginRequest;
import com.pharma.user.dto.RegisterRequest;
import com.pharma.user.dto.SendVerificationRequest;
import com.pharma.user.dto.UserDTO;
import com.pharma.user.entity.User;
import com.pharma.user.repository.UserRepository;
import jakarta.enterprise.context.ApplicationScoped;
import jakarta.inject.Inject;
import jakarta.transaction.Transactional;
import jakarta.ws.rs.BadRequestException;
import jakarta.ws.rs.NotAuthorizedException;

import java.time.LocalDateTime;

@ApplicationScoped
public class AuthService {

    @Inject
    UserRepository userRepository;

    @Inject
    JwtService jwtService;

    @Inject
    UserService userService;

    @Inject
    EmailVerificationService emailVerificationService;

    @Inject
    PasswordResetService passwordResetService;

    @Inject
    PasswordService passwordService;

    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }
        if (userRepository.existsByMobile(request.getMobile())) {
            throw new BadRequestException("Mobile already registered");
        }

        User user = new User();
        user.setName(request.getName());
        user.setEmail(request.getEmail());
        user.setMobile(request.getMobile());
        user.setPassword(passwordService.hashPassword(request.getPassword()));
        user.setEmailVerified(false); // Set email verification as false initially

        userRepository.persist(user);

        // Send verification email
        SendVerificationRequest verificationRequest = new SendVerificationRequest();
        verificationRequest.setEmail(user.getEmail());
        verificationRequest.setUserId(user.getId());
        emailVerificationService.sendVerificationCode(verificationRequest);

        UserDTO dto = userService.toDTO(user);
        return new AuthResponse(null, dto, "Registration successful. Please verify your email to login.");
    }

    @Transactional
    public AuthResponse login(LoginRequest request) {
        System.out.println("=== LOGIN ATTEMPT DEBUG ===");
        System.out.println("Login attempt for: " + request.getEmailOrMobile());
        
        User user = userRepository.findByEmailOrMobile(request.getEmailOrMobile())
            .orElseThrow(() -> {
                System.out.println("❌ USER NOT FOUND: " + request.getEmailOrMobile());
                return new NotAuthorizedException("Invalid credentials");
            });

        System.out.println("✅ USER FOUND: " + user.getEmail());
        System.out.println("User ID: " + user.getId());
        System.out.println("Email Verified: " + user.getEmailVerified());
        System.out.println("Account Active: " + user.getIsActive());
        System.out.println("Stored password hash: " + user.getPassword());
        System.out.println("Provided password: " + request.getPassword());

        // Check password first
        boolean passwordValid = passwordService.verifyPassword(request.getPassword(), user.getPassword());
        System.out.println("Password verification result: " + passwordValid);
        
        if (!passwordValid) {
            System.out.println("❌ PASSWORD VERIFICATION FAILED for: " + user.getEmail());
            throw new NotAuthorizedException("Invalid credentials");
        }

        System.out.println("✅ PASSWORD VERIFICATION PASSED");

        // Check account active
        if (Boolean.FALSE.equals(user.getIsActive())) {
            System.out.println("❌ ACCOUNT DEACTIVATED for: " + user.getEmail());
            throw new NotAuthorizedException("Account is deactivated");
        }

        System.out.println("✅ ACCOUNT IS ACTIVE");

        // Check email verification
        if (Boolean.FALSE.equals(user.getEmailVerified())) {
            System.out.println("❌ EMAIL NOT VERIFIED for: " + user.getEmail());
            throw new NotAuthorizedException("Please verify your email before logging in");
        }

        System.out.println("✅ EMAIL VERIFIED");

        user.setLastLogin(LocalDateTime.now());

        String token = jwtService.generateToken(user);
        UserDTO dto = userService.toDTO(user);
        System.out.println("✅ LOGIN SUCCESSFUL for: " + user.getEmail());
        System.out.println("=== END LOGIN DEBUG ===");
        return new AuthResponse(token, dto, "Login successful");
    }

    @Transactional
    public AuthResponse loginBypassEmailVerification(LoginRequest request) {
        System.out.println("=== DEBUG LOGIN (BYPASS EMAIL VERIFICATION) ===");
        System.out.println("Login attempt for: " + request.getEmailOrMobile());
        
        User user = userRepository.findByEmailOrMobile(request.getEmailOrMobile())
            .orElseThrow(() -> {
                System.out.println("❌ USER NOT FOUND: " + request.getEmailOrMobile());
                return new NotAuthorizedException("Invalid credentials");
            });

        System.out.println("✅ USER FOUND: " + user.getEmail());
        System.out.println("User ID: " + user.getId());
        System.out.println("Email Verified: " + user.getEmailVerified());
        System.out.println("Account Active: " + user.getIsActive());
        System.out.println("Stored password hash: " + user.getPassword());
        System.out.println("Provided password: " + request.getPassword());

        // Check password first
        boolean passwordValid = passwordService.verifyPassword(request.getPassword(), user.getPassword());
        System.out.println("Password verification result: " + passwordValid);
        
        if (!passwordValid) {
            System.out.println("❌ PASSWORD VERIFICATION FAILED for: " + user.getEmail());
            throw new NotAuthorizedException("Invalid credentials");
        }

        System.out.println("✅ PASSWORD VERIFICATION PASSED");

        // Check account active
        if (Boolean.FALSE.equals(user.getIsActive())) {
            System.out.println("❌ ACCOUNT DEACTIVATED for: " + user.getEmail());
            throw new NotAuthorizedException("Account is deactivated");
        }

        System.out.println("✅ ACCOUNT IS ACTIVE");
        System.out.println("⚠️ BYPASSING EMAIL VERIFICATION CHECK");

        user.setLastLogin(LocalDateTime.now());

        String token = jwtService.generateToken(user);
        UserDTO dto = userService.toDTO(user);
        System.out.println("✅ DEBUG LOGIN SUCCESSFUL for: " + user.getEmail());
        System.out.println("=== END DEBUG LOGIN ===");
        return new AuthResponse(token, dto, "Login successful (debug mode)");
    }

    @Transactional
    public void sendPasswordResetEmail(String email) {
        try {
            passwordResetService.sendPasswordResetEmail(new com.pharma.user.dto.ForgotPasswordRequest(email));
        } catch (Exception e) {
            // Log the error but don't expose it to the user for security
            System.err.println("Password reset request failed: " + e.getMessage());
        }
    }
}
