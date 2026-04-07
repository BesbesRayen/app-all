package com.creaditn.creaditnbackend.controller;

import com.creaditn.creaditnbackend.dto.ApiResponse;
import com.creaditn.creaditnbackend.dto.AutopaySettingsDto;
import com.creaditn.creaditnbackend.dto.PaymentDto;
import com.creaditn.creaditnbackend.dto.PaymentMethodDto;
import com.creaditn.creaditnbackend.dto.PaymentRequest;
import com.creaditn.creaditnbackend.service.PaymentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/payments")
@RequiredArgsConstructor
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping
    public ResponseEntity<PaymentDto> makePayment(
            @RequestParam Long userId,
            @Valid @RequestBody PaymentRequest request) {
        return ResponseEntity.ok(paymentService.makePayment(userId, request));
    }

    /** Alias for mobile spec */
    @PostMapping("/installments/{installmentId}/pay")
    public ResponseEntity<PaymentDto> payInstallmentAlias(
            @PathVariable Long installmentId,
            @RequestParam Long userId,
            @Valid @RequestBody PaymentRequest request) {
        if (!installmentId.equals(request.getInstallmentId())) {
            request.setInstallmentId(installmentId);
        }
        return ResponseEntity.ok(paymentService.makePayment(userId, request));
    }

    @GetMapping("/my-payments")
    public ResponseEntity<List<PaymentDto>> getMyPayments(@RequestParam Long userId) {
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }

    @GetMapping("/reference/{ref}")
    public ResponseEntity<PaymentDto> getByReference(@PathVariable String ref) {
        return ResponseEntity.ok(paymentService.getPaymentByReference(ref));
    }

    @GetMapping("/methods")
    public ResponseEntity<List<PaymentMethodDto>> getMethods(@RequestParam Long userId) {
        return ResponseEntity.ok(List.of(
                PaymentMethodDto.builder()
                        .id(1L)
                        .type("CARD")
                        .last4("4242")
                        .label("Carte principale")
                        .defaultMethod(true)
                        .build()
        ));
    }

    @PutMapping("/autopay")
    public ResponseEntity<ApiResponse> setAutopay(
            @RequestParam Long userId,
            @RequestBody AutopaySettingsDto body) {
        return ResponseEntity.ok(ApiResponse.success("Autopay mis à jour"));
    }
}
