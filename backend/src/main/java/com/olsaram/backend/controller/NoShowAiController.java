package com.olsaram.backend.controller;

import com.olsaram.backend.entity.NoShowAnalysis;
import com.olsaram.backend.service.NoShowAiService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/noshow")
public class NoShowAiController {

    private final NoShowAiService service;

    public NoShowAiController(NoShowAiService service) {
        this.service = service;
    }

    // ✅ 1. 전체 데이터 조회 (DB 원본 그대로 확인)
    @GetMapping("/all")
    public ResponseEntity<List<NoShowAnalysis>> getAllData() {
        List<NoShowAnalysis> data = service.getAllData();
        return ResponseEntity.ok(data.isEmpty() ? Collections.emptyList() : data);
    }

    // ✅ 2. AI 예측 수행 + DB 반영
    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictNoShow() {
        String message = service.predictAndSave();

        Map<String, Object> response = new LinkedHashMap<>();
        response.put("status", "success");
        response.put("message", message);
        response.put("timestamp", new Date().toString());
        return ResponseEntity.ok(response);
    }

    // ✅ 3. 예측 결과 보기 (위험 / 보통 / 안전 분류별 출력)
    @GetMapping("/results")
    public ResponseEntity<Map<String, List<Map<String, Object>>>> getCategorizedResults() {
        List<NoShowAnalysis> list = service.getPredictions();

        // 세 카테고리별 리스트 초기화
        Map<String, List<Map<String, Object>>> categorized = new LinkedHashMap<>();
        categorized.put("⚠️ 위험", new ArrayList<>());
        categorized.put("⚖️ 보통", new ArrayList<>());
        categorized.put("✅ 안전", new ArrayList<>());

        for (NoShowAnalysis n : list) {
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("예약ID", n.getReservationId());
            item.put("고객ID", n.getCustomerId());
            item.put("결제방식", n.getPaymentPattern());
            item.put("방문기록", n.getVisitHistory());
            item.put("취소횟수", n.getCancelCount());
            item.put("노쇼이력", n.getNoshowHistory());
            item.put("행동특징", n.getBehaviorNote());
            item.put("사유", n.getReason());

            // 라벨 기준으로 분류
            if (n.getLabel() != null) {
                switch (n.getLabel()) {
                    case 2 -> categorized.get("⚠️ 위험").add(item);
                    case 1 -> categorized.get("⚖️ 보통").add(item);
                    default -> categorized.get("✅ 안전").add(item);
                }
            }
        }

        return ResponseEntity.ok(categorized);
    }

    // ✅ 4. 헬스체크 (서버 상태 확인용)
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new LinkedHashMap<>();
        status.put("status", "OK");
        status.put("service", "NoShow AI Service");
        status.put("time", new Date().toString());
        return ResponseEntity.ok(status);
    }
}
