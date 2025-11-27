package com.olsaram.backend.dto.store;

import com.olsaram.backend.domain.business.Menu;

import java.math.BigDecimal;

public class StoreMenuResponse {
    private Long menuId;
    private String menuName;
    private BigDecimal price;
    private String description;
    private String category;
    private String menuImageUrl;
    private Boolean isAvailable;

    public static StoreMenuResponse from(Menu menu) {
        StoreMenuResponse response = new StoreMenuResponse();
        response.setMenuId(menu.getMenuId());
        response.setMenuName(menu.getMenuName());
        response.setPrice(menu.getPrice());
        response.setDescription(menu.getDescription());
        response.setCategory(menu.getCategory());
        response.setMenuImageUrl(menu.getMenuImageUrl());
        response.setIsAvailable(menu.getIsAvailable());
        return response;
    }

    public Long getMenuId() {
        return menuId;
    }

    public void setMenuId(Long menuId) {
        this.menuId = menuId;
    }

    public String getMenuName() {
        return menuName;
    }

    public void setMenuName(String menuName) {
        this.menuName = menuName;
    }

    public BigDecimal getPrice() {
        return price;
    }

    public void setPrice(BigDecimal price) {
        this.price = price;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getCategory() {
        return category;
    }

    public void setCategory(String category) {
        this.category = category;
    }

    public String getMenuImageUrl() {
        return menuImageUrl;
    }

    public void setMenuImageUrl(String menuImageUrl) {
        this.menuImageUrl = menuImageUrl;
    }

    public Boolean getIsAvailable() {
        return isAvailable;
    }

    public void setIsAvailable(Boolean isAvailable) {
        this.isAvailable = isAvailable;
    }
}
