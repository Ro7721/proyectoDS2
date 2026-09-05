FROM node:22-alpine AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY . .
RUN npm run build \
    && if [ -f dist/appfront/browser/index.csr.html ]; then \
         cp dist/appfront/browser/index.csr.html dist/appfront/browser/index.html; \
       fi \
    && test -f dist/appfront/browser/index.html

FROM nginx:alpine
RUN rm -rf /usr/share/nginx/html/*
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist/appfront/browser /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
