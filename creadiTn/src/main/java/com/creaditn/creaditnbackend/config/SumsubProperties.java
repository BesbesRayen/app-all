package com.creaditn.creaditnbackend.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "sumsub")
@Getter @Setter
public class SumsubProperties {
    private boolean enabled = false;
    private String baseUrl = "https://api.sumsub.com";
    private String appToken;
    private String secretKey;
    private String levelName = "basic-kyc-level";
    private long tokenTtlInSecs = 600;
}
