package com.creaditn.creaditnbackend.controller;

import com.creaditn.creaditnbackend.dto.KycDocumentDto;
import com.creaditn.creaditnbackend.dto.SumsubInitResponse;
import com.creaditn.creaditnbackend.service.KycService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.http.HttpHeaders;

import java.io.IOException;
import java.util.Map;

@RestController
@RequestMapping("/api/kyc")
@RequiredArgsConstructor
public class KycController {

    private final KycService kycService;

    @PostMapping("/upload")
    public ResponseEntity<KycDocumentDto> uploadDocument(
            @RequestParam Long userId,
            @RequestParam String cinNumber,
            @RequestParam String cinFrontUrl,
            @RequestParam String cinBackUrl,
            @RequestParam String selfieUrl) {
        return ResponseEntity.ok(kycService.submitKycDocuments(userId, cinNumber, cinFrontUrl, cinBackUrl, selfieUrl));
    }

    @PostMapping(value = "/upload-multipart", consumes = "multipart/form-data")
    public ResponseEntity<KycDocumentDto> uploadMultipart(
            @RequestParam Long userId,
            @RequestParam String cinNumber,
            @RequestPart("cinFront") MultipartFile cinFront,
            @RequestPart("cinBack") MultipartFile cinBack,
            @RequestPart("selfie") MultipartFile selfie) throws IOException {
        return ResponseEntity.ok(kycService.uploadMultipart(userId, cinNumber, cinFront, cinBack, selfie));
    }

    @GetMapping("/status")
    public ResponseEntity<KycDocumentDto> getKycStatus(@RequestParam Long userId) {
        return kycService.getLatestKycOptional(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping("/sumsub/init")
    public ResponseEntity<SumsubInitResponse> initSumsubKyc(@RequestParam Long userId) {
        return ResponseEntity.ok(kycService.initSumsubKyc(userId));
    }

    @PostMapping("/sumsub/sync")
    public ResponseEntity<KycDocumentDto> syncSumsubKycStatus(@RequestParam Long userId) {
        return ResponseEntity.ok(kycService.syncSumsubStatus(userId));
    }

    @PostMapping("/sumsub/webhook")
    public ResponseEntity<Map<String, String>> sumsubWebhook(
            @RequestHeader HttpHeaders headers,
            @RequestBody String payload) {
        String signature = headers.getFirst("X-Payload-Digest");
        if (signature == null || signature.isBlank()) {
            signature = headers.getFirst("x-payload-digest");
        }

        kycService.handleSumsubWebhook(payload, signature);
        return ResponseEntity.ok(Map.of("status", "ok"));
    }
}
