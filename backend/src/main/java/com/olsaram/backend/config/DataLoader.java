package com.olsaram.backend.config;

import com.olsaram.backend.entity.NoShowAnalysis;
import com.olsaram.backend.repository.NoShowAnalysisRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(NoShowAnalysisRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                System.out.println("✅ 이미 DB에 데이터가 존재하므로 CSV import 생략");
                return;
            }

            try (BufferedReader reader = new BufferedReader(
                    new InputStreamReader(
                            getClass().getResourceAsStream("/dummy_noshow_data.csv"),
                            StandardCharsets.UTF_8))) {

                // 헤더 건너뛰기
                reader.lines().skip(1).forEach(line -> {
                    try {
                        String[] p = line.split(",");

                        NoShowAnalysis data = new NoShowAnalysis();
                        data.setReservationId(p[0].trim());
                        data.setCustomerId(p[1].trim());
                        data.setDateTime(p[2].trim());
                        data.setAmount(Double.valueOf(p[3].trim()));
                        data.setVisitHistory(Integer.valueOf(p[4].trim()));
                        data.setCancelCount(Integer.valueOf(p[5].trim()));
                        data.setNoshowHistory(Integer.valueOf(p[6].trim()));
                        data.setPaymentPattern(p[7].trim());
                        data.setBehaviorNote(p[8].trim());

                        // label과 reason은 비어있을 수 있음
                        if (p.length > 9 && !p[9].isBlank())
                            data.setLabel(Integer.valueOf(p[9].trim()));
                        if (p.length > 10)
                            data.setReason(p[10].trim());

                        repository.save(data);
                    } catch (Exception e) {
                        System.err.println("⚠ CSV 행 파싱 오류: " + line);
                    }
                });

                System.out.println("✅ CSV에서 더미데이터를 성공적으로 불러왔습니다.");

            } catch (Exception e) {
                System.err.println("❌ CSV 로드 실패: " + e.getMessage());
            }
        };
    }
}
