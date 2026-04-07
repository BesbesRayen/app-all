package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.dto.CreditScoreRequest;
import com.creaditn.creaditnbackend.dto.CreditScoreResponse;
import com.creaditn.creaditnbackend.entity.CreditScore;
import com.creaditn.creaditnbackend.entity.User;
import com.creaditn.creaditnbackend.exception.ResourceNotFoundException;
import com.creaditn.creaditnbackend.repository.CreditScoreRepository;
import com.creaditn.creaditnbackend.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
@RequiredArgsConstructor
public class CreditScoreService {

    private final CreditScoreRepository creditScoreRepository;
    private final UserRepository userRepository;

    public CreditScoreResponse calculateScore(Long userId, CreditScoreRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        int score = computeScore(request);
        BigDecimal maxCredit = computeMaxCredit(request.getSalary(), request.getMonthlyExpenses(), score);
        String decision = determineDecision(score);

        CreditScore creditScore = CreditScore.builder()
                .user(user)
                .salary(request.getSalary())
                .employmentType(request.getEmploymentType())
                .yearsOfExperience(request.getYearsOfExperience())
                .monthlyExpenses(request.getMonthlyExpenses())
                .score(score)
                .maxCreditAmount(maxCredit)
                .build();

        creditScoreRepository.save(creditScore);

        return CreditScoreResponse.builder()
                .id(creditScore.getId())
                .score(score)
                .maxCreditAmount(maxCredit)
                .decision(decision)
                .salary(request.getSalary())
                .employmentType(request.getEmploymentType())
                .yearsOfExperience(request.getYearsOfExperience())
                .monthlyExpenses(request.getMonthlyExpenses())
                .build();
    }

    public CreditScoreResponse getLatestScore(Long userId) {
        CreditScore cs = creditScoreRepository.findTopByUserIdOrderByCreatedAtDesc(userId)
                .orElseThrow(() -> new ResourceNotFoundException("No credit score found for user"));

        return CreditScoreResponse.builder()
                .id(cs.getId())
                .score(cs.getScore())
                .maxCreditAmount(cs.getMaxCreditAmount())
                .decision(determineDecision(cs.getScore()))
                .salary(cs.getSalary())
                .employmentType(cs.getEmploymentType())
                .yearsOfExperience(cs.getYearsOfExperience())
                .monthlyExpenses(cs.getMonthlyExpenses())
                .build();
    }

    private int computeScore(CreditScoreRequest request) {
        int score = 0;

        // Salary score (max 30 points)
        BigDecimal salary = request.getSalary();
        if (salary.compareTo(BigDecimal.valueOf(3000)) >= 0) score += 30;
        else if (salary.compareTo(BigDecimal.valueOf(2000)) >= 0) score += 25;
        else if (salary.compareTo(BigDecimal.valueOf(1200)) >= 0) score += 15;
        else score += 5;

        // Employment type (max 25 points)
        String empType = request.getEmploymentType().toUpperCase();
        switch (empType) {
            case "CDI", "FONCTIONNAIRE" -> score += 25;
            case "CDD" -> score += 15;
            case "FREELANCE" -> score += 10;
            default -> score += 5;
        }

        // Years of experience (max 20 points)
        int years = request.getYearsOfExperience();
        if (years >= 10) score += 20;
        else if (years >= 5) score += 15;
        else if (years >= 2) score += 10;
        else score += 5;

        // Expense ratio (max 25 points)
        BigDecimal ratio = request.getMonthlyExpenses()
                .divide(salary, 2, RoundingMode.HALF_UP);
        if (ratio.compareTo(BigDecimal.valueOf(0.3)) <= 0) score += 25;
        else if (ratio.compareTo(BigDecimal.valueOf(0.5)) <= 0) score += 15;
        else if (ratio.compareTo(BigDecimal.valueOf(0.7)) <= 0) score += 10;
        else score += 0;

        return Math.min(score, 100);
    }

    private BigDecimal computeMaxCredit(BigDecimal salary, BigDecimal expenses, int score) {
        BigDecimal disposable = salary.subtract(expenses);
        if (disposable.compareTo(BigDecimal.ZERO) <= 0) return BigDecimal.ZERO;

        BigDecimal multiplier;
        if (score >= 75) multiplier = BigDecimal.valueOf(12);
        else if (score >= 50) multiplier = BigDecimal.valueOf(8);
        else multiplier = BigDecimal.valueOf(3);

        return disposable.multiply(multiplier).setScale(2, RoundingMode.HALF_UP);
    }

    private String determineDecision(int score) {
        if (score >= 75) return "AUTO_APPROVED";
        if (score >= 50) return "ADMIN_REVIEW";
        return "REJECTED";
    }
}
