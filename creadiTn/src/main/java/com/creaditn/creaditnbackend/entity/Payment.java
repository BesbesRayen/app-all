package com.creaditn.creaditnbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "payments")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Payment {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "payment_seq")
    @SequenceGenerator(name = "payment_seq", sequenceName = "payment_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "installment_id", nullable = false)
    private Installment installment;

    @Column(nullable = false)
    private BigDecimal amount;

    @Column(unique = true)
    private String transactionReference;

    private String paymentMethod;

    private LocalDateTime paidAt;

    @PrePersist
    protected void onCreate() {
        paidAt = LocalDateTime.now();
    }
}
