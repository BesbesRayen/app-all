package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.InstallmentDto;
import com.creaditn.creaditnbackend.entity.*;
import com.creaditn.creaditnbackend.exception.ResourceNotFoundException;
import com.creaditn.creaditnbackend.repository.InstallmentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
public class InstallmentService {

    private final InstallmentRepository installmentRepository;

    public void generateInstallments(CreditRequest creditRequest) {
        BigDecimal remaining = creditRequest.getTotalAmount().subtract(creditRequest.getDownPayment());
        int count = creditRequest.getNumberOfInstallments();
        BigDecimal monthly = creditRequest.getMonthlyAmount();

        List<Installment> installments = new ArrayList<>();
        for (int i = 1; i <= count; i++) {
            Installment installment = Installment.builder()
                    .creditRequest(creditRequest)
                    .dueDate(LocalDate.now().plusMonths(i))
                    .amount(monthly)
                    .status(InstallmentStatus.PENDING)
                    .penalty(BigDecimal.ZERO)
                    .build();
            installments.add(installment);
        }
        installmentRepository.saveAll(installments);
    }

    public List<InstallmentDto> getInstallmentsForCredit(Long creditRequestId) {
        return installmentRepository.findByCreditRequestId(creditRequestId)
                .stream().map(this::mapToDto).toList();
    }

    public List<InstallmentDto> getUserInstallments(Long userId) {
        return installmentRepository.findByCreditRequestUserId(userId)
                .stream().map(this::mapToDto).toList();
    }

    public List<InstallmentDto> getUserPendingInstallments(Long userId) {
        return installmentRepository.findByCreditRequestUserIdAndStatus(userId, InstallmentStatus.PENDING)
                .stream().map(this::mapToDto).toList();
    }

    public Installment getInstallmentEntity(Long id) {
        return installmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Installment not found with id: " + id));
    }

    public void markAsPaid(Long installmentId) {
        Installment installment = getInstallmentEntity(installmentId);
        installment.setStatus(InstallmentStatus.PAID);
        installment.setPaidDate(LocalDateTime.now());
        installmentRepository.save(installment);
    }

    public void markOverdueInstallments() {
        List<Installment> overdue = installmentRepository
                .findByStatusAndDueDateBefore(InstallmentStatus.PENDING, LocalDate.now());

        for (Installment inst : overdue) {
            inst.setStatus(InstallmentStatus.OVERDUE);
            inst.setPenalty(inst.getAmount().multiply(BigDecimal.valueOf(0.05)));
        }
        installmentRepository.saveAll(overdue);
    }

    private InstallmentDto mapToDto(Installment i) {
        return InstallmentDto.builder()
                .id(i.getId())
                .creditRequestId(i.getCreditRequest().getId())
                .dueDate(i.getDueDate())
                .amount(i.getAmount())
                .status(i.getStatus())
                .paidDate(i.getPaidDate())
                .penalty(i.getPenalty())
                .build();
    }
}
