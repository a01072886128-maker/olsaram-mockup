package com.olsaram.backend.controller.noshow;

import com.olsaram.backend.dto.FraudDetection.FraudDetectionResponseDto;
import com.olsaram.backend.entity.noshow.ReservationData;
import com.olsaram.backend.service.noshow.NoShowAiService;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.LinkedHashMap;

@RestController
@RequestMapping("/api/noshow")
public class NoShowAiController {

    private final NoShowAiService service;

    public NoShowAiController(NoShowAiService service) {
        this.service = service;
    }

    // ============================
    // 1. 전체 데이터 조회
    // ============================
    @GetMapping("/all")
    public ResponseEntity<List<ReservationData>> getAllData() {
        return ResponseEntity.ok(service.getAllData());
    }

    // ============================
    // 2. AI 예측 실행 (DB 업데이트)
    // ============================
    @PostMapping("/predict")
    public ResponseEntity<String> runPrediction() {
        String result = service.predictAndSave();
        return ResponseEntity.ok(result);
    }

    // ============================
    // 3. 프론트가 사용하는 최종 API
    // axios.post("/api/noshow/results") 와 매칭됨
    // ============================
    @PostMapping("/results")
    public ResponseEntity<FraudDetectionResponseDto> getFraudResults() {
        return ResponseEntity.ok(service.buildFraudDetectionData());
    }

    // ============================
    // 4. 헬스 체크
    // ============================
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new LinkedHashMap<>();
        status.put("status", "OK");
        status.put("service", "NoShow AI Service");
        status.put("time", new Date().toString());
        return ResponseEntity.ok(status);
    }
}
