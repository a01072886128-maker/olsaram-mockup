package com.olsaram.backend.util;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * GPT Vision API로부터 받은 메뉴 정보를 파싱하는 유틸리티 클래스
 */
@Slf4j
public class GptMenuParser {

    private static final ObjectMapper objectMapper = new ObjectMapper();

    /**
     * GPT Vision에게 보낼 최적화된 프롬프트를 반환
     * 메뉴명-가격 매칭 정확도를 높이고 JSON 형식을 명확히 지정
     *
     * @return GPT Vision API에 전달할 프롬프트 문자열
     */
    public static String getMenuExtractionPrompt() {
        return """
                이 이미지는 음식점의 메뉴판입니다. 다음 규칙에 따라 메뉴 정보를 추출해주세요:

                [추출 규칙]
                1. 메뉴명과 가격을 정확히 매칭하여 추출하세요
                2. 가격은 숫자만 추출하세요 (원, ₩, , 등의 기호 제거)
                3. 메뉴 설명이나 재료는 제외하고 메뉴명만 추출하세요
                4. 카테고리명(예: 메인요리, 사이드메뉴)은 제외하세요
                5. 가격이 없는 항목은 제외하세요

                [출력 형식]
                반드시 아래의 JSON 배열 형식으로만 응답하세요. 다른 텍스트는 포함하지 마세요:

                [
                  {
                    "name": "메뉴명1",
                    "price": 15000
                  },
                  {
                    "name": "메뉴명2",
                    "price": 12000
                  }
                ]

                주의사항:
                - JSON 형식만 출력하세요 (마크다운 코드 블록 사용 금지)
                - name은 문자열, price는 숫자(정수)여야 합니다
                - 가격에서 모든 쉼표와 기호를 제거하세요
                """;
    }

    /**
     * GPT Vision API 응답을 안전하게 파싱
     * 마크다운 블록 제거, JSON 파싱 오류 처리 포함
     *
     * @param gptResponse GPT Vision API로부터 받은 응답 문자열
     * @return 파싱된 메뉴 정보 리스트 [{'name': 메뉴명, 'price': 가격}]
     */
    public static List<Map<String, Object>> parseMenuResponse(String gptResponse) {
        if (gptResponse == null || gptResponse.trim().isEmpty()) {
            log.warn("GPT 응답이 비어있습니다.");
            return new ArrayList<>();
        }

        try {
            // 1. 마크다운 코드 블록 제거
            String cleanedResponse = removeMarkdownCodeBlocks(gptResponse);

            // 2. JSON 배열 추출 (혹시 앞뒤에 다른 텍스트가 있을 경우 대비)
            String jsonArray = extractJsonArray(cleanedResponse);

            if (jsonArray == null || jsonArray.trim().isEmpty()) {
                log.warn("JSON 배열을 찾을 수 없습니다. 원본 응답: {}", gptResponse);
                return new ArrayList<>();
            }

            // 3. JSON 파싱
            List<Map<String, Object>> menuList = objectMapper.readValue(
                jsonArray,
                new TypeReference<List<Map<String, Object>>>() {}
            );

            // 4. 데이터 검증 및 정제
            return validateAndCleanMenuData(menuList);

        } catch (JsonProcessingException e) {
            log.error("JSON 파싱 실패. 응답: {}", gptResponse, e);

            // 5. 파싱 실패 시 대체 파싱 시도
            return fallbackParsing(gptResponse);
        } catch (Exception e) {
            log.error("메뉴 응답 파싱 중 예상치 못한 오류 발생", e);
            return new ArrayList<>();
        }
    }

    /**
     * 마크다운 코드 블록 제거
     * ```json ... ``` 또는 ``` ... ``` 형식 제거
     */
    private static String removeMarkdownCodeBlocks(String response) {
        // ```json ... ``` 패턴 제거
        String cleaned = response.replaceAll("```json\\s*", "");
        // ``` ... ``` 패턴 제거
        cleaned = cleaned.replaceAll("```\\s*", "");
        return cleaned.trim();
    }

