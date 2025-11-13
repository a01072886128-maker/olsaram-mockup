package com.olsaram.backend.service;

import com.olsaram.backend.domain.business.Business;
import com.olsaram.backend.domain.business.Menu;
import com.olsaram.backend.dto.menu.MenuItemResponse;
import com.olsaram.backend.dto.menu.MenuOcrResponse;
import com.olsaram.backend.dto.menu.MenuSaveRequest;
import com.olsaram.backend.repository.BusinessRepository;
import com.olsaram.backend.repository.MenuRepository;
import com.olsaram.backend.service.ocr.OpenAiOcrClient;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MenuOcrService {

    private static final Pattern PRICE_PATTERN = Pattern.compile("(\\d[\\d,\\.]{2,})");

    private final OpenAiOcrClient openAiOcrClient;
    private final MenuRepository menuRepository;
    private final BusinessRepository businessRepository;

    public MenuOcrService(OpenAiOcrClient openAiOcrClient, MenuRepository menuRepository, BusinessRepository businessRepository) {
        this.openAiOcrClient = openAiOcrClient;
        this.menuRepository = menuRepository;
        this.businessRepository = businessRepository;
    }

    /**
     * 메뉴 이미지 OCR 처리 (DB 저장 없이 인식 결과만 반환)
     */
    public MenuOcrResponse processMenuImage(Long ownerId, Long businessId, MultipartFile imageFile) {
        if (ownerId == null) {
            throw new IllegalArgumentException("ownerId는 필수입니다.");
        }

        if (businessId == null) {
            throw new IllegalArgumentException("businessId는 필수입니다.");
        }

        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 존재하지 않습니다.");
        }

        // Business 조회 및 권한 확인
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 비즈니스입니다."));

        // TODO: 임시로 권한 체크 비활성화 (테스트용) - 나중에 다시 활성화 필요!
        // if (!Objects.equals(business.getOwner().getOwnerId(), ownerId)) {
        //     throw new IllegalArgumentException("해당 비즈니스에 대한 권한이 없습니다.");
        // }

        try {
            byte[] imageBytes = imageFile.getBytes();
            String format = openAiOcrClient.detectFormat(imageFile.getContentType(), imageFile.getOriginalFilename());
            List<OpenAiOcrClient.OcrField> ocrFields = openAiOcrClient.extractText(imageBytes, format);

            List<Menu> parsedItems = parseFields(business, ocrFields, imageFile.getOriginalFilename());
            if (parsedItems.isEmpty()) {
                return new MenuOcrResponse("인식된 메뉴가 없습니다. 메뉴판 이미지를 다시 한번 확인해주세요.", List.of());
            }

            // DB에 저장하지 않고 MenuItemResponse로 변환하여 반환
            List<MenuItemResponse> menuItems = parsedItems.stream()
                    .map(MenuItemResponse::from)
                    .toList();

            return new MenuOcrResponse("메뉴판 인식이 완료되었습니다. 확인 후 저장해주세요.", menuItems);
        } catch (IOException e) {
            throw new IllegalStateException("이미지 파일을 읽을 수 없습니다.");
        }
    }

    /**
     * 메뉴 목록 일괄 저장
     */
    public List<MenuItemResponse> saveMenuItems(Long ownerId, Long businessId, List<MenuSaveRequest> menuRequests) {
        if (ownerId == null) {
            throw new IllegalArgumentException("ownerId는 필수입니다.");
        }

        if (businessId == null) {
            throw new IllegalArgumentException("businessId는 필수입니다.");
        }

        if (menuRequests == null || menuRequests.isEmpty()) {
            throw new IllegalArgumentException("저장할 메뉴가 없습니다.");
        }

        // Business 조회 및 권한 확인
        Business business = businessRepository.findById(businessId)
                .orElseThrow(() -> new IllegalArgumentException("존재하지 않는 비즈니스입니다."));

        // TODO: 임시로 권한 체크 비활성화 (테스트용) - 나중에 다시 활성화 필요!
        // if (!Objects.equals(business.getOwner().getOwnerId(), ownerId)) {
        //     throw new IllegalArgumentException("해당 비즈니스에 대한 권한이 없습니다.");
        // }

        // MenuSaveRequest를 Menu 엔티티로 변환
        List<Menu> menus = menuRequests.stream()
                .map(request -> Menu.builder()
                        .business(business)
                        .menuName(request.getMenuName())
                        .price(request.getPrice() != null ? BigDecimal.valueOf(request.getPrice()) : null)
                        .category(request.getCategory())
                        .confidence(request.getConfidence())
                        .status(request.getStatus())
                        .rawText(request.getRawText())
                        .sourceImage(request.getSourceImage())
                        .isAvailable(request.getIsAvailable() != null ? request.getIsAvailable() : true)
                        .isPopular(request.getIsPopular() != null ? request.getIsPopular() : false)
                        .displayOrder(request.getDisplayOrder() != null ? request.getDisplayOrder() : 0)
                        .orderCount(request.getOrderCount() != null ? request.getOrderCount() : 0)
                        .build())
                .toList();

        List<MenuItemResponse> savedItems = menuRepository.saveAll(menus).stream()
                .map(MenuItemResponse::from)
                .toList();

        return savedItems;
    }

    public List<MenuItemResponse> fetchMenusByBusiness(Long ownerId, Long businessId) {
        if (ownerId == null) {
            throw new IllegalArgumentException("ownerId는 필수입니다.");
        }
        if (businessId == null) {
            throw new IllegalArgumentException("businessId는 필수입니다.");
        }

        List<Menu> menus = menuRepository.findByBusinessIdOrderByCreatedAtDesc(businessId);
        return menus.stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    public void deleteMenu(Long ownerId, Long menuId) {
        if (ownerId == null || menuId == null) {
            throw new IllegalArgumentException("ownerId와 menuId는 필수입니다.");
        }

        menuRepository.findById(menuId).ifPresent(menu -> {
            if (!Objects.equals(menu.getBusiness().getOwner().getOwnerId(), ownerId)) {
                throw new IllegalArgumentException("해당 메뉴를 삭제할 권한이 없습니다.");
            }
            menuRepository.delete(menu);
        });
    }

    private List<Menu> parseFields(Business business, List<OpenAiOcrClient.OcrField> fields, String originalFilename) {
        List<Menu> items = new ArrayList<>();

        for (OpenAiOcrClient.OcrField field : fields) {
            if (field.text() == null || field.text().isBlank()) {
                continue;
            }

            String normalized = normalizeText(field.text());
            if (normalized.length() < 2) {
                continue;
            }

            Matcher matcher = PRICE_PATTERN.matcher(normalized);
            Integer price = null;
            String cleanedName = normalized;

            if (matcher.find()) {
                String priceToken = matcher.group(1);
                price = parsePrice(priceToken);
                cleanedName = (normalized.substring(0, matcher.start()) + " " + normalized.substring(matcher.end())).trim();
            }

            cleanedName = cleanedName.replaceAll("[^가-힣a-zA-Z0-9\\s\\(\\)]", "").trim();

            if (!StringUtils.hasText(cleanedName)) {
                cleanedName = "메뉴";
            }

            Double confidence = field.confidence() != null ? Math.round(field.confidence() * 1000d) / 10d : null;
            String category = categorizeMenu(cleanedName);

            Menu menu = Menu.builder()
                    .business(business)
                    .menuName(cleanedName)
                    .price(price != null ? BigDecimal.valueOf(price) : null)
                    .category(category)
                    .confidence(confidence)
                    .status(determineStatus(price, confidence))
                    .rawText(field.text())
                    .sourceImage(originalFilename)
                    .isAvailable(true)
                    .isPopular(false)
                    .displayOrder(0)
                    .orderCount(0)
                    .build();

            items.add(menu);
        }

        return items;
    }

    private String normalizeText(String text) {
        // O/0 구분 오류 보정
        return text.replace('O', '0')
                .replace('o', '0')
                .replaceAll("원", "")
                .trim();
    }

    private Integer parsePrice(String token) {
        String numeric = token.replaceAll("[^0-9]", "");
        if (!numeric.isEmpty()) {
            try {
                return Integer.parseInt(numeric);
            } catch (NumberFormatException ignored) {
            }
        }
        return null;
    }

    private String determineStatus(Integer price, Double confidence) {
        if (price != null && confidence != null && confidence >= 70) {
            return "CONFIRMED";
        }
        return "NEEDS_REVIEW";
    }

    private String categorizeMenu(String menuName) {
        String lower = menuName.toLowerCase();

        // 중식
        if (lower.contains("짜장") || lower.contains("짬뽕") || lower.contains("탕수육") ||
            lower.contains("볶음밥") || lower.contains("깐풍기") || lower.contains("라조기") ||
            lower.contains("유산슬") || lower.contains("양장피") || lower.contains("마파두부") ||
            lower.contains("만두") || lower.contains("군만두") || lower.contains("물만두")) {
            return "중식";
        }

        // 한식
        if (lower.contains("김치") || lower.contains("찌개") || lower.contains("국밥") ||
            lower.contains("비빔밥") || lower.contains("불고기") || lower.contains("갈비") ||
            lower.contains("삼겹살") || lower.contains("제육") || lower.contains("된장") ||
            lower.contains("순두부") || lower.contains("떡볶이") || lower.contains("김밥") ||
            lower.contains("냉면") || lower.contains("칼국수") || lower.contains("수제비")) {
            return "한식";
        }

        // 일식
        if (lower.contains("스시") || lower.contains("초밥") || lower.contains("사시미") ||
            lower.contains("라멘") || lower.contains("우동") || lower.contains("소바") ||
            lower.contains("돈까스") || lower.contains("돈카츠") || lower.contains("가츠") ||
            lower.contains("텐동") || lower.contains("덮밥") || lower.contains("규동") ||
            lower.contains("에비") || lower.contains("스테이크동") || lower.contains("야키") ||
            lower.contains("오야코동") || lower.contains("가라아게") || lower.contains("타코야키")) {
            return "일식";
        }

        // 양식
        if (lower.contains("스테이크") || lower.contains("파스타") || lower.contains("피자") ||
            lower.contains("리조또") || lower.contains("샐러드") || lower.contains("햄버거") ||
            lower.contains("버거") || lower.contains("샌드위치") || lower.contains("오믈렛") ||
            lower.contains("그라탕") || lower.contains("필라프")) {
            return "양식";
        }

        // 음료
        if (lower.contains("커피") || lower.contains("라떼") || lower.contains("아메리카노") ||
            lower.contains("카푸치노") || lower.contains("에스프레소") || lower.contains("주스") ||
            lower.contains("스무디") || lower.contains("차") || lower.contains("티") ||
            lower.contains("음료") || lower.contains("에이드") || lower.contains("콜라") ||
            lower.contains("사이다") || lower.contains("생수") || lower.contains("맥주") ||
            lower.contains("소주") || lower.contains("와인")) {
            return "음료";
        }

        return "미분류";
    }
}
