package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.*;
import com.creaditn.creaditnbackend.entity.*;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.creaditn.creaditnbackend.exception.ResourceNotFoundException;
import com.creaditn.creaditnbackend.repository.CreditRequestRepository;
import com.creaditn.creaditnbackend.repository.MerchantRepository;
import com.creaditn.creaditnbackend.repository.UserRepository;
import com.creaditn.creaditnbackend.util.CreditCalculator;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
@RequiredArgsConstructor
public class CreditService {

    private final CreditRequestRepository creditRequestRepository;
    private final UserRepository userRepository;
    private final MerchantRepository merchantRepository;
    private final InstallmentService installmentService;
    private final NotificationService notificationService;
    private final CreditScoreService creditScoreService;

    public CreditSimulationResponse simulate(CreditSimulationRequest request) {
        BigDecimal remaining = request.getTotalAmount().subtract(request.getDownPayment());
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Down payment must be less than total amount");
        }
        BigDecimal monthly = CreditCalculator.calculateMonthlyAmount(
                request.getTotalAmount(),
                request.getDownPayment(),
                request.getNumberOfInstallments()
        );

        return CreditSimulationResponse.builder()
                .totalAmount(request.getTotalAmount())
                .downPayment(request.getDownPayment())
                .remainingAmount(remaining)
                .numberOfInstallments(request.getNumberOfInstallments())
                .monthlyAmount(monthly)
                .build();
    }

    @Transactional
    public CreditRequestResponse createCreditRequest(Long userId, CreditRequestDto dto) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (user.getKycStatus() != KycStatus.APPROVED) {
            throw new BadRequestException("KYC must be approved before requesting credit");
        }

        BigDecimal remaining = dto.getTotalAmount().subtract(dto.getDownPayment());
        if (remaining.compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Down payment must be less than total amount");
        }
        BigDecimal monthly = CreditCalculator.calculateMonthlyAmount(
                dto.getTotalAmount(),
                dto.getDownPayment(),
                dto.getNumberOfInstallments()
        );

        // Check max credit allowed
        try {
            CreditScoreResponse score = creditScoreService.getLatestScore(userId);
            if (remaining.compareTo(score.getMaxCreditAmount()) > 0) {
                throw new BadRequestException("Requested amount exceeds your maximum credit limit of " + score.getMaxCreditAmount());
            }
        } catch (ResourceNotFoundException e) {
            throw new BadRequestException("Credit score must be calculated before requesting credit");
        }

        Merchant merchant = null;
        if (dto.getMerchantId() != null) {
            merchant = merchantRepository.findById(dto.getMerchantId())
                    .orElseThrow(() -> new ResourceNotFoundException("Merchant not found"));
        }

        CreditRequestStatus status = determineStatus(userId);

        CreditRequest request = CreditRequest.builder()
                .user(user)
                .merchant(merchant)
                .totalAmount(dto.getTotalAmount())
                .downPayment(dto.getDownPayment())
                .numberOfInstallments(dto.getNumberOfInstallments())
                .monthlyAmount(monthly)
                .status(status)
                .build();

        creditRequestRepository.save(request);

        if (status == CreditRequestStatus.APPROVED) {
            installmentService.generateInstallments(request);
            notificationService.sendNotification(userId,
                    "Credit Approved", "Your credit request of " + dto.getTotalAmount() + " DT has been approved.",
                    NotificationType.CREDIT_APPROVED);
        }

        return mapToResponse(request);
    }

    @Transactional
    public CreditRequestResponse approveCreditRequest(Long requestId) {
        CreditRequest request = creditRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit request not found"));

        request.setStatus(CreditRequestStatus.APPROVED);
        creditRequestRepository.save(request);

        installmentService.generateInstallments(request);

        notificationService.sendNotification(request.getUser().getId(),
                "Credit Approved", "Your credit request has been approved.",
                NotificationType.CREDIT_APPROVED);

        return mapToResponse(request);
    }

    @Transactional
    public CreditRequestResponse rejectCreditRequest(Long requestId) {
        CreditRequest request = creditRequestRepository.findById(requestId)
                .orElseThrow(() -> new ResourceNotFoundException("Credit request not found"));

        request.setStatus(CreditRequestStatus.REJECTED);
        creditRequestRepository.save(request);

        notificationService.sendNotification(request.getUser().getId(),
                "Credit Rejected", "Your credit request has been rejected.",
                NotificationType.CREDIT_REJECTED);

        return mapToResponse(request);
    }

    public List<CreditRequestResponse> getUserCreditRequests(Long userId) {
        return creditRequestRepository.findByUserId(userId)
                .stream().map(this::mapToResponse).toList();
    }

    public List<CreditRequestResponse> getPendingRequests() {
        return creditRequestRepository.findByStatus(CreditRequestStatus.PENDING)
                .stream().map(this::mapToResponse).toList();
    }

    public CreditRequestResponse getCreditRequest(Long id) {
        CreditRequest request = creditRequestRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Credit request not found"));
        return mapToResponse(request);
    }

    private CreditRequestStatus determineStatus(Long userId) {
        try {
            CreditScoreResponse score = creditScoreService.getLatestScore(userId);
            if (score.getScore() >= 75) return CreditRequestStatus.APPROVED;
            return CreditRequestStatus.PENDING;
        } catch (ResourceNotFoundException e) {
            return CreditRequestStatus.PENDING;
        }
    }

    private CreditRequestResponse mapToResponse(CreditRequest r) {
        return CreditRequestResponse.builder()
                .id(r.getId())
                .userId(r.getUser().getId())
                .merchantId(r.getMerchant() != null ? r.getMerchant().getId() : null)
                .merchantName(r.getMerchant() != null ? r.getMerchant().getName() : null)
                .totalAmount(r.getTotalAmount())
                .downPayment(r.getDownPayment())
                .numberOfInstallments(r.getNumberOfInstallments())
                .monthlyAmount(r.getMonthlyAmount())
                .status(r.getStatus())
                .createdAt(r.getCreatedAt())
                .build();
    }
}
