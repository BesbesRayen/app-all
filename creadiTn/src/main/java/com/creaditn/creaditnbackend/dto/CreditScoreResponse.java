package com.creaditn.creaditnbackend.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreditScoreResponse {
    private Long id;
    private Integer score;
    private BigDecimal maxCreditAmount;
    private String decision;
    private BigDecimal salary;
    private String employmentType;
    private Integer yearsOfExperience;
    private BigDecimal monthlyExpenses;
}
