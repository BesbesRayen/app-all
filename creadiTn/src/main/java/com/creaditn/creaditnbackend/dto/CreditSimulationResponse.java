package com.creaditn.creaditnbackend.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreditSimulationResponse {
    private BigDecimal totalAmount;
    private BigDecimal downPayment;
    private BigDecimal remainingAmount;
    private Integer numberOfInstallments;
    private BigDecimal monthlyAmount;
}