    /**
     * 응답 문자열에서 JSON 배열 부분만 추출
     * [ ... ] 형식의 첫 번째 JSON 배열을 찾음
     */
    private static String extractJsonArray(String response) {
        // JSON 배열 시작과 끝 찾기
        int startIndex = response.indexOf('[');
        int endIndex = response.lastIndexOf(']');

        if (startIndex != -1 && endIndex != -1 && endIndex > startIndex) {
            return response.substring(startIndex, endIndex + 1);
        }

        return response;
    }

    /**
     * 메뉴 데이터 검증 및 정제
     * name과 price 필드가 올바른지 확인하고, 잘못된 데이터 제거
     */
    private static List<Map<String, Object>> validateAndCleanMenuData(List<Map<String, Object>> menuList) {
        List<Map<String, Object>> cleanedList = new ArrayList<>();

        for (Map<String, Object> menu : menuList) {
            try {
                // name 필드 검증
                Object nameObj = menu.get("name");
                if (nameObj == null || nameObj.toString().trim().isEmpty()) {
                    log.warn("메뉴명이 비어있어 제외합니다: {}", menu);
                    continue;
                }
                String name = nameObj.toString().trim();

                // price 필드 검증 및 변환
                Object priceObj = menu.get("price");
                if (priceObj == null) {
                    log.warn("가격이 없어 제외합니다: {}", menu);
                    continue;
                }

                Integer price = convertToInteger(priceObj);
                if (price == null || price <= 0) {
                    log.warn("잘못된 가격으로 제외합니다: {}", menu);
                    continue;
                }

                // 정제된 데이터 추가
                Map<String, Object> cleanedMenu = new HashMap<>();
                cleanedMenu.put("name", name);
                cleanedMenu.put("price", price);
                cleanedList.add(cleanedMenu);

            } catch (Exception e) {
                log.warn("메뉴 항목 검증 중 오류 발생, 제외합니다: {}", menu, e);
            }
        }

        return cleanedList;
    }

    /**
     * Object를 Integer로 안전하게 변환
     * 문자열에서 숫자만 추출하여 변환
     */
    private static Integer convertToInteger(Object priceObj) {
        try {
            if (priceObj instanceof Number) {
                return ((Number) priceObj).intValue();
            } else if (priceObj instanceof String) {
                String priceStr = priceObj.toString();
                // 문자열에서 숫자만 추출 (쉼표, 원화 기호 등 제거)
                String numericStr = priceStr.replaceAll("[^0-9]", "");
                if (!numericStr.isEmpty()) {
                    return Integer.parseInt(numericStr);
                }
            }
        } catch (NumberFormatException e) {
            log.warn("가격 변환 실패: {}", priceObj, e);
        }
        return null;
    }

    /**
     * JSON 파싱 실패 시 정규식을 이용한 대체 파싱
     * "name": "메뉴명", "price": 15000 형식의 데이터를 추출
     */
    private static List<Map<String, Object>> fallbackParsing(String response) {
        List<Map<String, Object>> menuList = new ArrayList<>();

        try {
            // "name" : "메뉴명" 과 "price" : 숫자 패턴 찾기
            Pattern namePattern = Pattern.compile("\"name\"\\s*:\\s*\"([^\"]+)\"");
            Pattern pricePattern = Pattern.compile("\"price\"\\s*:\\s*(\\d+)");

            Matcher nameMatcher = namePattern.matcher(response);
            Matcher priceMatcher = pricePattern.matcher(response);

            // name과 price를 순서대로 매칭
            while (nameMatcher.find() && priceMatcher.find()) {
                String name = nameMatcher.group(1).trim();
                String priceStr = priceMatcher.group(1);

                try {
                    int price = Integer.parseInt(priceStr);
                    if (!name.isEmpty() && price > 0) {
                        Map<String, Object> menu = new HashMap<>();
                        menu.put("name", name);
                        menu.put("price", price);
                        menuList.add(menu);
                    }
                } catch (NumberFormatException e) {
                    log.warn("대체 파싱 중 가격 변환 실패: {}", priceStr);
                }
            }

            if (!menuList.isEmpty()) {
                log.info("대체 파싱으로 {} 개의 메뉴 추출 성공", menuList.size());
            }

        } catch (Exception e) {
            log.error("대체 파싱 중 오류 발생", e);
        }

        return menuList;
    }
}
