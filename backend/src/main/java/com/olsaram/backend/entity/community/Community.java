package com.olsaram.backend.entity.community;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import java.time.LocalDateTime;

@Entity
@Getter
@Setter
@NoArgsConstructor
@Table(name = "community")
public class Community {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 🧾 게시글 제목 */
    @Column(nullable = false)
    private String title;

    /** 📝 게시글 내용 */
    @Column(columnDefinition = "TEXT")
    private String content;

    /** 👤 작성자 ID (회원 식별자) */
    private Long memberId;

    /** 📅 작성일 */
    private LocalDateTime createdAt = LocalDateTime.now();

    /** 🗂️ 카테고리 (예: USER_POST, NOTICE, PROMOTION 등) */
    @Column(length = 50)
    private String category;

    /** 🔢 조회수 */
    private int views = 0;

    /** 🗑️ 삭제 여부 */
    private boolean deleted = false;
}
