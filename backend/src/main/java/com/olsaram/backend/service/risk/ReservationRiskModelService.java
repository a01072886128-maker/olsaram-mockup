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

        String scriptPath = resolvePath(properties.getScriptPath());
        String modelPath = resolvePath(properties.getModelPath());
        
        // 파일 존재 여부 사전 확인
        Path scriptFile = Paths.get(scriptPath);
        Path modelFile = Paths.get(modelPath);
        
        if (!scriptFile.toFile().exists()) {
            log.error("❌ ML 모델 스크립트 파일을 찾을 수 없습니다: {}", scriptPath);
            log.error("❌ 작업 디렉토리: {}", Paths.get("").toAbsolutePath().normalize());
            return Optional.empty();
        }
        
        if (!modelFile.toFile().exists()) {
            log.error("❌ ML 모델 파일을 찾을 수 없습니다: {}", modelPath);
            log.error("❌ 작업 디렉토리: {}", Paths.get("").toAbsolutePath().normalize());
            return Optional.empty();
        }
        
        // 실행 권한 확인 (스크립트 파일인 경우)
        if (!scriptFile.toFile().canRead()) {
            log.error("❌ ML 모델 스크립트 파일을 읽을 수 없습니다: {}", scriptPath);
            return Optional.empty();
        }
        
        List<String> command = new ArrayList<>();
        command.add(properties.getPythonCommand());
        command.add(scriptPath);
        command.add("--model");
        command.add(modelPath);
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
        
        // 작업 디렉토리 설정 (스크립트가 있는 디렉토리)
        builder.directory(scriptFile.getParent().toFile());

        try {
            log.info("🔵 ML 모델 스크립트 실행 시작 - 명령어: {}", String.join(" ", command));
            log.info("🔵 작업 디렉토리: {}", Paths.get("").toAbsolutePath().normalize());
            
            Process process = builder.start();
            byte[] rawOutput = process.getInputStream().readAllBytes();
            int exitCode = process.waitFor();
            String output = new String(rawOutput, StandardCharsets.UTF_8).trim();

            if (exitCode != 0) {
                log.error("❌ ML 모델 스크립트 실행 실패 - 종료 코드: {}, 출력: {}", exitCode, output);
                log.error("❌ 실행 명령어: {}", String.join(" ", command));
                log.error("❌ 작업 디렉토리: {}", Paths.get("").toAbsolutePath().normalize());
                log.error("❌ Python 명령어 경로: {}", properties.getPythonCommand());
                log.error("❌ 스크립트 파일 경로: {}", scriptPath);
                log.error("❌ 모델 파일 경로: {}", modelPath);
                log.error("❌ 스크립트 파일 존재 여부: {}, 읽기 가능: {}", scriptFile.toFile().exists(), scriptFile.toFile().canRead());
                log.error("❌ 모델 파일 존재 여부: {}, 읽기 가능: {}", modelFile.toFile().exists(), modelFile.toFile().canRead());
                
                return Optional.empty();
            }

            if (output.isEmpty()) {
                log.error("❌ ML 모델 스크립트가 출력을 반환하지 않았습니다. 종료 코드: {}", exitCode);
                log.error("❌ 실행 명령어: {}", String.join(" ", command));
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
        // 절대 경로인 경우 그대로 반환
        Path pathObj = Paths.get(path);
        if (pathObj.isAbsolute()) {
            return pathObj.normalize().toString();
        }
        
        // 상대 경로인 경우 프로젝트 루트(backend 디렉토리)를 기준으로 해석
        Path basePath = Paths.get("").toAbsolutePath().normalize();
        
        log.debug("🔍 경로 해석 - 입력 경로: {}, 작업 디렉토리: {}", path, basePath);
        
        // 현재 작업 디렉토리가 프로젝트 루트인지 확인
        // backend 디렉토리에서 실행되는 경우를 고려
        Path resolved;
        if (basePath.endsWith("backend")) {
            // 이미 backend 디렉토리에 있음
            resolved = basePath.resolve(path).normalize();
        } else {
            // 프로젝트 루트에서 실행되는 경우 backend 디렉토리 추가
            Path backendPath = basePath.resolve("backend");
            if (backendPath.toFile().exists()) {
                resolved = backendPath.resolve(path).normalize();
            } else {
                // backend 디렉토리가 없으면 현재 디렉토리 기준
                resolved = basePath.resolve(path).normalize();
            }
        }
        
        String resolvedStr = resolved.toString();
        boolean exists = resolved.toFile().exists();
        log.debug("🔍 경로 해석 결과 - 해석된 경로: {}, 존재 여부: {}", resolvedStr, exists);
        
        if (!exists) {
            log.warn("⚠️ 경로가 존재하지 않습니다: {}", resolvedStr);
        }
        
        return resolvedStr;
    }
}
