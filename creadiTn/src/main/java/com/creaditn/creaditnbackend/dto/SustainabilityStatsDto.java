package com.creaditn.creaditnbackend.dto;

import lombok.*;
import java.math.BigDecimal;

@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class SustainabilityStatsDto {
    private BigDecimal co2KgSaved;
    private boolean paperless;
    private int tunisianMerchantsSupported;
    private String monthlyReportUrl;
}
