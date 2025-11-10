package com.olsaram.backend.service.ocr;

import com.olsaram.backend.config.ClovaOcrProperties;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.util.MimeTypeUtils;
import org.springframework.web.client.RestClient;

import java.time.Instant;
import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Component
public class ClovaOcrClient {

    private static final Logger log = LoggerFactory.getLogger(ClovaOcrClient.class);

    private final ClovaOcrProperties properties;
    private final RestClient restClient;

    public ClovaOcrClient(ClovaOcrProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    public List<OcrField> extractText(byte[] imageBytes, String format) {
        if (!properties.isConfigured()) {
            throw new IllegalStateException("클로바 OCR 설정이 필요합니다. NCLOUD_OCR_* 환경 변수를 확인하세요.");
        }

        String encodedImage = Base64.getEncoder().encodeToString(imageBytes);
        OcrRequest.Image image = new OcrRequest.Image(format, "menu-" + UUID.randomUUID(), encodedImage);
        OcrRequest request = new OcrRequest("V2", UUID.randomUUID().toString(), Instant.now().toEpochMilli(), Collections.singletonList(image));

        try {
            OcrResponse response = restClient.post()
                    .uri(properties.getInvokeUrl())
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("X-OCR-SECRET", properties.getSecretKey())
                    .headers(headers -> {
                        if (properties.getApiKeyId() != null && !properties.getApiKeyId().isBlank()) {
                            headers.add("X-NCP-APIGW-API-KEY-ID", properties.getApiKeyId());
                        }
                        if (properties.getApiKey() != null && !properties.getApiKey().isBlank()) {
                            headers.add("X-NCP-APIGW-API-KEY", properties.getApiKey());
                        }
                    })
                    .body(request)
                    .retrieve()
                    .body(OcrResponse.class);

            if (response == null || response.images() == null) {
                return Collections.emptyList();
            }

            return response.images().stream()
                    .flatMap(imageResult -> imageResult.fields().stream())
                    .map(field -> new OcrField(field.inferText(), field.inferConfidence()))
                    .collect(Collectors.toList());
        } catch (Exception ex) {
            log.error("클로바 OCR 호출 실패", ex);
            throw new IllegalStateException("메뉴판 이미지를 분석하지 못했습니다. 잠시 후 다시 시도해주세요.");
        }
    }

    public String detectFormat(String originalContentType, String originalFilename) {
        if (originalContentType != null) {
            if (MimeTypeUtils.IMAGE_JPEG_VALUE.equals(originalContentType)) {
                return "jpg";
            }
            if (MimeTypeUtils.IMAGE_PNG_VALUE.equals(originalContentType)) {
                return "png";
            }
            if ("image/webp".equals(originalContentType)) {
                return "webp";
            }
        }

        if (originalFilename != null && originalFilename.contains(".")) {
            return originalFilename.substring(originalFilename.lastIndexOf('.') + 1);
        }

        return "jpg";
    }

    public record OcrField(String text, Double confidence) {
    }

    private record OcrRequest(
            String version,
            String requestId,
            Long timestamp,
            List<Image> images
    ) {
        private record Image(String format, String name, String data) {
        }
    }

    private record OcrResponse(List<ImageResult> images) {
        private record ImageResult(List<Field> fields) {
        }

        private record Field(String inferText, Double inferConfidence) {
        }
    }
}
