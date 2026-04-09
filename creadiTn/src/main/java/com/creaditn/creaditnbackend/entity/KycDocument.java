package com.creaditn.creaditnbackend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "kyc_documents")
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class KycDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.SEQUENCE, generator = "kyc_document_seq")
    @SequenceGenerator(name = "kyc_document_seq", sequenceName = "kyc_document_sequence", allocationSize = 1)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    private String cinFrontUrl;
    private String cinBackUrl;
    private String selfieUrl;
    private String cinNumber;
    private String ocrResult;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private KycStatus status;

    private String adminComment;

    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        if (status == null) status = KycStatus.PENDING;
    }
}
