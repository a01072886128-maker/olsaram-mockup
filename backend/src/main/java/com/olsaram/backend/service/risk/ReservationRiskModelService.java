package com.olsaram.backend.service.risk;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.olsaram.backend.config.ReservationRiskModelProperties;
import com.olsaram.backend.domain.customer.Customer;
import com.olsaram.backend.domain.reservation.Reservation;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.TextStyle;
import java.util.ArrayList;
import java.util.List;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class ReservationRiskModelService {

    private final ReservationRiskModelProperties properties;
    private final ObjectMapper objectMapper;

    public Optional<ReservationRiskPrediction> predict(
            Customer customer,
            Reservation reservation,
            String paymentMethod
    ) {
        if (!properties.isEnabled()) {
            log.debug("Risk model disabled via configuration");
            return Optional.empty();
        }

        if (reservation == null || reservation.getReservationTime() == null) {
            log.debug("Skip ML risk prediction because reservation time is null");
            return Optional.empty();
        }

        LocalDateTime reservationTime = reservation.getReservationTime();

        int noshowCount = customer != null && customer.getNoShowCount() != null
                ? customer.getNoShowCount()
                : 0;
        int reservationCount = customer != null && customer.getReservationCount() != null
                ? customer.getReservationCount()
                : 0;
        int hour = reservationTime.getHour();
        int partySize = reservation.getPeople() != null ? reservation.getPeople() : 1;
        String weekday = reservationTime.getDayOfWeek()
                .getDisplayName(TextStyle.SHORT, Locale.ENGLISH);
        String method = StringUtils.hasText(paymentMethod) ? paymentMethod : "CARD";

        List<String> command = new ArrayList<>();
        command.add(properties.getPythonCommand());
        command.add(resolvePath(properties.getScriptPath()));
        command.add("--model");
        command.add(resolvePath(properties.getModelPath()));
        command.add("--noshow_count");
        command.add(String.valueOf(noshowCount));
        command.add("--reservation_count");
        command.add(String.valueOf(reservationCount));
        command.add("--weekday");
        command.add(weekday);
        command.add("--hour");
        command.add(String.valueOf(hour));
        command.add("--party_size");
        command.add(String.valueOf(partySize));
        command.add("--payment_method");
        command.add(method);

        ProcessBuilder builder = new ProcessBuilder(command);
        builder.redirectErrorStream(true);

        try {
            log.debug("Executing ML model script: {}", String.join(" ", command));
            Process process = builder.start();
            byte[] rawOutput = process.getInputStream().readAllBytes();
            int exitCode = process.waitFor();
            String output = new String(rawOutput, StandardCharsets.UTF_8).trim();

            if (exitCode != 0) {
                log.error("❌ ML 모델 스크립트 실행 실패 - 종료 코드: {}, 출력: {}", exitCode, output);
                log.error("실행 명령어: {}", String.join(" ", command));
                return Optional.empty();
            }

            if (output.isEmpty()) {
                log.error("❌ ML 모델 스크립트가 출력을 반환하지 않았습니다. 종료 코드: {}", exitCode);
                log.error("실행 명령어: {}", String.join(" ", command));
                return Optional.empty();
            }

            ReservationRiskPrediction prediction;
            try {
                prediction = objectMapper.readValue(output, ReservationRiskPrediction.class);
            } catch (Exception e) {
                log.error("❌ ML 모델 출력 파싱 실패 - 출력: {}, 오류: {}", output, e.getMessage());
                return Optional.empty();
            }

            log.info("✅ ML 모델 예측 성공 - 레벨: {}, 특징: noshow={}, reservations={}, weekday={}, hour={}, partySize={}, paymentMethod={}",
                    prediction.getRiskLevel(), noshowCount, reservationCount, weekday, hour, partySize, method);

            if (!StringUtils.hasText(prediction.getRiskLevel())) {
                log.error("❌ ML 모델이 빈 위험도 레벨을 반환했습니다. 출력: {}", output);
                return Optional.empty();
            }

            return Optional.of(prediction);
        } catch (InterruptedException e) {
            Thread.currentThread().interrupt();
            log.error("❌ ML 모델 스크립트 실행 중단됨: {}", e.getMessage());
            return Optional.empty();
        } catch (IOException e) {
            log.error("❌ ML 모델 스크립트 실행 실패: {}", e.getMessage(), e);
            log.error("실행 명령어: {}", String.join(" ", command));
            return Optional.empty();
        }
    }

    private String resolvePath(String path) {
        // 상대 경로인 경우 프로젝트 루트(backend 디렉토리)를 기준으로 해석
        Path basePath = Paths.get("").toAbsolutePath().normalize();
        
        // 현재 작업 디렉토리가 프로젝트 루트인지 확인
        // backend 디렉토리에서 실행되는 경우를 고려
        if (basePath.endsWith("backend")) {
            // 이미 backend 디렉토리에 있음
            Path resolved = basePath.resolve(path).normalize();
            return resolved.toString();
        } else {
            // 프로젝트 루트에서 실행되는 경우 backend 디렉토리 추가
            Path resolved = basePath.resolve("backend").resolve(path).normalize();
            return resolved.toString();
        }
    }
}
