# GoRide - NestJS Monolith

> 🚀 **Nền tảng cho thuê xe máy tại Quy Nhơn** - Kiến trúc Backend tập trung (NestJS) và Frontend (Next.js)

## 📚 Tài Liệu

- **[📖 Hướng Dẫn Setup Chi Tiết](./SETUP_GUIDE.md)** - Hướng dẫn đầy đủ cách cài đặt và chạy dự án
- **[📋 Cấu Trúc Dự Án](./PROJECT_STRUCTURE.md)** - Chi tiết về kiến trúc Monolith mới

## ⚡ Quick Start

```bash
# 1. Cài đặt dependencies
npm install

# 2. Cấu hình database (tạo file .env từ .env.example)
cp .env.example .env
# Cập nhật DATABASE_URL trong .env

# 3. Setup database
npm run prisma:generate
npm run prisma:migrate

# 4. Chạy toàn bộ hệ thống
npm run dev
```

**Truy cập:**
- 🌐 Web User: http://localhost:3002
- 🔧 Web Manager: http://localhost:3003
- 🔌 API Gateway (Monolith): http://localhost:3000/api/v1

## Cấu trúc dự án

```
goride/
├── apps/
│   ├── api-gateway/        # NestJS Backend Monolith (Port 3000)
│   ├── web-user/          # Next.js Frontend User (Port 3002)
│   └── web-manager/        # Next.js Frontend Manager (Port 3003)
├── libs/
│   └── shared/             # Shared code, types, constants, DTOs
├── prisma/
│   └── schema.prisma       # Prisma database schema
└── package.json            # Root configuration
```

## Chạy Development

```bash
# Chạy cả Backend và Frontend
npm run dev

# Chỉ chạy Backend
npm run dev:be

# Chỉ chạy Frontend
npm run dev:fe
```

## Lưu ý quan trọng

Dự án đã được chuyển đổi từ mô hình Microservices thành **Monolith** tập trung tại `api-gateway`. Toàn bộ giao tiếp gRPC đã bị loại bỏ để đơn giản hóa việc triển khai và bảo trì.

# PRN232_BE
