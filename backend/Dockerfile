FROM gradle:9-jdk21 AS builder
WORKDIR /workspace/olsaram-backend
COPY . ./
# Override host-specific org.gradle.java.home for container build
RUN ./gradlew -Dorg.gradle.java.home=/opt/java/openjdk bootJar --no-daemon

FROM eclipse-temurin:21-jre-jammy
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
COPY --from=builder /workspace/olsaram-backend/build/libs/*.jar /app/olsaram-backend.jar
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
