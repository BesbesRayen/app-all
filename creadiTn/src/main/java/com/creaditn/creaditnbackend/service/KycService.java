package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.KycDocumentDto;
import com.creaditn.creaditnbackend.dto.SumsubInitResponse;
import com.creaditn.creaditnbackend.entity.*;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.creaditn.creaditnbackend.exception.ResourceNotFoundException;
import com.creaditn.creaditnbackend.repository.KycDocumentRepository;
import com.creaditn.creaditnbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

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
    private final SumsubClient sumsubClient;
    private final ObjectMapper objectMapper;

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
        if (cinFront == null || cinFront.isEmpty() || cinBack == null || cinBack.isEmpty()
                || selfie == null || selfie.isEmpty()) {
            throw new BadRequestException("All three files (CIN front, CIN back, selfie) are required");
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
        selfie.transferTo(dir.resolve(selfieName).toFile());

        String base = "/api/files/kyc/" + userId + "/";
        return submitKycDocuments(userId, cinNumber, base + frontName, base + backName, base + selfieName);
    }

    public SumsubInitResponse initSumsubKyc(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getKycStatus() == KycStatus.APPROVED) {
            throw new BadRequestException("KYC already approved");
        }

        KycDocument doc = kycDocumentRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseGet(() -> kycDocumentRepository.save(KycDocument.builder()
                        .user(user)
                        .status(KycStatus.PENDING)
                        .build()));

        if (doc.getSumsubApplicantId() == null || doc.getSumsubApplicantId().isBlank()) {
            String applicantId = sumsubClient.createApplicant(
                    String.valueOf(user.getId()),
                    user.getFirstName(),
                    user.getLastName(),
                    user.getEmail(),
                    user.getPhone()
            );
            doc.setSumsubApplicantId(applicantId);
        }

        doc.setStatus(KycStatus.PENDING);
        doc.setSumsubReviewStatus("init");
        kycDocumentRepository.save(doc);

        user.setKycStatus(KycStatus.PENDING);
        userRepository.save(user);

        String sdkToken = sumsubClient.createSdkToken(String.valueOf(user.getId()));

        return SumsubInitResponse.builder()
                .userId(user.getId())
                .kycDocumentId(doc.getId())
                .applicantId(doc.getSumsubApplicantId())
                .sdkToken(sdkToken)
                .ttlInSecs(600L)
                .build();
    }

    public KycDocumentDto syncSumsubStatus(Long userId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        KycDocument doc = kycDocumentRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("KYC document not found"));

        if (doc.getSumsubApplicantId() == null || doc.getSumsubApplicantId().isBlank()) {
            throw new BadRequestException("Sumsub applicant not initialized for this user");
        }

        KycStatus oldStatus = doc.getStatus();
        SumsubClient.SumsubReviewStatus sumsubStatus = sumsubClient.getApplicantStatus(doc.getSumsubApplicantId());

        doc.setSumsubReviewStatus(sumsubStatus.getReviewStatus());
        doc.setSumsubReviewAnswer(sumsubStatus.getReviewAnswer());

        if ("GREEN".equalsIgnoreCase(sumsubStatus.getReviewAnswer())) {
            doc.setStatus(KycStatus.APPROVED);
            user.setKycStatus(KycStatus.APPROVED);
        } else if ("RED".equalsIgnoreCase(sumsubStatus.getReviewAnswer())) {
            doc.setStatus(KycStatus.REJECTED);
            user.setKycStatus(KycStatus.REJECTED);
            doc.setAdminComment(sumsubStatus.getRejectLabels());
        } else {
            doc.setStatus(KycStatus.PENDING);
            user.setKycStatus(KycStatus.PENDING);
        }

        kycDocumentRepository.save(doc);
        userRepository.save(user);

        if (oldStatus != doc.getStatus() && doc.getStatus() == KycStatus.APPROVED) {
            notificationService.sendNotification(user.getId(),
                    "KYC Approved", "Your identity has been verified successfully.",
                    NotificationType.KYC_VALIDATED);
        }
        if (oldStatus != doc.getStatus() && doc.getStatus() == KycStatus.REJECTED) {
            notificationService.sendNotification(user.getId(),
                    "KYC Rejected", "Your identity verification was rejected.",
                    NotificationType.KYC_VALIDATED);
        }

        return mapToDto(doc);
    }

    public void handleSumsubWebhook(String payload, String signatureHeader) {
        if (!sumsubClient.verifyWebhookSignature(payload, signatureHeader)) {
            throw new BadRequestException("Invalid Sumsub webhook signature");
        }

        try {
            JsonNode root = objectMapper.readTree(payload == null ? "{}" : payload);
            String applicantId = root.path("applicantId").asText("");
            if (applicantId.isBlank()) {
                throw new BadRequestException("Sumsub webhook missing applicantId");
            }

            KycDocument doc = kycDocumentRepository.findTopBySumsubApplicantIdOrderByCreatedAtDesc(applicantId)
                    .orElseThrow(() -> new ResourceNotFoundException("KYC document not found for applicantId: " + applicantId));

            User user = doc.getUser();
            KycStatus previousStatus = doc.getStatus();

            String reviewStatus = root.path("reviewStatus").asText("");
            String reviewAnswer = root.path("reviewResult").path("reviewAnswer").asText("");
            if (reviewAnswer.isBlank()) {
                reviewAnswer = root.path("reviewResult").path("moderationComment").asText("");
            }

            doc.setSumsubReviewStatus(reviewStatus);
            doc.setSumsubReviewAnswer(reviewAnswer);

            if ("GREEN".equalsIgnoreCase(reviewAnswer)) {
                doc.setStatus(KycStatus.APPROVED);
                user.setKycStatus(KycStatus.APPROVED);
            } else if ("RED".equalsIgnoreCase(reviewAnswer)) {
                doc.setStatus(KycStatus.REJECTED);
                user.setKycStatus(KycStatus.REJECTED);
                doc.setAdminComment(root.path("reviewResult").path("rejectLabels").toString());
            } else {
                doc.setStatus(KycStatus.PENDING);
                user.setKycStatus(KycStatus.PENDING);
            }

            kycDocumentRepository.save(doc);
            userRepository.save(user);

            if (previousStatus != doc.getStatus() && doc.getStatus() == KycStatus.APPROVED) {
                notificationService.sendNotification(user.getId(),
                        "KYC Approved", "Your identity has been verified successfully.",
                        NotificationType.KYC_VALIDATED);
            }
            if (previousStatus != doc.getStatus() && doc.getStatus() == KycStatus.REJECTED) {
                notificationService.sendNotification(user.getId(),
                        "KYC Rejected", "Your identity verification was rejected.",
                        NotificationType.KYC_VALIDATED);
            }
        } catch (BadRequestException ex) {
            throw ex;
        } catch (Exception ex) {
            throw new BadRequestException("Invalid Sumsub webhook payload: " + ex.getMessage());
        }
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
                .sumsubApplicantId(doc.getSumsubApplicantId())
                .sumsubReviewStatus(doc.getSumsubReviewStatus())
                .sumsubReviewAnswer(doc.getSumsubReviewAnswer())
                .status(doc.getStatus())
                .adminComment(doc.getAdminComment())
                .createdAt(doc.getCreatedAt())
                .build();
    }
}
