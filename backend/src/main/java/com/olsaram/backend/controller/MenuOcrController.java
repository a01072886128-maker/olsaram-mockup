package com.olsaram.backend.controller;

import com.olsaram.backend.dto.menu.MenuItemResponse;
import com.olsaram.backend.dto.menu.MenuOcrResponse;
import com.olsaram.backend.service.MenuOcrService;
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
            @RequestParam("ownerId") Long ownerId,
            @RequestPart("image") MultipartFile image
    ) {
        MenuOcrResponse response = menuOcrService.processMenuImage(ownerId, image);
        return ResponseEntity.ok(response);
    }

    @GetMapping
    public ResponseEntity<List<MenuItemResponse>> fetchMenus(@RequestParam("ownerId") Long ownerId) {
        return ResponseEntity.ok(menuOcrService.fetchMenus(ownerId));
    }

    @DeleteMapping("/{menuId}")
    public ResponseEntity<Void> deleteMenu(
            @PathVariable Long menuId,
            @RequestParam("ownerId") Long ownerId
    ) {
        menuOcrService.deleteMenu(ownerId, menuId);
        return ResponseEntity.noContent().build();
    }
}
