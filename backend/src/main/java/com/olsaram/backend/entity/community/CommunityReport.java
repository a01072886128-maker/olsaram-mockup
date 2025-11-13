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
@Table(name = "community_report")
public class CommunityReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long communityId;     // 신고된 커뮤니티 게시글 ID
    private Long reporterId;      // 신고한 사용자 ID

    @Column(nullable = false)
    private String reason;        // 신고 사유

    private LocalDateTime reportedAt = LocalDateTime.now(); // 신고 시각
}
