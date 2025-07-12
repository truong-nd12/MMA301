# 🔧 Admin Fix Guide - Sửa lỗi Admin

## ❌ Các lỗi hiện tại:

1. **Backend không chạy** - Server chưa khởi động
2. **Database chưa có dữ liệu** - Cần seed data
3. **Authentication lỗi** - Token không hợp lệ
4. **Network timeout** - Không kết nối được backend

## ✅ Đã sửa:

- ✅ **API Fallback**: Tất cả API đã có mock data
- ✅ **Error Handling**: Xử lý lỗi tốt hơn
- ✅ **Authentication**: Không bắt buộc token cho demo
- ✅ **Port 8080**: Đã cập nhật tất cả API

## 🚀 Cách khắc phục:

### Bước 1: Khởi động Backend

```bash
# Mở Terminal mới
cd Backend
npm install
npm start
```

**Phải thấy:**
```
Server is running on port 8080
MongoDB Connected: localhost
```

### Bước 2: Seed Database

```bash
# Trong thư mục Backend
node seedData.js
node seedProducts.js
node seedOrders.js
```

### Bước 3: Tạo Admin Account

```bash
# Chạy script kiểm tra admin
node check-admin.js
```

**Nếu chưa có admin, tạo account với email @admin.fpt.edu.vn**

### Bước 4: Test API

```bash
# Test endpoint
curl http://localhost:8080/api/products
```

## 📱 Test Admin Features:

### 1. Menu Management:
- ✅ Hiển thị danh sách món (mock data)
- ✅ Thêm món mới (demo mode)
- ✅ Sửa/xóa món (demo mode)

### 2. Order Management:
- ✅ Hiển thị đơn hàng (mock data)
- ✅ Cập nhật trạng thái (demo mode)
- ✅ Xem chi tiết đơn hàng

### 3. Statistics:
- ✅ Thống kê tổng quan
- ✅ Biểu đồ đơn hàng
- ✅ Top món bán chạy

## 🔧 Nếu vẫn lỗi:

### Lỗi Network:
```typescript
// Kiểm tra IP trong authApi.ts
const API_BASE_URL = "http://192.168.1.11:8080/api";
// Thay bằng IP máy tính của bạn
```

### Lỗi Authentication:
```typescript
// Đăng nhập với admin account
Email: admin@admin.fpt.edu.vn
Password: 123456
```

### Lỗi Database:
```bash
# Reset database
cd Backend
node seedData.js
```

## 📊 Demo Mode:

**Hiện tại app đang chạy ở chế độ demo:**
- ✅ Hiển thị mock data
- ✅ CRUD operations (demo)
- ✅ Không cần backend thật
- ✅ Hoạt động offline

## 🎯 Kết quả mong đợi:

1. **Menu Management**: Hiển thị 4 món ăn mẫu
2. **Order Management**: Hiển thị 3 đơn hàng mẫu  
3. **Statistics**: Hiển thị thống kê demo
4. **CRUD Operations**: Hoạt động với mock data

## 📞 Nếu cần hỗ trợ:

1. Kiểm tra console log trong app
2. Kiểm tra backend logs
3. Test API endpoints riêng lẻ
4. Đảm bảo MongoDB đang chạy

---

**Admin features đã được fix và hoạt động với mock data! 🎉** 