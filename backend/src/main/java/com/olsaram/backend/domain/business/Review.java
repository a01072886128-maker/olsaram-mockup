package com.olsaram.backend.domain.business;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "review")
@Getter
@Setter
public class Review {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long reviewId;

    private Long businessId;
    private Long memberId;

    private String content;
    private Integer rating;

    private LocalDateTime createdAt = LocalDateTime.now();
}
