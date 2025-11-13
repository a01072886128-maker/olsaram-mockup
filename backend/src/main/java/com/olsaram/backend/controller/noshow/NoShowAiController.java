package com.olsaram.backend.controller.noshow;

import com.olsaram.backend.entity.noshow.ReservationData;
import com.olsaram.backend.service.noshow.NoShowAiService;
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

    // ✅ 1. 전체 데이터 조회
    @GetMapping("/all")
    public ResponseEntity<List<ReservationData>> getAllData() {
        return ResponseEntity.ok(service.getAllData());
    }

    // ✅ 2. 예측 수행 + DB 반영
    @PostMapping("/predict")
    public ResponseEntity<Map<String, Object>> predictNoShow() {
        String msg = service.predictAndSave();
        Map<String, Object> res = new LinkedHashMap<>();
        res.put("status", "success");
        res.put("message", msg);
        res.put("timestamp", new Date().toString());
        return ResponseEntity.ok(res);
    }

    // ✅ 3. 예측 결과 보기 (CSV 기반 ReservationData 구조)
    @GetMapping("/results")
    public ResponseEntity<List<Map<String, Object>>> getPredictedResults() {
        List<ReservationData> list = service.getPredictions();
        List<Map<String, Object>> result = new ArrayList<>();

        for (ReservationData n : list) {
            Map<String, Object> map = new LinkedHashMap<>();
            map.put("예약ID", n.getReservationId());
            map.put("고객ID", n.getCustomerId());
            map.put("고객명", n.getCustomerName());
            map.put("예약일시", n.getDateTime());
            map.put("결제금액", n.getAmount());
            map.put("방문이력", n.getVisitHistory());
            map.put("취소횟수", n.getCancelCount());
            map.put("노쇼이력", n.getNoshowHistory());
            map.put("결제패턴", n.getPaymentPattern());
            map.put("행동메모", n.getBehaviorNote());
            map.put("등급", n.getLoyaltyGrade());
            map.put("리드타임(시간)", n.getLeadTimeHours());
            map.put("공휴일", n.getHolidayFlag() == 1 ? "예" : "아니오");
            map.put("지역", n.getRegion());
            map.put("이벤트", n.getEventNearby());

            // ⚙️ 위험도 표시 (label 기준)
            String riskLevel = switch (n.getLabel() != null ? n.getLabel() : 0) {
                case 1 -> "⚠️ 위험";
                default -> "✅ 안전";
            };
            map.put("위험도", riskLevel);

            map.put("사유", n.getReason());
            result.add(map);
        }

        return ResponseEntity.ok(result);
    }

    // ✅ 4. 헬스체크
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> healthCheck() {
        Map<String, String> status = new LinkedHashMap<>();
        status.put("status", "OK");
        status.put("service", "NoShow AI Service");
        status.put("time", new Date().toString());
        return ResponseEntity.ok(status);
    }
}
