package com.olsaram.backend.service.ai;

import com.olsaram.backend.dto.ai.AiNoshowRequest;
import com.olsaram.backend.dto.ai.AiNoshowResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiNoshowService {

    private final RestTemplate restTemplate;

    @Value("${ai.server.url}")
    private String aiUrl;

    /**
     * AI 노쇼 예측 (예외 발생 시 null 반환 - 안전 버전)
     * AI 서버가 다운되어도 예약 API는 정상 동작하도록 설계됨
     */
    public AiNoshowResponse safePredict(AiNoshowRequest request) {
        try {
            log.info("========== AI 노쇼 예측 시작 ==========");
            log.info("AI 서버 URL: {}", aiUrl);
            log.info("요청 데이터 - customerId: {}, reservationTime: {}, partySize: {}, paymentMethod: {}",
                     request.getCustomerId(), request.getReservationTime(),
                     request.getPartySize(), request.getPaymentMethod());
            log.info("고객 이력 - 과거 노쇼: {}, 과거 예약: {}, 당일예약: {}",
                     request.getCustomerPastNoshowCount(),
                     request.getCustomerPastReservationCount(),
                     request.getIsSameDayReservation());
            log.info("오늘 예약 목록 개수: {}",
                     request.getTodayReservations() != null ? request.getTodayReservations().size() : 0);

            AiNoshowResponse response = restTemplate.postForObject(aiUrl, request, AiNoshowResponse.class);

            if (response != null) {
                log.info("========== AI 노쇼 예측 성공 ==========");
                log.info("노쇼 확률: {}%", response.getNoshowProbability());
                if (response.getPolicyRecommendation() != null) {
                    log.info("추천 정책: {}", response.getPolicyRecommendation().getRecommendedPolicy());
                    log.info("정책 근거: {}", response.getPolicyRecommendation().getReason());
                }
                if (response.getSuspiciousResult() != null) {
                    log.info("의심 패턴: {}", response.getSuspiciousResult().getSuspiciousPattern());
                    log.info("탐지 근거: {}", response.getSuspiciousResult().getDetectionReason());
                }
                return response;
            } else {
                log.warn("⚠️ AI 서버 응답이 null입니다. 예약은 정상 진행됩니다.");
                return null;
            }
        } catch (Exception e) {
            log.warn("⚠️ AI 서버 호출 실패 - 예약은 정상 진행됩니다. url={}, error={}", aiUrl, e.getMessage());
            log.debug("AI 서버 오류 상세:", e);
            // 예외를 던지지 않고 null 반환 → 예약 API는 정상 동작
            return null;
        }
    }

    /**
     * AI 노쇼 예측 (예외 발생 시 RuntimeException - 기존 버전)
     * @deprecated safePredict() 사용 권장
     */
    @Deprecated
    public AiNoshowResponse predict(AiNoshowRequest request) {
        try {
            return safePredict(request);
        } catch (Exception e) {
            throw new RuntimeException("AI 노쇼 예측 실패", e);
        }
    }
}
