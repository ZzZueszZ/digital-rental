package org.web.identity.service.provider;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.core.io.FileSystemResource;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestClient;
import org.springframework.web.client.RestClientResponseException;
import org.web.common.exceptions.ApplicationException;

import java.nio.file.Path;
import java.time.Duration;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class FptKycProvider implements KycProvider {

    private static final List<DateTimeFormatter> DATE_FORMATS = List.of(
            DateTimeFormatter.ofPattern("dd/MM/yyyy"),
            DateTimeFormatter.ofPattern("yyyy-MM-dd")
    );

    private final KycProviderProperties properties;
    private final UploadedFileResolver fileResolver;
    private final ObjectMapper objectMapper;

    @Override
    public String name() {
        return "fpt";
    }

    @Override
    public boolean supports(String providerName) {
        return name().equalsIgnoreCase(providerName);
    }

    @Override
    public KycVerificationResult verifyOcr(String frontImageUrl, String backImageUrl) {
        if (properties.getFpt().getApiKey() == null || properties.getFpt().getApiKey().isBlank()) {
            log.error("FPT KYC provider selected but API key is missing");
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "FPT API key is not configured");
        }
        log.info("FPT KYC OCR started");
        Path front = fileResolver.resolve(frontImageUrl);
        Path back = fileResolver.resolve(backImageUrl);
        try {
            KycOcrResult frontOcr = recognizeId(front);
            KycOcrResult backOcr = recognizeId(back);
            log.info("FPT KYC OCR completed: frontSuccess={}, backSuccess={}",
                    frontOcr.isSuccessful(), backOcr.isSuccessful());
            return KycVerificationResult.builder()
                    .provider(name())
                    .frontOcr(frontOcr)
                    .backOcr(backOcr)
                    .build();
        } finally {
            fileResolver.cleanup(front);
            fileResolver.cleanup(back);
        }
    }

    @Override
    public KycFaceMatchResult verifyFace(String frontImageUrl, String selfieImageUrl) {
        if (properties.getFpt().getApiKey() == null || properties.getFpt().getApiKey().isBlank()) {
            log.error("FPT KYC provider selected but API key is missing");
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "FPT API key is not configured");
        }
        log.info("FPT KYC facematch started");
        Path front = fileResolver.resolve(frontImageUrl);
        Path selfie = fileResolver.resolve(selfieImageUrl);
        try {
            KycFaceMatchResult faceMatch = checkFace(front, selfie);
            log.info("FPT KYC facematch completed: faceMatched={}", faceMatch.isMatched());
            return faceMatch;
        } finally {
            fileResolver.cleanup(front);
            fileResolver.cleanup(selfie);
        }
    }

    @Override
    public KycLivenessResult verifyLiveness(String livenessVideoUrl, String faceImageUrl) {
        if (properties.getFpt().getApiKey() == null || properties.getFpt().getApiKey().isBlank()) {
            log.error("FPT KYC provider selected but API key is missing");
            throw new ApplicationException(HttpStatus.BAD_REQUEST, "FPT API key is not configured");
        }
        log.info("FPT KYC liveness started");
        Path video = fileResolver.resolve(livenessVideoUrl);
        Path faceImage = fileResolver.resolve(faceImageUrl);
        try {
            String raw = postLiveness(video, faceImage);
            KycLivenessResult result = parseLivenessResponse(raw);
            double score = result.getScore();
            boolean passed = result.isPassed();
            log.info("FPT KYC liveness completed: passed={}, score={}", passed, score);
            return result;
        } catch (RestClientResponseException e) {
            log.warn("FPT liveness call failed: status={}, body={}", e.getStatusCode(), e.getResponseBodyAsString());
            return livenessUnavailableResult(e.getStatusCode().value(), e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Failed to parse FPT liveness response: {}", e.getMessage(), e);
            return livenessUnavailableResult(502, e.getMessage());
        } finally {
            fileResolver.cleanup(video);
            fileResolver.cleanup(faceImage);
        }
    }

    private KycLivenessResult livenessUnavailableResult(int statusCode, String detail) {
        return KycLivenessResult.builder()
                .score(0)
                .passed(false)
                .spoofDetected(false)
                .multipleFacesDetected(false)
                .rawResponse("{\"provider\":\"fpt\",\"livenessUnavailable\":true,\"statusCode\":" + statusCode
                        + ",\"detail\":\"" + sanitizeJsonText(detail) + "\"}")
                .build();
    }

    private KycOcrResult recognizeId(Path imagePath) {
        log.debug("Calling FPT OCR: url={}, image={}", properties.getFpt().getIdrUrl(), imagePath.getFileName());
        String raw = postMultipart(properties.getFpt().getIdrUrl(), "api-key", imagePath, "image");
        try {
            JsonNode root = objectMapper.readTree(raw);
            JsonNode data = root.path("data");
            JsonNode first = data.isArray() && !data.isEmpty() ? data.get(0) : objectMapper.createObjectNode();
            boolean success = root.path("errorCode").asInt(1) == 0 && !first.isMissingNode();
            return KycOcrResult.builder()
                    .identityNumber(text(first, "id"))
                    .fullName(text(first, "name"))
                    .dateOfBirth(parseDate(text(first, "dob")))
                    .gender(normalizeGender(text(first, "sex")))
                    .nationality(first.hasNonNull("nationality") ? text(first, "nationality") : text(first, "ethnicity"))
                    .placeOfOrigin(text(first, "home"))
                    .placeOfResidence(text(first, "address"))
                    .issuedDate(parseDate(text(first, "issue_date")))
                    .expiryDate(parseDate(text(first, "doe")))
                    .confidence(averageConfidence(first))
                    .documentType(first.hasNonNull("type_new") ? text(first, "type_new") : text(first, "type"))
                    .successful(success)
                    .rawResponse(raw)
                    .build();
        } catch (Exception e) {
            log.error("Failed to parse FPT OCR response for image={}: {}", imagePath.getFileName(), e.getMessage(), e);
            throw new ApplicationException(HttpStatus.BAD_GATEWAY, "Failed to parse FPT OCR response");
        }
    }

    private KycFaceMatchResult checkFace(Path idImage, Path selfie) {
        log.debug("Calling FPT facematch: url={}, idImage={}, selfie={}",
                properties.getFpt().getFacematchUrl(), idImage.getFileName(), selfie.getFileName());
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("file[]", new FileSystemResource(idImage));
        body.add("file[]", new FileSystemResource(selfie));
        String raw = restClient()
                .post()
                .uri(properties.getFpt().getFacematchUrl())
                .header("api_key", properties.getFpt().getApiKey())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);
        try {
            return parseFaceMatchResponse(raw);
        } catch (Exception e) {
            log.error("Failed to parse FPT facematch response: {}", e.getMessage(), e);
            throw new ApplicationException(HttpStatus.BAD_GATEWAY, "Failed to parse FPT facematch response");
        }
    }

    KycFaceMatchResult parseFaceMatchResponse(String raw) throws Exception {
        JsonNode root = objectMapper.readTree(raw);
        JsonNode data = payloadNode(root, "face_match");
        double similarity = data.path("similarity").asDouble(0);
        return KycFaceMatchResult.builder()
                .similarity(similarity)
                .matched(firstBoolean(data, similarity >= 80, "isMatch", "is_match", "matched"))
                .rawResponse(raw)
                .build();
    }

    KycLivenessResult parseLivenessResponse(String raw) throws Exception {
        JsonNode root = objectMapper.readTree(raw);
        JsonNode data = payloadNode(root, "liveness");
        boolean hasScore = hasAny(data, "liveness_score", "live_score", "score", "prob", "liveness");
        double score = firstDouble(data, "liveness_score", "live_score", "score", "prob", "liveness");
        double spoofProbability = firstDouble(data, "spoof_prob", "spoof_probability");
        if (!hasScore && hasAny(data, "isLive", "is_live", "live")) {
            score = firstBoolean(data, false, "isLive", "is_live", "live") ? 1 : 0;
        } else if (!hasScore && hasAny(data, "spoof_prob", "spoof_probability")) {
            score = Math.max(0, 1 - spoofProbability);
        }
        boolean spoofDetected = firstBoolean(data, spoofProbability >= 0.50,
                "spoof_detected", "isSpoof", "spoof");
        boolean multipleFaces = firstBoolean(data, false,
                "multiple_faces_detected", "multipleFaces", "multi_face");
        boolean passed = firstBoolean(data, score >= 0.80 && !spoofDetected && !multipleFaces,
                "passed", "isLive", "is_live", "live", "liveness");
        return KycLivenessResult.builder()
                .score(score)
                .passed(passed)
                .spoofDetected(spoofDetected)
                .multipleFacesDetected(multipleFaces)
                .rawResponse(raw)
                .build();
    }

    private String postMultipart(String url, String headerName, Path imagePath, String paramName) {
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add(paramName, new FileSystemResource(imagePath));
        return restClient()
                .post()
                .uri(url)
                .header(headerName, properties.getFpt().getApiKey())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);
    }

    private String postLiveness(Path videoPath, Path faceImagePath) {
        log.debug("Calling FPT liveness: url={}, video={}, cmnd={}",
                properties.getFpt().getLivenessUrl(), videoPath.getFileName(), faceImagePath.getFileName());
        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        body.add("video", new FileSystemResource(videoPath));
        body.add("cmnd", new FileSystemResource(faceImagePath));
        return restClient()
                .post()
                .uri(properties.getFpt().getLivenessUrl())
                .header("api-key", properties.getFpt().getApiKey())
                .contentType(MediaType.MULTIPART_FORM_DATA)
                .body(body)
                .retrieve()
                .body(String.class);
    }

    private RestClient restClient() {
        SimpleClientHttpRequestFactory requestFactory = new SimpleClientHttpRequestFactory();
        Duration timeout = Duration.ofMillis(properties.getTimeoutMs());
        requestFactory.setConnectTimeout(timeout);
        requestFactory.setReadTimeout(timeout);
        return RestClient.builder().requestFactory(requestFactory).build();
    }

    private String text(JsonNode node, String field) {
        String value = node.path(field).asText("");
        return "N/A".equalsIgnoreCase(value) ? null : value;
    }

    private LocalDate parseDate(String value) {
        if (value == null || value.isBlank()) return null;
        for (DateTimeFormatter formatter : DATE_FORMATS) {
            try {
                return LocalDate.parse(value.trim(), formatter);
            } catch (Exception ignored) {
            }
        }
        return null;
    }

    private String normalizeGender(String value) {
        if (value == null) return null;
        String normalized = value.trim().toUpperCase();
        if (normalized.equals("NAM") || normalized.equals("MALE")) return "MALE";
        if (normalized.equals("NU") || normalized.equals("NỮ") || normalized.equals("FEMALE")) return "FEMALE";
        return "OTHER";
    }

    private double averageConfidence(JsonNode node) {
        double total = 0;
        int count = 0;
        for (String field : List.of("id_prob", "name_prob", "dob_prob", "address_prob", "home_prob", "doe_prob", "issue_date_prob")) {
            if (node.hasNonNull(field)) {
                try {
                    total += Double.parseDouble(node.path(field).asText("0"));
                    count++;
                } catch (NumberFormatException ignored) {
                }
            }
        }
        if (count == 0) return 0;
        double avg = total / count;
        return avg > 1 ? avg / 100 : avg;
    }

    private double firstDouble(JsonNode node, String... fields) {
        for (String field : fields) {
            if (node.hasNonNull(field)) {
                double value = node.path(field).asDouble(0);
                return value > 1 ? value / 100 : value;
            }
        }
        return 0;
    }

    private boolean firstBoolean(JsonNode node, boolean fallback, String... fields) {
        for (String field : fields) {
            if (node.hasNonNull(field)) {
                JsonNode value = node.path(field);
                if (value.isTextual()) {
                    String text = value.asText("").trim();
                    if ("true".equalsIgnoreCase(text) || "1".equals(text)) return true;
                    if ("false".equalsIgnoreCase(text) || "0".equals(text)) return false;
                }
                return value.asBoolean(fallback);
            }
        }
        return fallback;
    }

    private JsonNode payloadNode(JsonNode root, String directField) {
        JsonNode data = root.path("data");
        if (hasContent(data)) return data;
        JsonNode direct = root.path(directField);
        if (hasContent(direct)) return direct;
        return root;
    }

    private boolean hasContent(JsonNode node) {
        return !node.isMissingNode() && !node.isNull() && (!node.isObject() || node.size() > 0);
    }

    private boolean hasAny(JsonNode node, String... fields) {
        for (String field : fields) {
            if (node.hasNonNull(field)) return true;
        }
        return false;
    }

    private String sanitizeJsonText(String value) {
        if (value == null) return "";
        return value.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\r", " ")
                .replace("\n", " ");
    }
}
