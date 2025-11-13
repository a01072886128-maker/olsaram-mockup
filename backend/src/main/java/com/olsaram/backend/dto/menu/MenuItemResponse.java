package com.olsaram.backend.dto.menu;

import com.olsaram.backend.domain.business.Menu;

import java.time.LocalDateTime;

public class MenuItemResponse {
    private Long id;
    private String name;
    private Integer price;
    private String category;
    private Double confidence;
    private String status;
    private Boolean popular;
    private Integer orderCount;
    private String rawText;
    private LocalDateTime createdAt;

    public static MenuItemResponse from(Menu menu) {
        MenuItemResponse response = new MenuItemResponse();
        response.setId(menu.getMenuId());
        response.setName(menu.getMenuName());
        // BigDecimal -> Integer 변환
        response.setPrice(menu.getPrice() != null ? menu.getPrice().intValue() : null);
        response.setCategory(menu.getCategory());
        response.setConfidence(menu.getConfidence());
        response.setStatus(menu.getStatus());
        response.setPopular(Boolean.TRUE.equals(menu.getIsPopular()));
        response.setOrderCount(menu.getOrderCount());
        response.setRawText(menu.getRawText());
        response.setCreatedAt(menu.getCreatedAt());
        return response;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Integer getPrice() {
        return price;
    }

    public void setPrice(Integer price) {
        this.price = price;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public Double getConfidence() {
        return confidence;
    }

    public void setConfidence(Double confidence) {
        this.confidence = confidence;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public Boolean getPopular() {
        return popular;
    }

    public void setPopular(Boolean popular) {
        this.popular = popular;
    }

    public Integer getOrderCount() {
        return orderCount;
    }

    public void setOrderCount(Integer orderCount) {
        this.orderCount = orderCount;
    }

    public String getRawText() {
        return rawText;
    }

    public void setRawText(String rawText) {
        this.rawText = rawText;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
