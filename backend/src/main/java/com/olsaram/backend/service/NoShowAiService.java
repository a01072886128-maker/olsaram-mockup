package com.olsaram.backend.service;

import com.olsaram.backend.entity.NoShowAnalysis;
import com.olsaram.backend.repository.NoShowAnalysisRepository;
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

    private final NoShowAnalysisRepository repository;

    // ✅ application.yml에서 OpenAI API 키 주입
    @Value("${openai.api.key}")
    private String apiKey;

    private final String apiUrl = "https://api.openai.com/v1/chat/completions";

    public NoShowAiService(NoShowAnalysisRepository repository) {
        this.repository = repository;
    }

    // ✅ 1. DB 전체 조회
    public List<NoShowAnalysis> getAllData() {
        return repository.findAll();
    }

    // ✅ 2. LLM 예측 수행 및 DB 반영 (3단계 카테고리)
    public String predictAndSave() {
        List<NoShowAnalysis> list = repository.findAll();
        if (list.isEmpty()) {
            return "⚠️ DB에 데이터가 없습니다. CSV를 먼저 불러오세요.";
        }

        RestTemplate restTemplate = new RestTemplate();
        int count = 0;

        System.out.println("🔑 OpenAI API Key 확인: " +
                (apiKey != null ? apiKey.substring(0, 10) + "****" : "❌ null"));
        System.out.println("📊 예측 대상 데이터 수: " + list.size());

        for (NoShowAnalysis data : list) {
            try {
                // 📌 LLM 프롬프트 (3단계 카테고리 분류)
                String prompt = String.format("""
                다음 예약 데이터를 기반으로 고객의 노쇼 위험도를 평가하세요.
                위험도는 아래 3단계 중 하나로 분류하세요:
                - "위험": 노쇼 가능성이 매우 높음
                - "보통": 일부 위험 신호가 있음
                - "안전": 노쇼 가능성이 낮음
                
                결과는 반드시 아래 JSON 형식으로만 반환하세요:
                {"risk_level":"위험|보통|안전", "risk_score":0.0~1.0, "reason":"간단 요약"}

                데이터:
                예약ID=%s, 결제방식=%s, 취소횟수=%d, 방문기록=%d, 노쇼기록=%d, 메모=%s
                """,
                        data.getReservationId(),
                        data.getPaymentPattern(),
                        data.getCancelCount(),
                        data.getVisitHistory(),
                        data.getNoshowHistory(),
                        data.getBehaviorNote()
                );

                JSONObject requestBody = new JSONObject()
                        .put("model", "gpt-4o-mini")
                        .put("messages", new JSONArray()
                                .put(new JSONObject()
                                        .put("role", "system")
                                        .put("content", "너는 음식점 예약 데이터를 분석해 고객의 노쇼 위험도를 예측하는 AI야."))
                                .put(new JSONObject()
                                        .put("role", "user")
                                        .put("content", prompt))
                        );

                HttpHeaders headers = new HttpHeaders();
                headers.setContentType(MediaType.APPLICATION_JSON);
                headers.setBearerAuth(apiKey);

                HttpEntity<String> request = new HttpEntity<>(requestBody.toString(), headers);
                ResponseEntity<String> response =
                        restTemplate.exchange(apiUrl, HttpMethod.POST, request, String.class);

                // 🧠 결과 파싱
                JSONObject json = new JSONObject(response.getBody());
                String result = json.getJSONArray("choices")
                        .getJSONObject(0)
                        .getJSONObject("message")
                        .getString("content")
                        .trim();

                if (!result.startsWith("{")) {
                    result = result.substring(result.indexOf("{"));
                }

                JSONObject resultJson = new JSONObject(result);
                String riskLevel = resultJson.optString("risk_level", "보통");
                double riskScore = resultJson.optDouble("risk_score", 0.0);
                String reason = resultJson.optString("reason", "분석 실패");

                // ⚙️ 위험도 → label 매핑
                int label;
                switch (riskLevel) {
                    case "위험" -> label = 2;
                    case "보통" -> label = 1;
                    default -> label = 0; // 안전
                }

                // 💾 DB 업데이트
                data.setLabel(label);
                data.setReason(reason);
                repository.save(data);
                count++;

                System.out.printf("✅ [%s] 예측 완료: %s (%.2f) - %s%n",
                        data.getReservationId(), riskLevel, riskScore, reason);

            } catch (Exception e) {
                System.err.println("❌ 예측 실패 [" + data.getReservationId() + "]: " + e.getMessage());
            }
        }

        return "✅ 예측 완료 — 총 " + count + "건의 데이터 업데이트됨";
    }

    // ✅ 3. 예측 완료된 데이터만 반환
    public List<NoShowAnalysis> getPredictions() {
        List<NoShowAnalysis> all = repository.findAll();
        List<NoShowAnalysis> predicted = new ArrayList<>();

        for (NoShowAnalysis n : all) {
            if (n.getLabel() != null && n.getReason() != null) {
                predicted.add(n);
            }
        }
        return predicted;
    }
}
