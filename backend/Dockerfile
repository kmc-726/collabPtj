# ── Stage 1: Build ──────────────────────────────────
FROM gradle:8.14-jdk17 AS build

WORKDIR /app

# 의존성 캐시 레이어 (gradle 파일만 먼저 복사)
COPY build.gradle settings.gradle ./
COPY gradle ./gradle
RUN gradle dependencies --no-daemon || true

# 소스 복사 후 빌드
COPY src ./src
RUN gradle bootJar --no-daemon -x test

# ── Stage 2: Run ─────────────────────────────────────
FROM eclipse-temurin:17-jre-alpine

WORKDIR /app

# 타임존 설정
RUN apk add --no-cache tzdata && \
    cp /usr/share/zoneinfo/Asia/Seoul /etc/localtime && \
    echo "Asia/Seoul" > /etc/timezone

COPY --from=build /app/build/libs/*.jar app.jar

EXPOSE 8080

ENTRYPOINT ["java", "-jar", "app.jar"]
