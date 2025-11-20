package com.olsaram.backend.entity.community;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity(name = "CommunityComment")  // ★ 엔터티 이름 충돌 방지
@Getter
@Setter
@Builder
@AllArgsConstructor
@NoArgsConstructor
@Table(name = "community_comment")  // ★ 테이블 이름
public class Comment {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** 연결된 게시글 ID */
    @Column(name = "community_id", nullable = false)
    private Long communityId;

    /** 댓글 작성자 */
    private String author;

    /** 댓글 내용 */
    @Column(columnDefinition = "TEXT")
    private String content;

    /** 댓글 작성 시간 */
    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    /** 고객/사업주 댓글 구분 */
    @Column(name = "community_type", length = 20)
    private String communityType;   // ⭐ 반드시 추가해야 하는 중요 필드
}
