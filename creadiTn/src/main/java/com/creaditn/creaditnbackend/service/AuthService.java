package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.*;
import com.creaditn.creaditnbackend.entity.User;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.creaditn.creaditnbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.security.SecureRandom;
import java.time.LocalDateTime;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final Map<String, ResetSession> resetSessions = new ConcurrentHashMap<>();
    private final SecureRandom secureRandom = new SecureRandom();

    private String normalizeEmail(String email) {
        return email == null ? "" : email.trim().toLowerCase();
    }

    private String normalizePhone(String phone) {
        return phone == null ? "" : phone.trim();
    }

    private String normalizeIdentifier(String identifier) {
        if (identifier == null) {
            return "";
        }
        String value = identifier.trim();
        if (value.contains("@")) {
            return normalizeEmail(value);
        }
        return normalizePhone(value);
    }

    public AuthResponse register(RegisterRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        if (normalizedEmail.isBlank()) {
            throw new BadRequestException("Email is required");
        }

        if (userRepository.existsByEmailIgnoreCase(normalizedEmail)) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(normalizedEmail)
                .password(request.getPassword())
                .phone(request.getPhone())
                .address(request.getAddress())
                .profession(request.getProfession())
                .build();

        userRepository.save(user);

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .message("Registered successfully")
                .build();
    }

    public ApiResponse requestPasswordReset(ForgotPasswordRequest request) {
        String identifier = normalizeIdentifier(request.getIdentifier());
        if (identifier.isBlank()) {
            throw new BadRequestException("Email or phone is required");
        }

        User user = findByIdentifier(identifier);
        String code = String.valueOf(100000 + secureRandom.nextInt(900000));
        resetSessions.put(identifier, new ResetSession(user.getId(), code, LocalDateTime.now().plusMinutes(10)));

        String destination = identifier.contains("@") ? "email" : "phone";
        return ApiResponse.success("Verification code sent to your " + destination + " (demo code: " + code + ")");
    }

    public ApiResponse confirmPasswordReset(ForgotPasswordConfirmRequest request) {
        String identifier = normalizeIdentifier(request.getIdentifier());
        ResetSession session = resetSessions.get(identifier);
        if (session == null) {
            throw new BadRequestException("No reset request found for this identifier");
        }

        if (LocalDateTime.now().isAfter(session.expiresAt())) {
            resetSessions.remove(identifier);
            throw new BadRequestException("Verification code expired. Please request a new one");
        }

        if (!session.code().equals(request.getCode().trim())) {
            throw new BadRequestException("Invalid verification code");
        }

        if (request.getNewPassword() == null || request.getNewPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }

        User user = userRepository.findById(session.userId())
                .orElseThrow(() -> new BadRequestException("User not found"));
        user.setPassword(request.getNewPassword());
        userRepository.save(user);
        resetSessions.remove(identifier);

        return ApiResponse.success("Password reset successful");
    }

    private User findByIdentifier(String identifier) {
        if (identifier.contains("@")) {
            return userRepository.findByEmailIgnoreCase(identifier)
                    .orElseThrow(() -> new BadRequestException("User not found"));
        }
        return userRepository.findByPhone(identifier)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    private record ResetSession(Long userId, String code, LocalDateTime expiresAt) {}

    public AuthResponse login(AuthRequest request) {
        String normalizedEmail = normalizeEmail(request.getEmail());
        User user = userRepository.findByEmailIgnoreCase(normalizedEmail)
                .orElseThrow(() -> new BadRequestException("User not found"));

        if (!user.getPassword().equals(request.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .message("Login successful")
                .build();
    }

    /**
     * Demo Google Sign-In: links to the first registered user when tokens are present.
     * Replace with real Google token verification in production.
     */
    public AuthResponse googleLogin(GoogleAuthRequest request) {
        if (request.getIdToken() == null || request.getIdToken().isBlank()) {
            throw new BadRequestException("Invalid Google token");
        }
        User user = userRepository.findAll().stream().findFirst()
                .orElseThrow(() -> new BadRequestException("No users in database — register first"));
        return AuthResponse.builder()
                .userId(user.getId())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .message("Google login (demo)")
                .build();
    }
}
