package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.PasswordChangeRequest;
import com.creaditn.creaditnbackend.dto.UserDto;
import com.creaditn.creaditnbackend.entity.User;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.creaditn.creaditnbackend.exception.ResourceNotFoundException;
import com.creaditn.creaditnbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public UserDto getUserById(Long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return mapToDto(user);
    }

    public UserDto getUserByEmail(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return mapToDto(user);
    }

    public void changePassword(Long userId, PasswordChangeRequest req) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + userId));
        if (!user.getPassword().equals(req.getOldPassword())) {
            throw new BadRequestException("Invalid current password");
        }
        if (req.getNewPassword() == null || req.getNewPassword().length() < 6) {
            throw new BadRequestException("New password must be at least 6 characters");
        }
        user.setPassword(req.getNewPassword());
        userRepository.save(user);
    }

    public UserDto updateProfile(Long id, UserDto dto) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (dto.getFirstName() != null) user.setFirstName(dto.getFirstName());
        if (dto.getLastName() != null) user.setLastName(dto.getLastName());
        if (dto.getPhone() != null) user.setPhone(dto.getPhone());

        userRepository.save(user);
        return mapToDto(user);
    }

    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream().map(this::mapToDto).toList();
    }

    public User findByEmail(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    private UserDto mapToDto(User user) {
        return UserDto.builder()
                .id(user.getId())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .email(user.getEmail())
                .phone(user.getPhone())
                .kycStatus(user.getKycStatus())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
