package com.creaditn.creaditnbackend.service;

import com.creaditn.creaditnbackend.config.SumsubProperties;
import com.creaditn.creaditnbackend.exception.BadRequestException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.time.Instant;

@Service
@RequiredArgsConstructor
public class SumsubClient {

    private final SumsubProperties props;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newHttpClient();

    public String createApplicant(String externalUserId, String firstName, String lastName, String email, String phone) {
        ensureConfigured();
        try {
            String path = "/resources/applicants?levelName=" + props.getLevelName();
            String payload = objectMapper.createObjectNode()
                    .put("externalUserId", externalUserId)
                    .put("firstName", firstName == null ? "" : firstName)
                    .put("lastName", lastName == null ? "" : lastName)
                    .put("email", email == null ? "" : email)
                    .put("phone", phone == null ? "" : phone)
                    .toString();

            JsonNode body = sendSigned("POST", path, payload);
            JsonNode idNode = body.get("id");
            if (idNode == null || idNode.asText().isBlank()) {
                throw new BadRequestException("Sumsub applicant id missing in response");
            }
            return idNode.asText();
        } catch (Exception ex) {
            throw new BadRequestException("Sumsub create applicant failed: " + ex.getMessage());
        }
    }

    public String createSdkToken(String userId) {
        ensureConfigured();
        try {
            String path = "/resources/accessTokens/sdk?userId=" + userId
                    + "&ttlInSecs=" + props.getTokenTtlInSecs()
                    + "&levelName=" + props.getLevelName();

            JsonNode body = sendSigned("POST", path, "");
            JsonNode tokenNode = body.get("token");
            if (tokenNode == null || tokenNode.asText().isBlank()) {
                throw new BadRequestException("Sumsub SDK token missing in response");
            }
            return tokenNode.asText();
        } catch (Exception ex) {
            throw new BadRequestException("Sumsub SDK token failed: " + ex.getMessage());
        }
    }

    public SumsubReviewStatus getApplicantStatus(String applicantId) {
        ensureConfigured();
        try {
            String path = "/resources/applicants/" + applicantId + "/one";
            JsonNode body = sendSigned("GET", path, "");

            JsonNode review = body.path("review");
            JsonNode result = review.path("reviewResult");

            return SumsubReviewStatus.builder()
                    .reviewStatus(review.path("reviewStatus").asText("pending"))
                    .reviewAnswer(result.path("reviewAnswer").asText(""))
                    .rejectLabels(result.path("rejectLabels").toString())
                    .build();
        } catch (Exception ex) {
            throw new BadRequestException("Sumsub fetch status failed: " + ex.getMessage());
        }
    }

    public boolean verifyWebhookSignature(String payload, String signatureHeader) {
        ensureConfigured();
        if (signatureHeader == null || signatureHeader.isBlank()) {
            return false;
        }

        try {
            String expected = hmacSha256Hex(props.getSecretKey(), payload == null ? "" : payload);
            String provided = signatureHeader.trim().toLowerCase();
            if (provided.startsWith("sha256=")) {
                provided = provided.substring("sha256=".length());
            }
            return MessageDigest.isEqual(
                    expected.getBytes(StandardCharsets.UTF_8),
                    provided.getBytes(StandardCharsets.UTF_8)
            );
        } catch (Exception ex) {
            return false;
        }
    }

    private JsonNode sendSigned(String method, String path, String body) throws Exception {
        String ts = String.valueOf(Instant.now().getEpochSecond());
        String payload = ts + method.toUpperCase() + path + (body == null ? "" : body);
        String sig = hmacSha256Hex(props.getSecretKey(), payload);

        HttpRequest.Builder requestBuilder = HttpRequest.newBuilder()
                .uri(URI.create(props.getBaseUrl() + path))
                .header("X-App-Token", props.getAppToken())
                .header("X-App-Access-Ts", ts)
                .header("X-App-Access-Sig", sig)
                .header("Accept", "application/json");

        if ("POST".equalsIgnoreCase(method)) {
            requestBuilder.header("Content-Type", "application/json");
            requestBuilder.POST(HttpRequest.BodyPublishers.ofString(body == null ? "" : body));
        } else {
            requestBuilder.GET();
        }

        HttpResponse<String> response = httpClient.send(requestBuilder.build(), HttpResponse.BodyHandlers.ofString());

        if (response.statusCode() >= 300) {
            throw new BadRequestException("HTTP " + response.statusCode() + " - " + response.body());
        }

        String responseBody = response.body() == null || response.body().isBlank() ? "{}" : response.body();
        return objectMapper.readTree(responseBody);
    }

    private static String hmacSha256Hex(String secret, String data) throws Exception {
        Mac sha256Hmac = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKey = new SecretKeySpec(secret.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        sha256Hmac.init(secretKey);
        byte[] bytes = sha256Hmac.doFinal(data.getBytes(StandardCharsets.UTF_8));

        StringBuilder hex = new StringBuilder(bytes.length * 2);
        for (byte b : bytes) {
            hex.append(String.format("%02x", b));
        }
        return hex.toString();
    }

    private void ensureConfigured() {
        if (!props.isEnabled()) {
            throw new BadRequestException("Sumsub integration is disabled");
        }
        if (isBlank(props.getAppToken()) || isBlank(props.getSecretKey())) {
            throw new BadRequestException("Sumsub keys are missing. Set sumsub.app-token and sumsub.secret-key");
        }
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    @Getter
    @Builder
    @AllArgsConstructor
    public static class SumsubReviewStatus {
        private String reviewStatus;
        private String reviewAnswer;
        private String rejectLabels;
    }
}
