package com.olsaram.backend.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.business.BusinessOwner;
import com.olsaram.backend.repository.BusinessOwnerRepository;
import com.olsaram.backend.repository.business.MapBusinessRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class KakaoLocalService {

    @Value("${kakao.api.key}")
    private String kakaoApiKey;

    private final MapBusinessRepository businessRepository;
    private final BusinessOwnerRepository businessOwnerRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final RestTemplate restTemplate = new RestTemplate();

    private static final String KAKAO_LOCAL_API_URL = "https://dapi.kakao.com/v2/local/search/category.json";

    /**
     * 카카오 로컬 API로 주변 음식점 검색 후 DB 저장
     * @param lat 위도
     * @param lng 경도
     * @param radius 반경(미터)
     * @return 저장된 가게 수
     */
    @Transactional
    public int fetchAndSaveNearbyRestaurants(double lat, double lng, int radius) {
        List<Business> savedBusinesses = new ArrayList<>();

        // 기본 owner 가져오기 (없으면 생성)
        BusinessOwner defaultOwner = getOrCreateDefaultOwner();

        // 음식점(FD6), 카페(CE7) 카테고리 검색
        String[] categories = {"FD6", "CE7"};

        for (String categoryCode : categories) {
            // 페이지별로 검색 (최대 45페이지 = 최대 675개)
            for (int page = 1; page <= 45; page++) {
                List<Business> businesses = searchKakaoLocal(categoryCode, lat, lng, radius, page, defaultOwner);
                if (businesses.isEmpty()) break;

                for (Business business : businesses) {
                    // 중복 체크 (이름+주소로)
                    if (!businessRepository.existsByBusinessNameAndAddress(
                            business.getBusinessName(), business.getAddress())) {
                        try {
                            Business saved = businessRepository.save(business);
                            savedBusinesses.add(saved);
                        } catch (Exception e) {
                            log.warn("가게 저장 실패: {}", business.getBusinessName());
                        }
                    }
                }

                // API 호출 제한 방지를 위한 딜레이
                try { Thread.sleep(100); } catch (InterruptedException ignored) {}
            }
        }

        log.info("총 {}개 가게 저장 완료", savedBusinesses.size());
        return savedBusinesses.size();
    }

    /**
     * DB 현황 조회
     */
    public java.util.Map<String, Object> getDbStatus() {
        java.util.Map<String, Object> status = new java.util.HashMap<>();

        List<Business> allBusiness = businessRepository.findAll();
        List<BusinessOwner> allOwners = businessOwnerRepository.findAll();

        // 광주 동구 가게만 필터링
        List<Business> dongguBusiness = allBusiness.stream()
                .filter(b -> b.getAddress() != null && b.getAddress().contains("동구"))
                .collect(java.util.stream.Collectors.toList());

        // system_owner 제외한 사장님 목록
        List<BusinessOwner> realOwners = allOwners.stream()
                .filter(o -> !"system_owner".equals(o.getLoginId()))
                .collect(java.util.stream.Collectors.toList());

        status.put("totalBusinessCount", allBusiness.size());
        status.put("dongguBusinessCount", dongguBusiness.size());
        status.put("totalOwnerCount", allOwners.size());
        status.put("realOwnerCount", realOwners.size());
        status.put("existingOwners", realOwners.stream()
                .map(o -> java.util.Map.of("ownerId", o.getOwnerId(), "loginId", o.getLoginId(), "name", o.getName()))
                .collect(java.util.stream.Collectors.toList()));

        return status;
    }

    /**
     * 광주 동구 가게에 사장님 계정 생성 및 연결
     */
    @Transactional
    public java.util.Map<String, Object> assignOwnersToBusinesses() {
        java.util.Map<String, Object> result = new java.util.HashMap<>();

        // 광주 동구 가게만 필터링 (system_owner 소유)
        BusinessOwner systemOwner = businessOwnerRepository.findByLoginId("system_owner").orElse(null);
        if (systemOwner == null) {
            result.put("success", false);
            result.put("message", "system_owner를 찾을 수 없습니다.");
            return result;
        }

        List<Business> dongguBusinesses = businessRepository.findAll().stream()
                .filter(b -> b.getAddress() != null && b.getAddress().contains("동구"))
                .filter(b -> b.getOwner() != null && b.getOwner().getOwnerId().equals(systemOwner.getOwnerId()))
                .collect(java.util.stream.Collectors.toList());

        int createdOwners = 0;
        int linkedBusinesses = 0;
        List<java.util.Map<String, Object>> ownerList = new java.util.ArrayList<>();

        // 기존 owner 숫자 확인 (ownerN 형식)
        int maxOwnerNum = businessOwnerRepository.findAll().stream()
                .filter(o -> o.getLoginId().matches("owner\\d+"))
                .map(o -> Integer.parseInt(o.getLoginId().replace("owner", "")))
                .max(Integer::compareTo)
                .orElse(0);

        int ownerNum = maxOwnerNum + 1;

        for (Business business : dongguBusinesses) {
            String loginId = "owner" + ownerNum;
            String ownerName = business.getBusinessName() + " 사장님";
            String phone = String.format("010-%04d-%04d", ownerNum / 10000 + 1000, ownerNum % 10000);
            String email = loginId + "@olsaram.com";
            String bizNum = String.format("%03d-%02d-%05d", ownerNum / 100000, (ownerNum / 1000) % 100, ownerNum % 1000);

            // 사장님 계정 생성
            BusinessOwner newOwner = BusinessOwner.builder()
                    .loginId(loginId)
                    .password("1234")
                    .name(ownerName)
                    .phone(phone)
                    .email(email)
                    .businessNumber(bizNum)
                    .isVerified(true)
                    .subscriptionPlan("FREE")
                    .maxBusinessCount(5)
                    .totalBusinessCount(1)
                    .totalRevenue(0L)
                    .build();

            BusinessOwner savedOwner = businessOwnerRepository.save(newOwner);
            createdOwners++;

            // 가게와 연결
            business.setOwner(savedOwner);
            businessRepository.save(business);
            linkedBusinesses++;

            ownerList.add(java.util.Map.of(
                    "loginId", loginId,
                    "password", "1234",
                    "businessName", business.getBusinessName(),
                    "address", business.getAddress()
            ));

            ownerNum++;
        }

        result.put("success", true);
        result.put("createdOwners", createdOwners);
        result.put("linkedBusinesses", linkedBusinesses);
        result.put("ownerList", ownerList);
        result.put("message", createdOwners + "개의 사장님 계정 생성 및 " + linkedBusinesses + "개의 가게 연결 완료");

        return result;
    }

    /**
     * 중복 가게 데이터 삭제 (이름+주소 기준)
     */
    @Transactional
    public int removeDuplicateBusinesses() {
        List<Business> allBusinesses = businessRepository.findAll();
        java.util.Set<String> seen = new java.util.HashSet<>();
        List<Long> toDelete = new java.util.ArrayList<>();

        for (Business b : allBusinesses) {
            String key = b.getBusinessName() + "|" + b.getAddress();
            if (seen.contains(key)) {
                toDelete.add(b.getBusinessId());
            } else {
                seen.add(key);
            }
        }

        for (Long id : toDelete) {
            businessRepository.deleteById(id);
        }

        log.info("중복 가게 {}개 삭제 완료", toDelete.size());
        return toDelete.size();
    }

    /**
     * 광주 금남로 주변 샘플 가게 데이터 생성
     */
    private int createSampleRestaurants(BusinessOwner owner) {
        List<Business> savedBusinesses = new ArrayList<>();

        // 샘플 데이터 정의
        Object[][] sampleData = {
            {"금남로 한정식", "123-45-67890", "한식", "광주광역시 동구 금남로 100", "062-123-4567",
             "정통 한정식을 맛볼 수 있는 곳입니다.", 35.1535, 126.9173, 4.5, 127},
            {"금남 차이나타운", "234-56-78901", "중식", "광주광역시 동구 금남로 150", "062-234-5678",
             "정통 중화요리 전문점. 짜장면, 짬뽕, 탕수육이 인기 메뉴입니다.", 35.1555, 126.9210, 4.3, 89},
            {"사쿠라 스시", "345-67-89012", "일식", "광주광역시 동구 금남로 80", "062-345-6789",
             "신선한 회와 초밥을 제공하는 일식 전문점입니다.", 35.1520, 126.9150, 4.7, 156},
            {"금남로 비스트로", "456-78-90123", "양식", "광주광역시 동구 금남로 200", "062-456-7890",
             "프랑스풍 분위기의 양식 레스토랑.", 35.1470, 126.9230, 4.6, 203},
            {"금남로 커피하우스", "567-89-01234", "카페", "광주광역시 동구 금남로 50", "062-567-8901",
             "아늑한 분위기의 카페. 핸드드립 커피와 수제 디저트.", 35.1510, 126.9190, 4.4, 312},
            {"금남 떡볶이", "678-90-12345", "분식", "광주광역시 동구 금남로 250", "062-678-9012",
             "매콤달콤한 떡볶이가 인기인 분식집.", 35.1440, 126.9250, 4.2, 78},
            {"백년가게 한식", "789-01-23456", "한식", "광주광역시 동구 금남로 300", "062-789-0123",
             "3대째 이어온 전통 한식당.", 35.1580, 126.9280, 4.8, 245},
            {"금남 이탈리아노", "890-12-34567", "양식", "광주광역시 동구 금남로 350", "062-890-1234",
             "정통 이탈리아 요리 전문점.", 35.1415, 126.9100, 4.5, 167},
            {"테라스 카페", "901-23-45678", "카페", "광주광역시 동구 금남로 400", "062-901-2345",
             "루프탑 테라스가 있는 카페. 야경이 아름답습니다.", 35.1675, 126.9320, 4.6, 421},
            {"홍콩반점", "012-34-56789", "중식", "광주광역시 동구 금남로 450", "062-012-3456",
             "홍콩식 중화요리 전문점.", 35.1295, 126.9050, 4.4, 134}
        };

        for (Object[] data : sampleData) {
            String name = (String) data[0];
            String businessNumber = (String) data[1];
            String address = (String) data[3];

            // 중복 체크 (이름+주소 또는 사업자등록번호)
            if (businessRepository.existsByBusinessNameAndAddress(name, address) ||
                businessRepository.existsByBusinessNumber(businessNumber)) {
                log.info("이미 존재하는 가게: {}", name);
                continue;
            }

            String category = (String) data[2];
            Business business = Business.builder()
                    .owner(owner)
                    .businessName(name)
                    .businessNumber((String) data[1])
                    .category(category)
                    .address(address)
                    .phone((String) data[4])
                    .description((String) data[5])
                    .businessImageUrl(getRandomFoodImage(category))
                    .openingHours("{\"weekday\": \"11:00-22:00\", \"weekend\": \"11:00-23:00\"}")
                    .isOpen(true)
                    .isActive(true)
                    .averageRating(BigDecimal.valueOf((Double) data[8]))
                    .reviewCount((Integer) data[9])
                    .latitude(BigDecimal.valueOf((Double) data[6]))
                    .longitude(BigDecimal.valueOf((Double) data[7]))
                    .totalReservations((int)(Math.random() * 500) + 100)
                    .completedReservations((int)(Math.random() * 400) + 80)
                    .noShowCount((int)(Math.random() * 30))
                    .monthlyRevenue((long)(Math.random() * 15000000) + 2000000)
                    .build();

            Business saved = businessRepository.save(business);
            savedBusinesses.add(saved);
        }

        log.info("총 {}개 샘플 가게 저장 완료", savedBusinesses.size());
        return savedBusinesses.size();
    }

    /**
     * 카카오 로컬 API 호출
     */
    private List<Business> searchKakaoLocal(String categoryCode, double lat, double lng,
                                            int radius, int page, BusinessOwner owner) {
        List<Business> businesses = new ArrayList<>();

        try {
            String url = String.format(
                "%s?category_group_code=%s&x=%f&y=%f&radius=%d&page=%d&size=15&sort=distance",
                KAKAO_LOCAL_API_URL, categoryCode, lng, lat, radius, page
            );

            HttpHeaders headers = new HttpHeaders();
            headers.set("Authorization", "KakaoAK " + kakaoApiKey);

            HttpEntity<String> entity = new HttpEntity<>(headers);

            ResponseEntity<String> response = restTemplate.exchange(
                url, HttpMethod.GET, entity, String.class
            );

            if (response.getStatusCode() == HttpStatus.OK) {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode documents = root.get("documents");

                if (documents != null && documents.isArray()) {
                    for (JsonNode doc : documents) {
                        Business business = convertToBusiness(doc, owner);
                        if (business != null) {
                            businesses.add(business);
                        }
                    }
                }
            }
        } catch (Exception e) {
            log.error("카카오 API 파싱 오류: {}", e.getMessage());
        }

        return businesses;
    }

    /**
     * 카카오 API 응답을 Business 엔티티로 변환
     */
    private Business convertToBusiness(JsonNode doc, BusinessOwner owner) {
        try {
            String placeName = doc.get("place_name").asText();
            String addressName = doc.has("road_address_name") && !doc.get("road_address_name").asText().isEmpty()
                    ? doc.get("road_address_name").asText()
                    : doc.get("address_name").asText();
            String phone = doc.has("phone") ? doc.get("phone").asText() : "미등록";
            String categoryName = doc.has("category_name") ? doc.get("category_name").asText() : "음식점";
            double x = doc.get("x").asDouble(); // 경도
            double y = doc.get("y").asDouble(); // 위도

            // 카테고리 추출 (예: "음식점 > 한식 > 육류,고기" -> "한식")
            String category = extractCategory(categoryName);

            // 랜덤 이미지 URL (음식점 이미지)
            String imageUrl = getRandomFoodImage(category);

            return Business.builder()
                    .owner(owner)
                    .businessName(placeName)
                    .businessNumber(generateBusinessNumber())
                    .category(category)
                    .address(addressName)
                    .phone(phone.isEmpty() ? "미등록" : phone)
                    .description(placeName + " - " + categoryName)
                    .businessImageUrl(imageUrl)
                    .openingHours("{\"weekday\": \"11:00-22:00\", \"weekend\": \"11:00-22:00\"}")
                    .isOpen(true)
                    .isActive(true)
                    .averageRating(BigDecimal.valueOf(4.0 + Math.random() * 0.9)) // 4.0~4.9
                    .reviewCount((int)(Math.random() * 200) + 10)
                    .latitude(BigDecimal.valueOf(y))
                    .longitude(BigDecimal.valueOf(x))
                    .totalReservations((int)(Math.random() * 500) + 50)
                    .completedReservations((int)(Math.random() * 400) + 40)
                    .noShowCount((int)(Math.random() * 20))
                    .monthlyRevenue((long)(Math.random() * 10000000) + 1000000)
                    .build();
        } catch (Exception e) {
            log.error("Business 변환 실패: {}", e.getMessage());
            return null;
        }
    }

    /**
     * 카테고리 이름에서 주요 카테고리 추출
     */
    private String extractCategory(String categoryName) {
        if (categoryName.contains(">")) {
            String[] parts = categoryName.split(">");
            if (parts.length >= 2) {
                return parts[1].trim();
            }
        }
        return "음식점";
    }

    /**
     * 카테고리별 랜덤 이미지 URL
     */
    private String getRandomFoodImage(String category) {
        String[] koreanFood = {
            "https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=800",
            "https://images.unsplash.com/photo-1498654896293-37aacf113fd9?w=800"
        };
        String[] chineseFood = {
            "https://images.unsplash.com/photo-1582878826629-29b7ad1cdc43?w=800",
            "https://images.unsplash.com/photo-1526318896980-cf78c088247c?w=800"
        };
        String[] japaneseFood = {
            "https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=800",
            "https://images.unsplash.com/photo-1553621042-f6e147245754?w=800"
        };
        String[] westernFood = {
            "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=800",
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800"
        };
        String[] cafe = {
            "https://images.unsplash.com/photo-1501339847302-ac426a4a7cbb?w=800",
            "https://images.unsplash.com/photo-1554118811-1e0d58224f24?w=800"
        };
        String[] defaultImages = {
            "https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800",
            "https://images.unsplash.com/photo-1552566626-52f8b828add9?w=800"
        };

        String[] images;
        if (category.contains("한식") || category.contains("육류") || category.contains("국밥")) {
            images = koreanFood;
        } else if (category.contains("중식") || category.contains("중국")) {
            images = chineseFood;
        } else if (category.contains("일식") || category.contains("초밥") || category.contains("돈까스")) {
            images = japaneseFood;
        } else if (category.contains("양식") || category.contains("이탈리") || category.contains("프랑스")) {
            images = westernFood;
        } else if (category.contains("카페") || category.contains("커피")) {
            images = cafe;
        } else {
            images = defaultImages;
        }

        return images[(int)(Math.random() * images.length)];
    }

    /**
     * 임시 사업자등록번호 생성
     */
    private String generateBusinessNumber() {
        return String.format("%03d-%02d-%05d",
                (int)(Math.random() * 1000),
                (int)(Math.random() * 100),
                (int)(Math.random() * 100000));
    }

    /**
     * 기본 owner 가져오거나 생성
     */
    private BusinessOwner getOrCreateDefaultOwner() {
        return businessOwnerRepository.findByLoginId("system_owner")
                .orElseGet(() -> {
                    BusinessOwner owner = BusinessOwner.builder()
                            .loginId("system_owner")
                            .password("1234")
                            .name("시스템")
                            .phone("010-0000-0000")
                            .email("system@olsaram.com")
                            .businessNumber("000-00-00000")
                            .isVerified(true)
                            .subscriptionPlan("ENTERPRISE")
                            .maxBusinessCount(1000)
                            .totalBusinessCount(0)
                            .totalRevenue(0L)
                            .build();
                    return businessOwnerRepository.save(owner);
                });
    }
}
