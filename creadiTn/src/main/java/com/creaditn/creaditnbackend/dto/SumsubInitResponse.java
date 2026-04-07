package com.creaditn.creaditnbackend.dto;

import lombok.*;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SumsubInitResponse {
    private Long userId;
    private Long kycDocumentId;
    private String applicantId;
    private String sdkToken;
    private Long ttlInSecs;
}
