package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.KycDocumentDto;
import com.creaditn.creaditnbackend.entity.*;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.creaditn.creaditnbackend.exception.ResourceNotFoundException;
import com.creaditn.creaditnbackend.repository.KycDocumentRepository;
import com.creaditn.creaditnbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.List;
import java.util.Optional;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.multipart.MultipartFile;

@Service
@RequiredArgsConstructor
public class KycService {

    private final KycDocumentRepository kycDocumentRepository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;
    private final OcrService ocrService;

    @Value("${app.upload-dir:uploads}")
    private String uploadDir;

    public KycDocumentDto submitKycDocuments(Long userId, String cinNumber, String cinFrontUrl, String cinBackUrl, String selfieUrl) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getKycStatus() == KycStatus.APPROVED) {
            throw new BadRequestException("KYC already approved");
        }

        // Use provided CIN number, or extract from image if not provided
        String extractedCinNumber = cinNumber;
        if (cinNumber == null || cinNumber.trim().isEmpty()) {
            extractedCinNumber = ocrService.extractCinNumber(cinFrontUrl);
        }

        KycDocument doc = KycDocument.builder()
                .user(user)
                .cinFrontUrl(cinFrontUrl)
                .cinBackUrl(cinBackUrl)
                .selfieUrl(selfieUrl)
                .cinNumber(extractedCinNumber)
                .status(KycStatus.PENDING)
                .build();

        kycDocumentRepository.save(doc);

        user.setKycStatus(KycStatus.PENDING);
        userRepository.save(user);

        return mapToDto(doc);
    }

    public KycDocumentDto approveKyc(Long documentId, String adminComment) {
        KycDocument doc = kycDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC document not found"));

        doc.setStatus(KycStatus.APPROVED);
        doc.setAdminComment(adminComment);
        kycDocumentRepository.save(doc);

        User user = doc.getUser();
        user.setKycStatus(KycStatus.APPROVED);
        userRepository.save(user);

        notificationService.sendNotification(user.getId(),
                "KYC Approved", "Your identity has been verified successfully.",
                NotificationType.KYC_VALIDATED);

        return mapToDto(doc);
    }

    public KycDocumentDto rejectKyc(Long documentId, String adminComment) {
        KycDocument doc = kycDocumentRepository.findById(documentId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC document not found"));

        doc.setStatus(KycStatus.REJECTED);
        doc.setAdminComment(adminComment);
        kycDocumentRepository.save(doc);

        User user = doc.getUser();
        user.setKycStatus(KycStatus.REJECTED);
        userRepository.save(user);

        notificationService.sendNotification(user.getId(),
                "KYC Rejected", "Your identity verification was rejected. Reason: " + adminComment,
                NotificationType.KYC_VALIDATED);

        return mapToDto(doc);
    }

    public List<KycDocumentDto> getPendingDocuments() {
        return kycDocumentRepository.findByStatus(KycStatus.PENDING)
                .stream().map(this::mapToDto).toList();
    }

    public Optional<KycDocumentDto> getLatestKycOptional(Long userId) {
        return kycDocumentRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .map(this::mapToDto);
    }

    public KycDocumentDto uploadMultipart(Long userId, String cinNumber, MultipartFile cinFront, MultipartFile cinBack, MultipartFile selfie)
            throws IOException {
        if (cinFront == null || cinFront.isEmpty() || cinBack == null || cinBack.isEmpty()) {
            throw new BadRequestException("CIN front and CIN back are required");
        }
        
        // Resolve to absolute path if relative
        Path uploadPath = Paths.get(uploadDir);
        if (!uploadPath.isAbsolute()) {
            uploadPath = Paths.get(System.getProperty("user.dir"), uploadDir);
        }
        
        Path dir = uploadPath.resolve("kyc").resolve(String.valueOf(userId));
        Files.createDirectories(dir);
        String frontName = "cin_front.jpg";
        String backName = "cin_back.jpg";
        String selfieName = "selfie.jpg";
        cinFront.transferTo(dir.resolve(frontName).toFile());
        cinBack.transferTo(dir.resolve(backName).toFile());
        if (selfie != null && !selfie.isEmpty()) {
            selfie.transferTo(dir.resolve(selfieName).toFile());
        }

        String base = "/api/files/kyc/" + userId + "/";
        String selfieUrl = (selfie != null && !selfie.isEmpty()) ? base + selfieName : null;
        return submitKycDocuments(userId, cinNumber, base + frontName, base + backName, selfieUrl);
    }

    private KycDocumentDto mapToDto(KycDocument doc) {
        return KycDocumentDto.builder()
                .id(doc.getId())
                .userId(doc.getUser().getId())
                .cinFrontUrl(doc.getCinFrontUrl())
                .cinBackUrl(doc.getCinBackUrl())
                .selfieUrl(doc.getSelfieUrl())
                .cinNumber(doc.getCinNumber())
                .ocrResult(doc.getOcrResult())
                .status(doc.getStatus())
                .adminComment(doc.getAdminComment())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
