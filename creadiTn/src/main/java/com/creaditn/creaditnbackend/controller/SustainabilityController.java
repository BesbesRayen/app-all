package com.creaditn.creaditnbackend.controller;

import com.creaditn.creaditnbackend.dto.SustainabilityStatsDto;
import com.creaditn.creaditnbackend.repository.MerchantRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;

@RestController
@RequestMapping("/api/sustainability")
@RequiredArgsConstructor
public class SustainabilityController {

    private final MerchantRepository merchantRepository;

    @GetMapping("/stats")
    public ResponseEntity<SustainabilityStatsDto> stats(@RequestParam(required = false) Long userId) {
        int merchants = (int) merchantRepository.count();
        return ResponseEntity.ok(SustainabilityStatsDto.builder()
                .co2KgSaved(new BigDecimal("12.5"))
                .paperless(true)
                .tunisianMerchantsSupported(Math.max(merchants, 1))
                .monthlyReportUrl("/api/files/reports/impact-sample.pdf")
                .build());
    }
}
