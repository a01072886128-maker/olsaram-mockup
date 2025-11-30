package com.olsaram.backend.service.payment;

import com.olsaram.backend.config.TossPaymentProperties;
import com.olsaram.backend.dto.payment.TossPaymentOrderRequest;
import com.olsaram.backend.dto.payment.TossPaymentOrderResponse;
import com.olsaram.backend.dto.payment.TossPaymentRequest;
import com.olsaram.backend.dto.payment.TossPaymentResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.Reader;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.Base64;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class TossPaymentService {

    private final TossPaymentProperties properties;
    private final WebClient webClient;

    /**
     * 토스 페이먼츠 결제 주문 생성
     * 테스트 모드에서는 주문 ID만 생성하여 반환
     */
    public TossPaymentOrderResponse createOrder(TossPaymentOrderRequest request) {
        if (properties.isTestMode()) {
            // 테스트 모드: 주문 ID 생성
            String orderId = "order_" + request.getReservationId() + "_" + System.currentTimeMillis();
            
            log.info("🧪 [토스 페이먼츠 테스트 모드] 결제 주문 생성 - 예약ID: {}, 주문ID: {}, 금액: {}원",
                    request.getReservationId(), orderId, request.getAmount());
            
            // 테스트 모드: 실제 토스 페이먼츠 테스트 클라이언트 키 사용
            // 토스 페이먼츠 테스트 환경: https://developers.tosspayments.com/guides/test-keys
            // 사용자가 제공한 클라이언트 키 사용
            String testClientKey = "test_gck_docs_Ovk5rk1EwkEbP0W43n07xlzm"; // 토스 페이먼츠 공식 테스트 클라이언트 키
            
            return TossPaymentOrderResponse.builder()
                    .orderId(orderId)
                    .orderName(request.getOrderName())
                    .amount(request.getAmount())
                    .clientKey(testClientKey)
                    .customerName(request.getCustomerName())
                    .customerEmail(request.getCustomerEmail())
                    .build();
        }

        // 실제 모드: 토스 페이먼츠 API 호출 (추후 구현)
        throw new UnsupportedOperationException("실제 모드는 아직 구현되지 않았습니다.");
    }

    /**
     * 토스 페이먼츠 결제 승인
     * 테스트 모드에서는 실제 API 호출 없이 모의 승인 처리
     */
    public TossPaymentResponse confirmPayment(TossPaymentRequest request) {
        if (properties.isTestMode()) {
            // 테스트 모드: 실제 API 호출 없이 모의 승인
            log.info("🧪 [토스 페이먼츠 테스트 모드] 결제 승인 - 예약ID: {}, 금액: {}원", 
                    request.getReservationId(), request.getAmount());
            
            return TossPaymentResponse.builder()
                    .paymentKey("test_payment_key_" + System.currentTimeMillis())
                    .orderId(request.getOrderId())
                    .orderName("예약금 결제")
                    .status("DONE")
                    .totalAmount(request.getAmount())
                    .method("카드")
                    .approvedAt(LocalDateTime.now())
                    .build();
        }

        // 실제 모드: 토스 페이먼츠 API 호출
        try {
            String authHeader = createAuthHeader();
            
            Map<String, Object> requestBody = Map.of(
                    "paymentKey", request.getPaymentKey(),
                    "orderId", request.getOrderId(),
                    "amount", request.getAmount()
            );

            Map<String, Object> response = webClient.post()
                    .uri(properties.getApiUrl() + "/payments/confirm")
                    .header(HttpHeaders.AUTHORIZATION, authHeader)
                    .header(HttpHeaders.CONTENT_TYPE, MediaType.APPLICATION_JSON_VALUE)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(Map.class)
                    .block();

            if (response == null) {
                throw new RuntimeException("토스 페이먼츠 API 응답이 null입니다.");
            }

            return TossPaymentResponse.builder()
                    .paymentKey((String) response.get("paymentKey"))
                    .orderId((String) response.get("orderId"))
                    .orderName((String) response.get("orderName"))
                    .status((String) response.get("status"))
                    .totalAmount(Long.valueOf(response.get("totalAmount").toString()))
                    .method((String) response.get("method"))
                    .approvedAt(parseDateTime((String) response.get("approvedAt")))
                    .failureReason((String) response.getOrDefault("failureReason", null))
                    .build();

        } catch (Exception e) {
            log.error("토스 페이먼츠 결제 승인 실패: {}", e.getMessage(), e);
            throw new RuntimeException("토스 페이먼츠 결제 승인 실패: " + e.getMessage(), e);
        }
    }

    /**
     * 인증 헤더 생성 (Basic Auth)
     * 토스페이먼츠 API는 시크릿 키를 사용자 ID로 사용하고, 비밀번호는 사용하지 않습니다.
     * 비밀번호가 없다는 것을 알리기 위해 시크릿 키 뒤에 콜론을 추가합니다.
     */
    private String createAuthHeader() {
        String secretKey = properties.getSecretKey();
        byte[] encodedBytes = Base64.getEncoder().encode((secretKey + ":").getBytes(StandardCharsets.UTF_8));
        return "Basic " + new String(encodedBytes);
    }

    /**
     * 날짜 문자열 파싱
     */
    private LocalDateTime parseDateTime(String dateTimeStr) {
        if (dateTimeStr == null) return LocalDateTime.now();
        try {
            return LocalDateTime.parse(dateTimeStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e) {
            return LocalDateTime.now();
        }
    }
}

