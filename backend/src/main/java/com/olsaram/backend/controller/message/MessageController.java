package com.olsaram.backend.controller.message;

import com.olsaram.backend.entity.message.Message;
import com.olsaram.backend.service.message.MessageService;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/message")
@RequiredArgsConstructor
public class MessageController {

    private final MessageService messageService;

    /** ✉️ 전체 메시지 조회 */
    @GetMapping
    public List<Message> list() {
        return messageService.findAll();
    }

    /** 📨 메시지 전송 */
    @PostMapping
    public Message send(@RequestBody Message message) {
        return messageService.save(message);
    }

    /** ❌ 메시지 삭제 */
    @DeleteMapping("/{id}")
    public void delete(@PathVariable Long id) {
        messageService.delete(id);
    }
}
