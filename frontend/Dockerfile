FROM node:20-alpine AS builder
WORKDIR /workspace/frontend
COPY frontend/package*.json ./ 
RUN npm ci
COPY frontend/ .
RUN npm run build

FROM nginx:stable-alpine
COPY frontend/nginx/default.conf /etc/nginx/conf.d/default.conf
COPY --from=builder /workspace/frontend/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
