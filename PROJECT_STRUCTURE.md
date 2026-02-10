# GoRide - NestJS Monolithic Structure

## Tổng quan

Dự án GoRide đã được chuyển đổi từ Microservices sang cấu hình **Monolithic**, gộp Logic Backend vào API Gateway để tinh gọn kiến trúc và dễ dàng quản lý.

## Cấu trúc thư mục

```
goride/
├── apps/
│   ├── api-gateway/           # Backend Monolith (NestJS)
│   │   ├── src/
│   │   │   ├── main.ts
│   │   │   ├── app.module.ts
│   │   │   ├── auth/          # Authentication & Authorization
│   │   │   ├── user/          # User Management
│   │   │   ├── motorbike/     # Motorbike Management
│   │   │   ├── rental/        # Rental Management
│   │   │   └── prisma/        # Database Access (Prisma Service)
│   │
│   ├── web-user/              # Frontend User (Next.js)
│   └── web-manager/           # Frontend Manager (Next.js)
│
├── libs/
│   └── shared/                 # Shared Library (Types, DTOs, Utils)
│
├── prisma/
│   └── schema.prisma           # Database schema
│
├── nest-cli.json               # NestJS CLI config
├── package.json                # Project dependencies & scripts
├── .env                        # Environment variables
└── README.md                   # Documentation
```

## Apps & Services

### 1. Backend Monolith (`apps/api-gateway`)
- **Port:** 3000
- **Mục đích:** Xử lý toàn bộ logic nghiệp vụ và API endpoints.
- **Công nghệ:** NestJS, Prisma ORM, JWT, Bcrypt.

### 2. Web User (`apps/web-user`)
- **Port:** 3002
- **Mục đích:** Frontend cho khách hàng đặt xe.
- **Tech Stack:** Next.js, Tailwind CSS.

### 3. Web Manager (`apps/web-manager`)
- **Port:** 3003
- **Mục đích:** Frontend quản lý xe và đơn thuê.
- **Tech Stack:** Next.js, Tailwind CSS.

## Database

- **ORM:** Prisma
- **Database:** PostgreSQL
- **Schema:** `prisma/schema.prisma`

## Lệnh khởi chạy

```bash
npm run dev                    # Chạy cả Backend và Frontend
npm run dev:be                 # Chỉ chạy Backend (Monolith)
npm run dev:fe                 # Chỉ chạy Frontend (User & Manager)
```

## Lưu ý

Kiến trúc gRPC và các microservices riêng lẻ đã bị loại bỏ. Toàn bộ logic hiện tập trung tại `apps/api-gateway`.
