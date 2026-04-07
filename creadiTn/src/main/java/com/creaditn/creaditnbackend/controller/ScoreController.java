package com.creaditn.creaditnbackend.controller;

import com.creaditn.creaditnbackend.dto.CreditScoreRequest;
import com.creaditn.creaditnbackend.dto.CreditScoreResponse;
import com.creaditn.creaditnbackend.service.CreditScoreService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/score")
@RequiredArgsConstructor
public class ScoreController {

    private final CreditScoreService creditScoreService;

    @PostMapping("/calculate")
    public ResponseEntity<CreditScoreResponse> calculateScore(@RequestParam Long userId,
            @Valid @RequestBody CreditScoreRequest request) {
        return ResponseEntity.ok(creditScoreService.calculateScore(userId, request));
    }

    @GetMapping("/latest")
    public ResponseEntity<CreditScoreResponse> getLatestScore(@RequestParam Long userId) {
        return ResponseEntity.ok(creditScoreService.getLatestScore(userId));
    }

    /** Alias for mobile spec (GET /score/my) */
    @GetMapping("/my")
    public ResponseEntity<CreditScoreResponse> getMyScore(@RequestParam Long userId) {
        return ResponseEntity.ok(creditScoreService.getLatestScore(userId));
    }
}
