package com.olsaram.backend;

import com.olsaram.backend.config.ClovaOcrProperties;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;

@SpringBootApplication
@EnableConfigurationProperties(ClovaOcrProperties.class)
public class OlsaramBackendApplication {

	public static void main(String[] args) {
		SpringApplication.run(OlsaramBackendApplication.class, args);
	}
}
