package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.PaymentDto;
import com.creaditn.creaditnbackend.dto.PaymentRequest;
import com.creaditn.creaditnbackend.entity.*;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.creaditn.creaditnbackend.exception.ResourceNotFoundException;
import com.creaditn.creaditnbackend.repository.PaymentRepository;
import com.creaditn.creaditnbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final UserRepository userRepository;
    private final InstallmentService installmentService;
    private final NotificationService notificationService;

    @Transactional
    public PaymentDto makePayment(Long userId, PaymentRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        Installment installment = installmentService.getInstallmentEntity(request.getInstallmentId());

        if (installment.getStatus() == InstallmentStatus.PAID) {
            throw new BadRequestException("Installment already paid");
        }

        if (!installment.getCreditRequest().getUser().getId().equals(userId)) {
            throw new BadRequestException("This installment does not belong to you");
        }

        String txRef = "TXN-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();

        Payment payment = Payment.builder()
                .user(user)
                .installment(installment)
                .amount(request.getAmount())
                .transactionReference(txRef)
                .paymentMethod(request.getPaymentMethod())
                .build();

        paymentRepository.save(payment);
        installmentService.markAsPaid(installment.getId());

        notificationService.sendNotification(userId,
                "Payment Confirmed",
                "Payment of " + request.getAmount() + " DT confirmed. Ref: " + txRef,
                NotificationType.PAYMENT_CONFIRMED);

        return mapToDto(payment);
    }

    public List<PaymentDto> getUserPayments(Long userId) {
        return paymentRepository.findByUserId(userId)
                .stream().map(this::mapToDto).toList();
    }

    public PaymentDto getPaymentByReference(String reference) {
        Payment payment = paymentRepository.findByTransactionReference(reference)
                .orElseThrow(() -> new ResourceNotFoundException("Payment not found"));
        return mapToDto(payment);
    }

    private PaymentDto mapToDto(Payment p) {
        return PaymentDto.builder()
                .id(p.getId())
                .userId(p.getUser().getId())
                .installmentId(p.getInstallment().getId())
                .amount(p.getAmount())
                .transactionReference(p.getTransactionReference())
                .paymentMethod(p.getPaymentMethod())
                .paidAt(p.getPaidAt())
                .build();
    }
}
