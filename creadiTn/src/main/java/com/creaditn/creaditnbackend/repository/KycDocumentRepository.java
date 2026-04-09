package com.creaditn.creaditnbackend.repository;

import com.creaditn.creaditnbackend.entity.KycDocument;
import com.creaditn.creaditnbackend.entity.KycStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface KycDocumentRepository extends JpaRepository<KycDocument, Long> {
    List<KycDocument> findByUserId(Long userId);
    Optional<KycDocument> findTopByUserIdOrderByCreatedAtDesc(Long userId);
    List<KycDocument> findByStatus(KycStatus status);
}
