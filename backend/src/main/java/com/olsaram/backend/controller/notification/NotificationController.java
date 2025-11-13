package com.olsaram.backend.controller.notification;

import com.olsaram.backend.entity.notification.Notification;
import com.olsaram.backend.service.notification.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.server.ResponseStatusException;

import java.util.List;

@RestController
@RequestMapping("/api/notification")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    /** 🔔 알림 목록 조회 */
    @GetMapping
    public List<Notification> list() {
        return notificationService.findAll();
    }

    /** 📬 알림 등록 */
    @PostMapping
    public Notification create(@RequestBody Notification notification) {
        return notificationService.save(notification);
    }

    /** 🔍 단일 알림 조회 (404 반환 처리) */
    @GetMapping("/{id}")
    public Notification getNotification(@PathVariable Long id) {
        return notificationService.findById(id)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Notification not found with id: " + id
                ));
    }

    /** ✅ 읽음 처리 */
    @PutMapping("/{id}/read")
    public void markAsRead(@PathVariable Long id) {
        notificationService.markAsRead(id);
    }

    /** ❌ 알림 삭제 */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        notificationService.delete(id);
    }
}
