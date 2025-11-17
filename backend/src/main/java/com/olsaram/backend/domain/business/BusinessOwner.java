package com.olsaram.backend.domain.business;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "business_owner")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BusinessOwner {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "owner_id")
    private Long ownerId;

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

    @Column(name = "business_number", unique = true, nullable = false, length = 20)
    private String businessNumber;

    @Column(name = "is_verified")
    @Builder.Default
    private Boolean isVerified = false;

    @Column(name = "verified_at")
    private LocalDateTime verifiedAt;

    @Column(name = "subscription_plan", length = 20)
    @Builder.Default
    private String subscriptionPlan = "FREE";

    @Column(name = "subscription_expires_at")
    private LocalDateTime subscriptionExpiresAt;

    @Column(name = "max_business_count")
    @Builder.Default
    private Integer maxBusinessCount = 1;

    @Column(name = "total_business_count")
    @Builder.Default
    private Integer totalBusinessCount = 0;

    @Column(name = "total_revenue")
    @Builder.Default
    private Long totalRevenue = 0L;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "last_login_at")
    private LocalDateTime lastLoginAt;

    @OneToMany(mappedBy = "owner", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @JsonIgnore
    private List<Business> businesses = new ArrayList<>();

    // 비즈니스 로직
    public boolean canAddBusiness() {
        return this.totalBusinessCount < this.maxBusinessCount;
    }

    public void addBusiness(Business business) {
        this.businesses.add(business);
        business.setOwner(this);
        // null 체크 후 증가
        if (this.totalBusinessCount == null) {
            this.totalBusinessCount = 1;
        } else {
            this.totalBusinessCount++;
        }
    }
}
