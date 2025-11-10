package com.olsaram.backend.dto.menu;

import java.util.List;

public class MenuOcrResponse {

    private String message;
    private List<MenuItemResponse> items;

    public MenuOcrResponse() {
    }

    public MenuOcrResponse(String message, List<MenuItemResponse> items) {
        this.message = message;
        this.items = items;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public List<MenuItemResponse> getItems() {
        return items;
    }

    public void setItems(List<MenuItemResponse> items) {
        this.items = items;
    }
}
