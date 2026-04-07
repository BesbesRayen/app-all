package com.creaditn.creaditnbackend.controller;

import com.creaditn.creaditnbackend.dto.ApiResponse;
import com.creaditn.creaditnbackend.dto.PasswordChangeRequest;
import com.creaditn.creaditnbackend.dto.UserDto;
import com.creaditn.creaditnbackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/users")
@RequiredArgsConstructor
public class UserController {

    private final UserService userService;

    @GetMapping("/health")
    public ResponseEntity<ApiResponse> health() {
        return ResponseEntity.ok(ApiResponse.success("User service is healthy"));
    }

    @GetMapping("/me")
    public ResponseEntity<UserDto> getCurrentUser(@RequestParam Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    /** Alias for mobile spec */
    @GetMapping("/profile")
    public ResponseEntity<UserDto> getProfile(@RequestParam Long userId) {
        return ResponseEntity.ok(userService.getUserById(userId));
    }

    @PutMapping("/me")
    public ResponseEntity<UserDto> updateProfile(@RequestParam Long userId,
                                                  @RequestBody UserDto dto) {
        return ResponseEntity.ok(userService.updateProfile(userId, dto));
    }

    @GetMapping("/{id}")
    public ResponseEntity<UserDto> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(userService.getUserById(id));
    }

    @PutMapping("/password")
    public ResponseEntity<ApiResponse> changePassword(
            @RequestParam Long userId,
            @Valid @RequestBody PasswordChangeRequest body) {
        userService.changePassword(userId, body);
        return ResponseEntity.ok(ApiResponse.success("Password updated"));
    }
}
