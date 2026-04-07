package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.*;
import com.creaditn.creaditnbackend.entity.User;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.creaditn.creaditnbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new BadRequestException("Email already registered");
        }

        User user = User.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .password(request.getPassword())
                .phone(request.getPhone())
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

    public AuthResponse login(AuthRequest request) {
        User user = userRepository.findByEmail(request.getEmail())
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
