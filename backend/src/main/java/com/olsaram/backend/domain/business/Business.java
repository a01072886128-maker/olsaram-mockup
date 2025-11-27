package com.olsaram.backend.domain.business;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

import static java.math.BigDecimal.ZERO;

@Entity(name = "DomainBusiness")
@Table(name = "business")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Business {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "business_id")
    private Long businessId;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "owner_id", nullable = false)
    private BusinessOwner owner;

    @Column(name = "business_name", nullable = false, length = 100)
    private String businessName;

    @Column(name = "business_number", unique = true, length = 20)
    private String businessNumber;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(nullable = false)
    private String address;

    @Column(nullable = false, length = 20)
    private String phone;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "business_image_url")
    private String businessImageUrl;

    @Column(name = "opening_hours", columnDefinition = "JSON")
    private String openingHours;

    @Column(name = "is_open")
    @Builder.Default
    private Boolean isOpen = true;

    @Column(name = "is_active")
    @Builder.Default
    private Boolean isActive = true;

    @Column(name = "average_rating", precision = 3, scale = 2)
    @Builder.Default
    private BigDecimal averageRating = ZERO;

    @Column(name = "review_count")
    @Builder.Default
    private Integer reviewCount = 0;

    @Column(precision = 10, scale = 8)
    private BigDecimal latitude;

    @Column(precision = 11, scale = 8)
    private BigDecimal longitude;

    @Column(name = "total_reservations")
    @Builder.Default
    private Integer totalReservations = 0;

    @Column(name = "completed_reservations")
    @Builder.Default
    private Integer completedReservations = 0;

    @Column(name = "no_show_count")
    @Builder.Default
    private Integer noShowCount = 0;

    @Column(name = "monthly_revenue")
    @Builder.Default
    private Long monthlyRevenue = 0L;

    @Column(name = "reservation_fee_amount", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal reservationFeeAmount = ZERO;

    @Column(name = "created_at", updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @OneToMany(mappedBy = "business", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    private List<Menu> menus = new ArrayList<>();
}
