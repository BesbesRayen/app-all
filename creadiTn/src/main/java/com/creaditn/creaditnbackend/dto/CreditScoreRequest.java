package com.creaditn.creaditnbackend.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
public class CreditScoreRequest {

    @NotNull @Positive
    private BigDecimal salary;

    @NotNull
    private String employmentType;

    @NotNull
    private Integer yearsOfExperience;

    @NotNull @Positive
    private BigDecimal monthlyExpenses;
}
