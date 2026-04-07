package com.creaditn.creaditnbackend.controller;

import com.creaditn.creaditnbackend.dto.*;
import com.creaditn.creaditnbackend.entity.Merchant;
import com.creaditn.creaditnbackend.repository.MerchantRepository;
import com.creaditn.creaditnbackend.service.CreditService;
import com.creaditn.creaditnbackend.service.KycService;
import com.creaditn.creaditnbackend.service.UserService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserService userService;
    private final KycService kycService;
    private final CreditService creditService;
    private final MerchantRepository merchantRepository;

    // ---- Users ----
    @GetMapping("/users")
    public ResponseEntity<List<UserDto>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

    // ---- KYC ----
    @GetMapping("/kyc/pending")
    public ResponseEntity<List<KycDocumentDto>> getPendingKyc() {
        return ResponseEntity.ok(kycService.getPendingDocuments());
    }

    @PutMapping("/kyc/{id}/approve")
    public ResponseEntity<KycDocumentDto> approveKyc(@PathVariable Long id,
                                                      @RequestParam(required = false) String comment) {
        return ResponseEntity.ok(kycService.approveKyc(id, comment));
    }

    @PutMapping("/kyc/{id}/reject")
    public ResponseEntity<KycDocumentDto> rejectKyc(@PathVariable Long id,
                                                     @RequestParam String comment) {
        return ResponseEntity.ok(kycService.rejectKyc(id, comment));
    }

    // ---- Credits ----
    @GetMapping("/credits/pending")
    public ResponseEntity<List<CreditRequestResponse>> getPendingCredits() {
        return ResponseEntity.ok(creditService.getPendingRequests());
    }

    @PutMapping("/credits/{id}/approve")
    public ResponseEntity<CreditRequestResponse> approveCredit(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.approveCreditRequest(id));
    }

    @PutMapping("/credits/{id}/reject")
    public ResponseEntity<CreditRequestResponse> rejectCredit(@PathVariable Long id) {
        return ResponseEntity.ok(creditService.rejectCreditRequest(id));
    }

    // ---- Merchants ----
    @PostMapping("/merchants")
    public ResponseEntity<ApiResponse> createMerchant(@Valid @RequestBody MerchantDto dto) {
        Merchant merchant = Merchant.builder()
                .name(dto.getName())
                .category(dto.getCategory())
                .address(dto.getAddress())
                .phone(dto.getPhone())
                .email(dto.getEmail())
                .logoUrl(dto.getLogoUrl())
                .build();
        merchantRepository.save(merchant);
        return ResponseEntity.ok(ApiResponse.success("Merchant created successfully"));
    }

    @PutMapping("/merchants/{id}")
    public ResponseEntity<ApiResponse> updateMerchant(@PathVariable Long id, @RequestBody MerchantDto dto) {
        Merchant merchant = merchantRepository.findById(id)
                .orElseThrow(() -> new com.creaditn.creaditnbackend.exception.ResourceNotFoundException("Merchant not found"));
        if (dto.getName() != null) merchant.setName(dto.getName());
        if (dto.getCategory() != null) merchant.setCategory(dto.getCategory());
        if (dto.getAddress() != null) merchant.setAddress(dto.getAddress());
        if (dto.getPhone() != null) merchant.setPhone(dto.getPhone());
        if (dto.getEmail() != null) merchant.setEmail(dto.getEmail());
        if (dto.getLogoUrl() != null) merchant.setLogoUrl(dto.getLogoUrl());
        if (dto.getActive() != null) merchant.setActive(dto.getActive());
        merchantRepository.save(merchant);
        return ResponseEntity.ok(ApiResponse.success("Merchant updated successfully"));
    }

    @DeleteMapping("/merchants/{id}")
    public ResponseEntity<ApiResponse> deleteMerchant(@PathVariable Long id) {
        merchantRepository.deleteById(id);
        return ResponseEntity.ok(ApiResponse.success("Merchant deleted successfully"));
    }
}
