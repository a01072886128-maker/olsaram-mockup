package com.olsaram.backend.domain.customer;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "customer")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "customer_id")
    private Long customerId;

    @Column(name = "login_id", unique = true, nullable = false, length = 50)
    private String loginId;

    @Column(nullable = false)
    private String password;

    @Column(nullable = false, length = 50)
    private String name;

    @Column(unique = true, nullable = false, length = 20)
    private String phone;

    @Column(unique = true, length = 100)
    private String email;

    @Column(name = "profile_image_url")
    private String profileImageUrl;

    @Column(name = "trust_score")
    private Integer trustScore = 100;

    @Column(name = "no_show_count")
    private Integer noShowCount = 0;

    @Column(name = "reservation_count")
    private Integer reservationCount = 0;

    @Column(name = "reward_points")
    private Integer rewardPoints = 0;

    @Column(name = "customer_grade", length = 20)
    private String customerGrade = "BRONZE";

    @Column(name = "is_blocked")
    private Boolean isBlocked = false;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;
}
