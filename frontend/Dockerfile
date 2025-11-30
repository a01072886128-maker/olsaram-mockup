FROM node:20-alpine AS builder
WORKDIR /workspace/frontend
COPY package*.json ./
# 토스 페이먼츠 SDK 포함하여 의존성 설치
RUN npm ci
# .env 파일 복사 (Vite가 빌드 타임에 자동으로 읽음)
COPY .env* ./
COPY . .
RUN npm run build

FROM nginx:stable-alpine
COPY nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
