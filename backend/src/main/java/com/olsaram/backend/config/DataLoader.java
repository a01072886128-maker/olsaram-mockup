package com.olsaram.backend.config;

import com.olsaram.backend.entity.noshow.ReservationData;
import com.olsaram.backend.repository.noshow.ReservationDataRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.io.BufferedReader;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;

@Configuration
public class DataLoader {

    @Bean
    CommandLineRunner loadData(ReservationDataRepository repository) {
        return args -> {
            if (repository.count() > 0) {
                System.out.println("✅ 이미 DB에 데이터가 존재하므로 CSV import 생략");
                return;
            }
            System.out.println("📁 CSV 로드 시도 중...");
            System.out.println("📄 경로 확인: " + getClass().getResource("/dummy_noshow_data.csv"));
            System.out.println("📄 파일 존재 여부: " + (getClass().getResourceAsStream("/dummy_noshow_data.csv") != null));

            try {
                System.out.println("📁 CSV 경로 로드 시도 중...");
                InputStream is = getClass().getResourceAsStream("/dummy_noshow_data.csv");
                System.out.println("📄 파일 존재 여부: " + (is != null));

                if (is == null) {
                    System.err.println("❌ CSV 파일을 찾을 수 없습니다. (src/main/resources/dummy_noshow_data.csv)");
                    return;
                }

                BufferedReader reader = new BufferedReader(new InputStreamReader(is, StandardCharsets.UTF_8));

                reader.lines().skip(1).forEach(line -> {
                    try {
                        String[] p = line.split(",",-1);
                        if (p.length < 17) {
                            System.err.println("⚠ 열 개수 불일치 (" + p.length + "개): " + line);
                            return;
                        }

                        ReservationData data = new ReservationData();
                        data.setReservationId(p[0].trim());
                        data.setCustomerId(p[1].trim());
                        data.setCustomerName(p[2].trim());
                        data.setDateTime(p[3].trim());
                        data.setAmount(Double.valueOf(p[4].trim()));
                        data.setVisitHistory(Integer.valueOf(p[5].trim()));
                        data.setCancelCount(Integer.valueOf(p[6].trim()));
                        data.setNoshowHistory(Integer.valueOf(p[7].trim()));
                        data.setPaymentPattern(p[8].trim());
                        data.setBehaviorNote(p[9].trim());
                        data.setLoyaltyGrade(p[10].trim());
                        data.setLeadTimeHours(Integer.valueOf(p[11].trim()));
                        data.setHolidayFlag(Integer.valueOf(p[12].trim()));
                        data.setRegion(p[13].trim());
                        data.setEventNearby(p[14].trim());

                        if (p.length > 15 && !p[15].isBlank())
                            data.setLabel(Integer.valueOf(p[15].trim()));
                        if (p.length > 16)
                            data.setReason(p[16].trim());

                        repository.save(data);

                    } catch (Exception e) {
                        System.err.println("⚠ CSV 행 파싱 오류: " + line);
                        e.printStackTrace();
                    }
                });

                System.out.println("✅ CSV에서 ReservationData 더미데이터를 성공적으로 불러왔습니다.");

            } catch (Exception e) {
                System.err.println("❌ CSV 로드 실패: " + e.getMessage());
            }
        };
    }
}
