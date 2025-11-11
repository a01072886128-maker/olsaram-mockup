package com.olsaram.backend.service.ocr;

import com.fasterxml.jackson.annotation.JsonInclude;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.olsaram.backend.config.OpenAiProperties;
import com.olsaram.backend.util.GptMenuParser;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestClient;

import java.util.Base64;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Component
public class OpenAiOcrClient {

    private static final Logger log = LoggerFactory.getLogger(OpenAiOcrClient.class);
    private static final String OPENAI_API_URL = "https://api.openai.com/v1/chat/completions";

    private final OpenAiProperties properties;
    private final RestClient restClient;

    public OpenAiOcrClient(OpenAiProperties properties) {
        this.properties = properties;
        this.restClient = RestClient.create();
    }

    public List<OcrField> extractText(byte[] imageBytes, String format) {
        if (!properties.isConfigured()) {
            log.error("OpenAI API 키가 설정되지 않았습니다.");
            throw new IllegalStateException("OpenAI API 설정이 필요합니다. OPENAI_API_KEY 환경 변수를 확인하세요.");
        }

        log.info("OpenAI OCR 요청 시작 - 이미지 크기: {} bytes, 형식: {}", imageBytes.length, format);

        String base64Image = Base64.getEncoder().encodeToString(imageBytes);
        String mediaType = getMediaType(format);

        try {
            OpenAiRequest request = createRequest(base64Image, mediaType);
            log.debug("OpenAI API 요청 생성 완료 - 모델: {}", request.model);

            OpenAiResponse response = restClient.post()
                    .uri(OPENAI_API_URL)
                    .contentType(MediaType.APPLICATION_JSON)
                    .header("Authorization", "Bearer " + properties.getApiKey())
                    .body(request)
                    .retrieve()
                    .body(OpenAiResponse.class);

            if (response == null || response.choices == null || response.choices.isEmpty()) {
                log.warn("OpenAI API 응답이 비어있습니다.");
                return Collections.emptyList();
            }

            // GPT의 응답에서 메뉴 항목 파싱
            String content = response.choices.get(0).message.content;
            log.info("OpenAI API 응답 수신 성공 - 응답 길이: {}", content.length());
            log.debug("OpenAI API 응답 내용: {}", content);

            return parseMenuItems(content);

        } catch (Exception ex) {
            log.error("OpenAI OCR 호출 실패 - 오류 타입: {}, 메시지: {}",
                ex.getClass().getSimpleName(), ex.getMessage(), ex);
            throw new IllegalStateException("메뉴판 이미지를 분석하지 못했습니다. 잠시 후 다시 시도해주세요.", ex);
        }
    }

    private OpenAiRequest createRequest(String base64Image, String mediaType) {
        // GptMenuParser의 최적화된 프롬프트 사용
        String prompt = GptMenuParser.getMenuExtractionPrompt();

        OpenAiRequest.Message message = new OpenAiRequest.Message(
                "user",
                List.of(
                        new OpenAiRequest.Content("text", prompt),
                        new OpenAiRequest.Content("image_url", new OpenAiRequest.ImageUrl("data:" + mediaType + ";base64," + base64Image))
                )
        );

        return new OpenAiRequest(
                "gpt-4o",
                List.of(message),
                1024,
                0.2
        );
    }

    private List<OcrField> parseMenuItems(String content) {
        // GptMenuParser를 사용하여 안전하게 파싱
        List<java.util.Map<String, Object>> parsedMenus = GptMenuParser.parseMenuResponse(content);

        // 파싱된 결과를 OcrField로 변환
        return parsedMenus.stream()
                .map(menu -> {
                    String name = (String) menu.get("name");
                    Integer price = (Integer) menu.get("price");

                    // "메뉴명: 가격" 형식으로 텍스트 생성
                    String text = name + ": " + price;

                    // 가격이 있으면 신뢰도 95%, 없으면 85%
                    double confidence = (price != null && price > 0) ? 95.0 : 85.0;

                    return new OcrField(text, confidence);
                })
                .collect(Collectors.toList());
    }

    private String getMediaType(String format) {
        return switch (format.toLowerCase()) {
            case "png" -> "image/png";
            case "gif" -> "image/gif";
            case "webp" -> "image/webp";
            default -> "image/jpeg";
        };
    }

    public String detectFormat(String originalContentType, String originalFilename) {
        if (originalContentType != null) {
            if (originalContentType.contains("jpeg") || originalContentType.contains("jpg")) {
                return "jpg";
            }
            if (originalContentType.contains("png")) {
                return "png";
            }
            if (originalContentType.contains("webp")) {
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

    // ===== OpenAI API Request/Response Records =====

    private record OpenAiRequest(
            String model,
            List<Message> messages,
            @JsonProperty("max_tokens")
            Integer maxTokens,
            Double temperature
    ) {
        private record Message(
                String role,
                List<Content> content
        ) {
        }

        @JsonInclude(JsonInclude.Include.NON_NULL)
        private record Content(
                String type,
                @JsonProperty(value = "text")
                String text,
                @JsonProperty(value = "image_url")
                ImageUrl imageUrl
        ) {
            Content(String type, String text) {
                this(type, text, null);
            }

            Content(String type, ImageUrl imageUrl) {
                this(type, null, imageUrl);
            }
        }

        private record ImageUrl(String url) {
        }
    }

    private record OpenAiResponse(
            List<Choice> choices,
            Usage usage
    ) {
        private record Choice(
                Message message
        ) {
            private record Message(
                    String role,
                    String content
            ) {
            }
        }

        private record Usage(
                @JsonProperty("prompt_tokens")
                Integer promptTokens,
                @JsonProperty("completion_tokens")
                Integer completionTokens,
                @JsonProperty("total_tokens")
                Integer totalTokens
        ) {
        }
    }
}
