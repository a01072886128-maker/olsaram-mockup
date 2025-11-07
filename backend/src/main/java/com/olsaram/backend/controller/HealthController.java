package com.olsaram.backend.controller;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.olsaram.backend.health.DatabaseHealthService;
import com.olsaram.backend.health.HealthResponse;

@RestController
@RequestMapping("/api/health")
public class HealthController {

	private final DatabaseHealthService databaseHealthService;
	private final String applicationName;

	public HealthController(
			DatabaseHealthService databaseHealthService,
			@Value("${spring.application.name:OlsaramBackend}") String applicationName) {
		this.databaseHealthService = databaseHealthService;
		this.applicationName = applicationName;
	}

	@GetMapping
	public HealthResponse health() {
		String databaseStatus = databaseHealthService.isDatabaseUp() ? "UP" : "DOWN";
		return new HealthResponse(applicationName, "UP", databaseStatus);
	}
}
