package com.creaditn.creaditnbackend.dto;

import com.creaditn.creaditnbackend.entity.CreditRequestStatus;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreditRequestResponse {
    private Long id;
    private Long userId;
    private Long merchantId;
    private String merchantName;
    private BigDecimal totalAmount;
    private BigDecimal downPayment;
    private Integer numberOfInstallments;
    private BigDecimal monthlyAmount;
    private CreditRequestStatus status;
    private LocalDateTime createdAt;
}
