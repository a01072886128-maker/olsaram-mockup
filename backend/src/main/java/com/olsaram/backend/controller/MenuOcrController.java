package com.olsaram.backend.controller;

import com.olsaram.backend.dto.menu.MenuItemResponse;
import com.olsaram.backend.dto.menu.MenuOcrResponse;
import com.olsaram.backend.dto.menu.MenuSaveRequest;
import com.olsaram.backend.service.MenuOcrService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@RestController
@RequestMapping("/api/owner/menu-ocr")
@Validated
public class MenuOcrController {

    private static final Logger log = LoggerFactory.getLogger(MenuOcrController.class);
    private final MenuOcrService menuOcrService;

    public MenuOcrController(MenuOcrService menuOcrService) {
        this.menuOcrService = menuOcrService;
    }

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE,
            produces = MediaType.APPLICATION_JSON_VALUE
    )
    public ResponseEntity<MenuOcrResponse> uploadMenuImage(
            @RequestParam Long ownerId,
            @RequestParam Long businessId,
            @RequestPart("image") MultipartFile image
    ) {
        try {
            log.info("메뉴 이미지 업로드 요청 - ownerId: {}, businessId: {}, fileName: {}, size: {}",
                ownerId, businessId, image.getOriginalFilename(), image.getSize());

            MenuOcrResponse response = menuOcrService.processMenuImage(ownerId, businessId, image);
            return ResponseEntity.ok(response);

        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청: {}", e.getMessage());
            return ResponseEntity.badRequest()
                .body(new MenuOcrResponse(e.getMessage(), List.of()));

        } catch (IllegalStateException e) {
            log.error("메뉴 이미지 처리 실패: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MenuOcrResponse(e.getMessage(), List.of()));

        } catch (Exception e) {
            log.error("예상치 못한 오류 발생", e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                .body(new MenuOcrResponse("요청 처리 중 오류가 발생했습니다. 잠시 후 다시 시도해주세요.", List.of()));
        }
    }

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> fetchMenus(
            @RequestParam Long ownerId,
            @RequestParam Long businessId) {
        return ResponseEntity.ok(menuOcrService.fetchMenusByBusiness(ownerId, businessId));
    }

    @PostMapping("/save-batch")
    public ResponseEntity<List<MenuItemResponse>> saveMenuBatch(
            @RequestParam Long ownerId,
            @RequestParam Long businessId,
            @RequestBody List<MenuSaveRequest> menuRequests
    ) {
        try {
            log.info("메뉴 일괄 저장 요청 - ownerId: {}, businessId: {}, 항목 수: {}", ownerId, businessId, menuRequests.size());
            List<MenuItemResponse> savedItems = menuOcrService.saveMenuItems(ownerId, businessId, menuRequests);
            return ResponseEntity.ok(savedItems);

        } catch (IllegalArgumentException e) {
            log.warn("잘못된 요청: {}", e.getMessage());
            throw e;

        } catch (Exception e) {
            log.error("메뉴 저장 실패", e);
            throw new IllegalStateException("메뉴 저장 중 오류가 발생했습니다.");
        }
    }

    @DeleteMapping("/{menuId}")
    public ResponseEntity<Void> deleteMenu(
            @PathVariable Long menuId,
            @RequestParam Long ownerId
    ) {
        menuOcrService.deleteMenu(ownerId, menuId);
        return ResponseEntity.noContent().build();
    }
}
