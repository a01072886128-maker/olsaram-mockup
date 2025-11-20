package com.olsaram.backend.entity.board;

import jakarta.persistence.*;
import lombok.*;

@Entity(name = "BoardComment")   // ★ 엔터티 이름 충돌 방지
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Table(name = "board_comment")    // ★ 테이블명도 분리
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "board_id", nullable = false)
    private Long boardId;

    private String author;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "created_at")
    private java.time.LocalDateTime createdAt;
}
