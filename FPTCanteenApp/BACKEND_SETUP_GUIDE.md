# Hướng dẫn Setup Backend cho Admin

## 🚨 Vấn đề hiện tại
Admin screen đang hiển thị mock data thay vì real data từ backend vì:
1. Backend server chưa chạy
2. Database chưa có data
3. Network connection issues

## 🔧 Cách khắc phục

### Bước 1: Khởi động Backend Server
```bash
cd Backend
npm install  # Nếu chưa install dependencies
npm start
```

**Kết quả mong đợi:**
```
Server is running on port 5000
MongoDB Connected: localhost
```

### Bước 2: Seed Database với Sample Data
```bash
cd Backend
node seedData.js    # Tạo categories, brands
node seedProducts.js # Tạo products
```

**Kết quả mong đợi:**
```
✅ Categories seeded successfully!
✅ Brands seeded successfully!
✅ Products seeded successfully!
```

### Bước 3: Test API Endpoint
```bash
curl http://192.168.1.11:5000/api/products
```

**Kết quả mong đợi:**
```json
{
  "success": true,
  "count": 5,
  "products": [...]
}
```

## 🔍 Debug Steps

### Kiểm tra Server Status
```bash
netstat -ano | findstr :5000
```

### Kiểm tra MongoDB
```bash
# Mở MongoDB Compass hoặc mongo shell
# Connect to: mongodb://localhost:27017/FPTCanteenDB
```

### Kiểm tra Network
```bash
ping 192.168.1.11
```

## 📱 Test trên App

1. **Khởi động app**
2. **Vào Admin screen**
3. **Kiểm tra console logs:**
   ```
   🔄 Loading menu items...
   🔗 Backend connection test: 200 OK
   📥 Response: { success: true, products: [...] }
   ```

## 🎯 Kết quả mong đợi

Sau khi setup xong:
- ✅ Admin screen hiển thị real products từ database
- ✅ Có thể thêm/sửa/xóa products
- ✅ Data được lưu vào MongoDB
- ✅ Không còn mock data fallback

## 🆘 Troubleshooting

### Nếu server không start:
- Kiểm tra port 5000 có bị chiếm không
- Kiểm tra MongoDB có chạy không
- Kiểm tra dependencies đã install chưa

### Nếu API trả về 404:
- Kiểm tra routes đã đúng chưa
- Kiểm tra database có data không

### Nếu network timeout:
- Kiểm tra IP address 192.168.1.11 có đúng không
- Kiểm tra firewall settings
- Thử localhost:5000 thay vì IP 