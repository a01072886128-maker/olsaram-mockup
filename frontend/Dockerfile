FROM node:20-alpine AS builder
WORKDIR /workspace/frontend
COPY package*.json ./
# 토스 페이먼츠 SDK 포함하여 의존성 설치
RUN npm ci
COPY . .
# 빌드 타임 환경 변수 설정 (Vite가 빌드 타임에 읽음)
ARG VITE_KAKAO_MAP_APP_KEY
RUN if [ -n "$VITE_KAKAO_MAP_APP_KEY" ]; then \
      echo "VITE_KAKAO_MAP_APP_KEY=$VITE_KAKAO_MAP_APP_KEY" > .env; \
    fi
RUN npm run build

FROM nginx:stable-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
