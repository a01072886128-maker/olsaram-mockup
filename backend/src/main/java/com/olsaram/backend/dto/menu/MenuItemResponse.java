package com.olsaram.backend.dto.menu;

import com.olsaram.backend.entity.MenuItem;

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

    public static MenuItemResponse from(MenuItem menuItem) {
        MenuItemResponse response = new MenuItemResponse();
        response.setId(menuItem.getId());
        response.setName(menuItem.getName());
        response.setPrice(menuItem.getPrice());
        response.setCategory(menuItem.getCategory());
        response.setConfidence(menuItem.getConfidence());
        response.setStatus(menuItem.getStatus());
        response.setPopular(Boolean.TRUE.equals(menuItem.getPopular()));
        response.setOrderCount(menuItem.getOrderCount());
        response.setRawText(menuItem.getRawText());
        response.setCreatedAt(menuItem.getCreatedAt());
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
