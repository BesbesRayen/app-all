package com.creaditn.creaditnbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "credit_scores")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class CreditScore {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "credit_score_seq")
    @SequenceGenerator(name = "credit_score_seq", sequenceName = "credit_score_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private BigDecimal salary;
    private String employmentType;
    private Integer yearsOfExperience;
    private BigDecimal monthlyExpenses;

    private Integer score;
    private BigDecimal maxCreditAmount;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
