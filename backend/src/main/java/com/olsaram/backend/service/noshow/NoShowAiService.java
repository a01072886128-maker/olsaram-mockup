package com.olsaram.backend.service.noshow;

import com.olsaram.backend.entity.noshow.ReservationData;
import com.olsaram.backend.repository.noshow.ReservationDataRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.json.JSONObject;
import org.json.JSONArray;

import java.util.ArrayList;
import java.util.List;

@Service
public class NoShowAiService {

    private final ReservationDataRepository repository;

    @Value("${openai.api.key}")
    private String apiKey;

    private final String apiUrl = "https://api.openai.com/v1/chat/completions";

    public NoShowAiService(ReservationDataRepository repository) {
        this.repository = repository;
    }

    // ✅ 1. DB 전체 조회
    public List<ReservationData> getAllData() {
        return repository.findAll();
    }

    // ✅ 2. LLM 예측 수행 및 DB 반영 (CSV 기반 ReservationData 구조)
    public String predictAndSave() {
        List<ReservationData> list = repository.findAll();
        if (list.isEmpty()) return "⚠️ DB에 데이터가 없습니다.";

        RestTemplate restTemplate = new RestTemplate();
        int count = 0;

        for (ReservationData data : list) {
            try {
                // 🔍 LLM 입력 프롬프트 (CSV 구조 기반)
                String prompt = String.format("""
                아래 예약 데이터를 기반으로 고객의 노쇼 위험도를 예측하세요.
                반드시 아래 JSON 형식으로만 응답하세요:
                {"risk_level": "위험"|"보통"|"안전", "risk_score": 0.0~1.0, "reason": "요약 사유"}

                데이터:
                고객ID=%s, 고객명=%s, 결제금액=%.1f, 방문이력=%d, 취소횟수=%d, 노쇼이력=%d,
                결제패턴=%s, 행동메모=%s, 등급=%s, 리드타임=%d, 공휴일=%d, 지역=%s, 이벤트=%s
                """,
                        data.getCustomerId(),
                        data.getCustomerName(),
                        data.getAmount(),
                        data.getVisitHistory(),
                        data.getCancelCount(),
                        data.getNoshowHistory(),
                        data.getPaymentPattern(),
                        data.getBehaviorNote(),
                        data.getLoyaltyGrade(),
                        data.getLeadTimeHours(),
                        data.getHolidayFlag(),
                        data.getRegion(),
                        data.getEventNearby()
                );

                // 🔧 OpenAI API 요청 생성
                JSONObject requestBody = new JSONObject()
                        .put("model", "gpt-4o-mini")
                        .put("messages", new JSONArray()
                                .put(new JSONObject()
                                        .put("role", "system")
                                        .put("content", "너는 음식점 예약 데이터를 분석해 노쇼 위험도를 예측하는 AI야."))
                                .put(new JSONObject()
                                        .put("role", "user")
                                        .put("content", prompt))
                        );

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey);

                HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
                ResponseEntity<String> response = restTemplate.exchange(apiUrl, HttpMethod.POST, request, String.class);

                JSONObject json = new JSONObject(response.getBody());
                String result = json.getJSONArray("choices")
                        .getJSONObject(0)
                        .getJSONObject("message")
                        .getString("content")
                        .trim();

                // ⚙️ LLM 응답 파싱
                if (!result.startsWith("{")) result = result.substring(result.indexOf("{"));
                JSONObject resultJson = new JSONObject(result);

                String level = resultJson.optString("risk_level", "보통");
                double score = resultJson.optDouble("risk_score", 0.5);
                String reason = resultJson.optString("reason", "분석 실패");

                int label = switch (level) {
                    case "위험" -> 1;
                    case "보통" -> 0;
                    default -> 0;
                };

                // ✅ 예측 결과 저장
                data.setLabel(label);
                data.setRiskScore(score);
                data.setReason(reason);
                repository.save(data);

                count++;
                System.out.printf("✅ [%s] 결과: %s (%.2f) - %s%n", data.getCustomerId(), level, score, reason);

            } catch (Exception e) {
                System.err.println("❌ 예측 실패 [" + data.getCustomerId() + "]: " + e.getMessage());
            }
        }
        return "✅ 예측 완료 — 총 " + count + "건의 데이터 업데이트됨";
    }

    // ✅ 3. 예측 결과만 조회
    public List<ReservationData> getPredictions() {
        List<ReservationData> all = repository.findAll();
        List<ReservationData> predicted = new ArrayList<>();
        for (ReservationData n : all) {
            if (n.getReason() != null) predicted.add(n);
        }
        return predicted;
    }
}
