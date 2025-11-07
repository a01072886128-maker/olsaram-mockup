package com.olsaram.backend.health;

public record HealthResponse(String service, String status, String databaseStatus) {
}
