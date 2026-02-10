# 🚀 Hướng Dẫn Setup Dự Án GoRide (Monolith)

## 📋 Yêu Cầu Hệ Thống

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 12.0

## 🔧 Bước 1: Cài Đặt Dependencies

### 1.1. Clone repository
```bash
git clone <repository-url>
cd PRN232-CA
```

### 1.2. Cài đặt dependencies ở root
```bash
npm install
```

## 🗄️ Bước 2: Cấu Hình Database

### 2.1. Tạo PostgreSQL Database
Tạo database tên là `goride_db` trong PostgreSQL của bạn.

### 2.2. Cấu hình Environment
Copy file `.env.example` thành `.env` và cập nhật `DATABASE_URL`:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/goride_db?schema=public"
```

### 2.3. Setup Prisma
```bash
npm run prisma:generate
npm run prisma:migrate
```

## 🚀 Bước 3: Chạy Dự Án

### 3.1. Chạy Tất Cả (Backend & Frontend)
```bash
npm run dev
```

### 3.2. Chạy Riêng Backend (Monolith)
```bash
npm run dev:be
```

## 🌐 Đường Dẫn Truy Cập

| Service | URL |
|---------|-----|
| **Web User** | http://localhost:3002 |
| **Web Manager** | http://localhost:3003 |
| **Backend API** | http://localhost:3000/api/v1 |
| **Prisma Studio** | http://localhost:5555 |

## 🛠 Troubleshooting

Nếu gặp lỗi `Prisma Client not found`, hãy chạy lại:
```bash
npm run prisma:generate
```
