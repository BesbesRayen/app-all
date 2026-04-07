package com.creaditn.creaditnbackend.util;

import lombok.experimental.UtilityClass;
import java.math.BigDecimal;
import java.math.RoundingMode;

/**
 * Utility class for credit-related calculations
 */
@UtilityClass
public class CreditCalculator {

    /**
     * Calculate the monthly installment amount
     * @param totalAmount the total credit amount
     * @param downPayment the down payment amount
     * @param numberOfInstallments the number of installments
     * @return the monthly installment amount
     */
    public static BigDecimal calculateMonthlyAmount(
            BigDecimal totalAmount,
            BigDecimal downPayment,
            Integer numberOfInstallments) {
        
        BigDecimal remaining = totalAmount.subtract(downPayment);
        return remaining.divide(
                BigDecimal.valueOf(numberOfInstallments),
                2,
                RoundingMode.HALF_UP
        );
    }
}
