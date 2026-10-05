\# Hệ thống Quản lý Cửa hàng / POS



\## 1. Giới thiệu



Đây là hệ thống quản lý cửa hàng/POS được triển khai bằng Docker Compose.



Hệ thống hỗ trợ:

\- Quản lý sản phẩm.

\- Quản lý tồn kho.

\- Bán hàng và lập hóa đơn.

\- Kết nối cơ sở dữ liệu MySQL.

\- Quản lý cơ sở dữ liệu bằng phpMyAdmin.

\- Reverse proxy bằng Nginx.

\- Giám sát hệ thống bằng Prometheus và Grafana.

\- Thu thập và phân tích log bằng Loki, Promtail và LogQL.

\- Một số biện pháp hardening cho hệ thống.



\## 2. Kiến trúc hệ thống



Các thành phần chính:



\- Node.js: ứng dụng POS.

\- MySQL 8.0: cơ sở dữ liệu.

\- phpMyAdmin: quản trị MySQL.

\- Nginx: reverse proxy và security headers.

\- Prometheus: thu thập metrics.

\- Grafana: hiển thị và giám sát metrics.

\- cAdvisor: giám sát container.

\- MySQL Exporter: cung cấp metrics của MySQL.

\- Loki: lưu trữ log.

\- Promtail: thu thập log Docker.

\- Docker Compose: triển khai toàn bộ hệ thống.



\## 3. Công nghệ sử dụng



\- Node.js

\- Express.js

\- MySQL 8.0

\- phpMyAdmin

\- Nginx

\- Docker / Docker Compose

\- Prometheus

\- Grafana

\- cAdvisor

\- MySQL Exporter

\- Loki

\- Promtail



\## 4. Cấu trúc thư mục



```text

POS/

├── app/

├── mysql/

├── mysql-exporter/

├── nginx/

├── prometheus/

├── loki/

├── promtail/

├── docker-compose.yml

└── README.md



## 5. Khởi chạy hệ thống


Yêu cầu:
- Docker Desktop
- Docker Compose

Mở PowerShell và di chuyển đến thư mục project:

cd D:\POS

Khởi động toàn bộ hệ thống:

docker compose up -d --build

Kiểm tra trạng thái các container:

docker compose ps

Dừng hệ thống:

docker compose down

## 6. Các địa chỉ truy cập

### Website POS

http://localhost

### phpMyAdmin

http://localhost:8082

### Prometheus

http://localhost:9090

### Grafana

http://localhost:3001

### cAdvisor

http://localhost:8083

## 7. Monitoring

Hệ thống sử dụng Prometheus để thu thập metrics và Grafana để trực quan hóa dữ liệu giám sát.

Các thành phần được giám sát gồm:

- Node.js application
- Docker containers thông qua cAdvisor
- MySQL thông qua MySQL Exporter
- Prometheus

Dashboard Grafana gồm các thông tin:

- CPU Usage
- Docker Container RAM Usage
- MySQL Connections
- MySQL Queries
- MySQL Threads Running
- Trạng thái hệ thống

Prometheus thu thập dữ liệu định kỳ thông qua các target được cấu hình trong:

prometheus/prometheus.yml

## 8. Logging

Hệ thống sử dụng Loki và Promtail để thu thập và lưu trữ log của các Docker container.

Quy trình:

Docker Container
    ↓
Promtail
    ↓
Loki
    ↓
Grafana Explore

Một số truy vấn LogQL được sử dụng:

Hiển thị toàn bộ log:

{job="docker"}

Lọc log có nội dung error:

{job="docker"} |= "error"

Lọc log có nội dung warn:

{job="docker"} |= "warn"

## 9. Reverse Proxy và bảo mật

Nginx được sử dụng làm reverse proxy cho ứng dụng Node.js.

Luồng truy cập:

Client
    ↓
Nginx
    ↓
Node.js Application
    ↓
MySQL

Nginx được cấu hình các HTTP Security Headers:

- X-Content-Type-Options: nosniff
- X-Frame-Options: SAMEORIGIN
- Referrer-Policy: strict-origin-when-cross-origin

Ứng dụng Node.js được cấu hình chạy bằng user không phải root trong container để tăng mức độ an toàn.

## 10. Docker Network

Các service của hệ thống được triển khai trong Docker network riêng:

pos_network

Các container trong hệ thống có thể giao tiếp với nhau thông qua Docker network.

Một số service sử dụng network này:

- app
- mysql
- phpmyadmin
- nginx
- prometheus
- grafana
- cadvisor
- mysqld-exporter
- loki
- promtail

## 11. Git

Mã nguồn và các file cấu hình của hệ thống được quản lý bằng Git và lưu trữ trên GitHub.

Các mốc triển khai chính:

- Commit 1: Deploy POS application with Nginx reverse proxy
- Commit 2: Add Prometheus and Grafana monitoring
- Commit 3: Add Loki Promtail and LogQL logging
- Hardening: Run Node.js app as non-root user

Repository:

DTC245200681

Branch chính:

main
