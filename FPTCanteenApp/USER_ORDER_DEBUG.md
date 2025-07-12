# Debug: User Không Nhận Được Thông Tin Đơn Hàng

## Vấn đề
- User đặt món thành công nhưng không thấy đơn hàng trong OrderTracking
- Admin vẫn nhận được thông tin đơn hàng từ user

## Nguyên nhân có thể

### 1. Authentication Issues
- User chưa login hoặc token hết hạn
- Token không được gửi đúng cách trong API calls

### 2. Backend Issues
- Order được tạo nhưng không liên kết với user ID
- Database connection issues
- API routes không hoạt động

### 3. Frontend Issues
- OrderTrackingScreen không gọi API thực tế
- Data format mismatch

## Các bước Debug

### Bước 1: Kiểm tra Authentication
```bash
# Kiểm tra token trong AsyncStorage
# Mở DevTools > Application > Storage > AsyncStorage
# Tìm key: 'authToken'
```

### Bước 2: Kiểm tra Backend
```bash
# 1. Start backend
cd Backend
npm start

# 2. Kiểm tra logs khi user đặt món
# 3. Kiểm tra database có order mới không
```

### Bước 3: Test API Endpoints
```bash
# Test create order
curl -X POST http://192.168.1.11:8080/api/orders \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "items": [{"product": "PRODUCT_ID", "quantity": 1, "price": 30000}],
    "paymentMethod": "cash",
    "deliveryMethod": "pickup"
  }'

# Test get user orders
curl -X GET http://192.168.1.11:8080/api/orders/my-orders \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Bước 4: Kiểm tra Console Logs
- Mở DevTools > Console
- Đặt món và xem logs
- Kiểm tra OrderTrackingScreen logs

## Fixes đã áp dụng

### 1. OrderTrackingScreen
- ✅ Thêm import userOrderApi
- ✅ Thay thế mock data bằng API call thực tế
- ✅ Thêm error handling và fallback
- ✅ Cập nhật cancel order function

### 2. userOrderApi
- ✅ Đã có getUserOrders() function
- ✅ Đã có createOrder() function
- ✅ Đã có cancelOrder() function
- ✅ Có fallback mock data

### 3. Backend Routes
- ✅ GET /api/orders/my-orders (getUserOrders)
- ✅ POST /api/orders (createOrder)
- ✅ PUT /api/orders/:id/cancel (cancelOrder)

## Cách Test

### Test 1: Đặt món mới
1. Login với user account
2. Chọn món ăn và đặt hàng
3. Kiểm tra console logs
4. Vào OrderTracking xem có order mới không

### Test 2: Kiểm tra API
1. Mở DevTools > Network
2. Đặt món và xem API calls
3. Kiểm tra response status và data

### Test 3: Kiểm tra Database
1. Kiểm tra MongoDB có order mới không
2. Kiểm tra user ID trong order có đúng không

## Troubleshooting

### Nếu user vẫn không thấy orders:
1. Kiểm tra authentication token
2. Kiểm tra backend logs
3. Kiểm tra database connection
4. Test API endpoints manually

### Nếu API calls fail:
1. Kiểm tra network connection
2. Kiểm tra backend server
3. Kiểm tra CORS settings
4. Kiểm tra authentication middleware

### Nếu orders không được tạo:
1. Kiểm tra createOrder controller
2. Kiểm tra database schema
3. Kiểm tra validation errors
4. Kiểm tra product IDs

## Expected Flow
1. User đặt món → POST /api/orders
2. Backend tạo order với user ID
3. User vào OrderTracking → GET /api/orders/my-orders
4. Backend trả về orders của user đó
5. Frontend hiển thị orders

## Debug Commands
```bash
# Backend logs
cd Backend && npm start

# Frontend logs
cd FPTCanteenApp && npx expo start

# Database check (nếu có MongoDB Compass)
# Connect to mongodb://localhost:27017/fptcanteen
# Check orders collection
``` 