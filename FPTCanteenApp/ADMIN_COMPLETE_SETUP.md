# 🚀 Hướng dẫn Setup Hoàn Chỉnh Admin FPTCanteenApp

## 📋 Tổng quan tính năng Admin

### 🍽️ 1. Quản lý Món Ăn (Menu Management)
- **CRUD Operations**: Thêm, sửa, xóa món ăn
- **Real-time Data**: Kết nối trực tiếp với backend
- **Image Management**: Upload và quản lý hình ảnh
- **Category & Brand Management**: Phân loại món ăn
- **Stock Management**: Quản lý số lượng tồn kho

### 📦 2. Quản lý Đơn Hàng (Order Management)
- **Order Status Management**: Cập nhật trạng thái đơn hàng
- **Order Details**: Xem chi tiết đơn hàng
- **Customer Information**: Thông tin khách hàng
- **Payment Tracking**: Theo dõi thanh toán
- **Filter by Status**: Lọc đơn hàng theo trạng thái

### 📊 3. Thống Kê Admin (Admin Statistics)
- **Revenue Analytics**: Phân tích doanh thu
- **Order Analytics**: Thống kê đơn hàng
- **Top Selling Items**: Món bán chạy nhất
- **Peak Hours Analysis**: Giờ cao điểm
- **Period Filtering**: Lọc theo thời gian

## 🔧 Setup Backend

### Bước 1: Cài đặt Dependencies
```bash
cd Backend
npm install
```

### Bước 2: Khởi động MongoDB
```bash
# Đảm bảo MongoDB đang chạy
mongod
```

### Bước 3: Seed Database
```bash
# Tạo categories và brands
node seedData.js

# Tạo sample products
node seedProducts.js

# Tạo sample orders (nếu có)
node seedOrders.js
```

### Bước 4: Khởi động Server
```bash
npm start
```

**Kết quả mong đợi:**
```
Server is running on port 5000
MongoDB Connected: localhost
✅ Categories seeded successfully!
✅ Brands seeded successfully!
✅ Products seeded successfully!
```

## 📱 Setup Frontend

### Bước 1: Cài đặt Dependencies
```bash
cd FPTCanteenApp
npm install
```

### Bước 2: Kiểm tra API Configuration
Đảm bảo tất cả API URLs đang sử dụng đúng port:
- `http://192.168.1.11:5000/api` (thay vì 8080)

### Bước 3: Khởi động App
```bash
npx expo start
```

## 🎯 Test các tính năng

### 1. Test Menu Management
1. **Vào Admin screen**
2. **Kiểm tra danh sách món ăn** - Nên hiển thị real data hoặc mock data
3. **Thêm món ăn mới** - Test CRUD functionality
4. **Sửa món ăn** - Test update functionality
5. **Xóa món ăn** - Test delete functionality

### 2. Test Order Management
1. **Vào tab "Đơn hàng"**
2. **Kiểm tra danh sách đơn hàng** - Nên hiển thị orders với status
3. **Thay đổi trạng thái** - Test status update
4. **Xem chi tiết đơn hàng** - Test detail modal
5. **Lọc theo trạng thái** - Test filter functionality

### 3. Test Admin Statistics
1. **Vào tab "Thống kê"**
2. **Kiểm tra các metrics** - Tổng đơn hàng, doanh thu, etc.
3. **Thay đổi period** - Test today/week/month filter
4. **Xem biểu đồ** - Test chart rendering
5. **Kiểm tra top selling items** - Test ranking display

## 🔍 Debug & Troubleshooting

### Nếu không load được data:
1. **Kiểm tra backend server**:
   ```bash
   curl http://192.168.1.11:5000/api/products
   ```

2. **Kiểm tra MongoDB connection**:
   ```bash
   mongo FPTCanteenDB
   db.products.find().pretty()
   ```

3. **Kiểm tra network**:
   ```bash
   ping 192.168.1.11
   ```

### Nếu có lỗi authentication:
1. **Kiểm tra token storage**
2. **Login lại với admin account**
3. **Kiểm tra JWT secret trong backend**

### Nếu có lỗi timeout:
1. **Tăng timeout trong API calls**
2. **Kiểm tra network speed**
3. **Restart backend server**

## 📊 Expected Results

### Menu Management:
- ✅ Hiển thị danh sách món ăn từ database
- ✅ Thêm/sửa/xóa món ăn thành công
- ✅ Upload hình ảnh hoạt động
- ✅ Category và brand selection hoạt động

### Order Management:
- ✅ Hiển thị danh sách đơn hàng
- ✅ Cập nhật trạng thái thành công
- ✅ Modal chi tiết hiển thị đầy đủ thông tin
- ✅ Filter theo trạng thái hoạt động

### Admin Statistics:
- ✅ Hiển thị metrics chính xác
- ✅ Biểu đồ render đúng
- ✅ Period filtering hoạt động
- ✅ Top selling items hiển thị đúng

## 🚀 Performance Tips

1. **Optimize Images**: Sử dụng compressed images
2. **Caching**: Implement caching cho API calls
3. **Pagination**: Add pagination cho large datasets
4. **Real-time Updates**: Consider WebSocket for live updates

## 🔐 Security Considerations

1. **Admin Authentication**: Ensure proper admin role checking
2. **Input Validation**: Validate all user inputs
3. **SQL Injection**: Use parameterized queries
4. **XSS Protection**: Sanitize user inputs

## 📝 API Endpoints Reference

### Products:
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Orders:
- `GET /api/orders` - Get all orders
- `PUT /api/orders/:id/status` - Update order status
- `GET /api/orders/stats` - Get order statistics

### Categories & Brands:
- `GET /api/categories` - Get all categories
- `GET /api/brands` - Get all brands

## 🎉 Success Criteria

Khi setup thành công, bạn sẽ có:
- ✅ Full CRUD cho món ăn với real data
- ✅ Order management với status updates
- ✅ Comprehensive statistics dashboard
- ✅ Responsive UI với smooth animations
- ✅ Error handling và fallback data
- ✅ Real-time data synchronization

**Chúc bạn setup thành công! 🚀** 