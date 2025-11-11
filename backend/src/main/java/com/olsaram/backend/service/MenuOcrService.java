package com.olsaram.backend.service;

import com.olsaram.backend.dto.menu.MenuItemResponse;
import com.olsaram.backend.dto.menu.MenuOcrResponse;
import com.olsaram.backend.entity.MenuItem;
import com.olsaram.backend.repository.MenuItemRepository;
import com.olsaram.backend.service.ocr.OpenAiOcrClient;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
public class MenuOcrService {

    private static final Pattern PRICE_PATTERN = Pattern.compile("(\\d[\\d,\\.]{2,})");

    private final OpenAiOcrClient openAiOcrClient;
    private final MenuItemRepository menuItemRepository;

    public MenuOcrService(OpenAiOcrClient openAiOcrClient, MenuItemRepository menuItemRepository) {
        this.openAiOcrClient = openAiOcrClient;
        this.menuItemRepository = menuItemRepository;
    }

    /**
     * 메뉴 이미지 OCR 처리 (DB 저장 없이 인식 결과만 반환)
     */
    public MenuOcrResponse processMenuImage(Long ownerId, MultipartFile imageFile) {
        if (ownerId == null) {
            throw new IllegalArgumentException("ownerId는 필수입니다.");
        }

        if (imageFile == null || imageFile.isEmpty()) {
            throw new IllegalArgumentException("이미지 파일이 존재하지 않습니다.");
        }

        try {
            byte[] imageBytes = imageFile.getBytes();
            String format = openAiOcrClient.detectFormat(imageFile.getContentType(), imageFile.getOriginalFilename());
            List<OpenAiOcrClient.OcrField> ocrFields = openAiOcrClient.extractText(imageBytes, format);

            List<MenuItem> parsedItems = parseFields(ownerId, ocrFields, imageFile.getOriginalFilename());
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
    public List<MenuItemResponse> saveMenuItems(Long ownerId, List<MenuItem> menuItems) {
        if (ownerId == null) {
            throw new IllegalArgumentException("ownerId는 필수입니다.");
        }

        if (menuItems == null || menuItems.isEmpty()) {
            throw new IllegalArgumentException("저장할 메뉴가 없습니다.");
        }

        // ownerId 검증
        for (MenuItem menuItem : menuItems) {
            if (!Objects.equals(menuItem.getOwnerId(), ownerId)) {
                throw new IllegalArgumentException("권한이 없는 메뉴 항목이 포함되어 있습니다.");
            }
        }

        List<MenuItemResponse> savedItems = menuItemRepository.saveAll(menuItems).stream()
                .map(MenuItemResponse::from)
                .toList();

        return savedItems;
    }

    public List<MenuItemResponse> fetchMenus(Long ownerId) {
        if (ownerId == null) {
            throw new IllegalArgumentException("ownerId는 필수입니다.");
        }

        return menuItemRepository.findAllByOwnerIdOrderByCreatedAtDesc(ownerId)
                .stream()
                .map(MenuItemResponse::from)
                .toList();
    }

    public void deleteMenu(Long ownerId, Long menuId) {
        if (ownerId == null || menuId == null) {
            throw new IllegalArgumentException("ownerId와 menuId는 필수입니다.");
        }

        menuItemRepository.findById(menuId).ifPresent(menuItem -> {
            if (!Objects.equals(menuItem.getOwnerId(), ownerId)) {
                throw new IllegalArgumentException("해당 메뉴를 삭제할 권한이 없습니다.");
            }
            menuItemRepository.delete(menuItem);
        });
    }

    private List<MenuItem> parseFields(Long ownerId, List<OpenAiOcrClient.OcrField> fields, String originalFilename) {
        List<MenuItem> items = new ArrayList<>();

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

            MenuItem menuItem = new MenuItem();
            menuItem.setOwnerId(ownerId);
            menuItem.setName(cleanedName);
            menuItem.setPrice(price);
            menuItem.setCategory("미분류");
            menuItem.setConfidence(field.confidence() != null ? Math.round(field.confidence() * 1000d) / 10d : null);
            menuItem.setStatus(determineStatus(price, menuItem.getConfidence()));
            menuItem.setRawText(field.text());
            menuItem.setSourceImage(originalFilename);
            items.add(menuItem);
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
}
