FROM gradle:9-jdk21 AS builder
WORKDIR /workspace/olsaram-backend
COPY . ./
# Override host-specific org.gradle.java.home for container build
RUN ./gradlew -Dorg.gradle.java.home=/opt/java/openjdk bootJar --no-daemon

FROM eclipse-temurin:21-jre-jammy
# Python 및 ML 모델 의존성 설치
RUN apt-get update && \
    apt-get install -y --no-install-recommends curl python3 python3-pip && \
    pip3 install --upgrade pip && \
    pip3 install pandas scikit-learn joblib && \
    rm -rf /var/lib/apt/lists/*
WORKDIR /app
# 애플리케이션 JAR 파일 복사 (토스 페이먼츠 포함)
COPY --from=builder /workspace/olsaram-backend/build/libs/*.jar /app/olsaram-backend.jar
# ML 모델 스크립트 및 모델 파일 복사
COPY --from=builder /workspace/olsaram-backend/scripts /app/scripts
COPY --from=builder /workspace/olsaram-backend/models /app/models
# 엔트리포인트 스크립트 복사
COPY entrypoint.sh /app/entrypoint.sh
RUN chmod +x /app/entrypoint.sh
EXPOSE 8080
ENTRYPOINT ["/app/entrypoint.sh"]
