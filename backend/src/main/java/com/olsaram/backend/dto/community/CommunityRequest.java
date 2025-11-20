package com.olsaram.backend.dto.community;

import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class CommunityRequest {

    private String title;
    private String content;
    private String category;
    private String tags;       // ← 🔥 태그
    private Long memberId;     // ← 작성자 ID
}
