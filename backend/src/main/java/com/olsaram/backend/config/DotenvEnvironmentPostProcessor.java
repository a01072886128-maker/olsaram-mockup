package com.olsaram.backend.config;

import io.github.cdimascio.dotenv.Dotenv;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.env.EnvironmentPostProcessor;
import org.springframework.core.env.ConfigurableEnvironment;
import org.springframework.core.env.MapPropertySource;

import java.nio.file.Files;
import java.nio.file.Path;
import java.util.LinkedHashMap;
import java.util.Map;

public class DotenvEnvironmentPostProcessor implements EnvironmentPostProcessor {

    private static final String PROPERTY_SOURCE_NAME = "rootDotenv";
    private static final String DOTENV_FILE = ".env";

    @Override
    public void postProcessEnvironment(ConfigurableEnvironment environment, SpringApplication application) {
        Path dotenvPath = resolveDotenvPath();
        if (dotenvPath == null || !Files.isRegularFile(dotenvPath)) {
            return;
        }

        Dotenv dotenv = Dotenv.configure()
            .directory(dotenvPath.getParent().toString())
            .filename(dotenvPath.getFileName().toString())
            .ignoreIfMissing()
            .load();

        Map<String, Object> entries = new LinkedHashMap<>();
        dotenv.entries().forEach(entry -> {
            if (!environment.containsProperty(entry.getKey())) {
                entries.put(entry.getKey(), entry.getValue());
            }
        });

        if (!entries.isEmpty()) {
            environment.getPropertySources().addLast(new MapPropertySource(PROPERTY_SOURCE_NAME, entries));
        }
    }

    private Path resolveDotenvPath() {
        Path current = Path.of(System.getProperty("user.dir")).toAbsolutePath();
        while (current != null) {
            Path candidate = current.resolve(DOTENV_FILE);
            if (Files.exists(candidate)) {
                return candidate;
            }
            current = current.getParent();
        }
        return null;
    }
}
