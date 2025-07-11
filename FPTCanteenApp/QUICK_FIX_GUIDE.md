# 🚑 Quick Fix Guide - Sửa lỗi nhanh

## ❌ Lỗi hiện tại:

- `Error getting token: Cannot read property 'getItem' of undefined` ✅ **ĐÃ SỬA**
- `Network request failed` ⚠️ **CẦN KIỂM TRA**

## 🔧 Các bước sửa lỗi:

### Bước 1: Kiểm tra Backend (QUAN TRỌNG NHẤT!)

```bash
# Mở Terminal/Command Prompt mới
cd Backend
npm start
```

**Phải thấy:**

```
Server is running on port 8080
MongoDB Connected: localhost
```

**Nếu lỗi:**

- `npm start` không chạy → `npm install` trước
- Port bị chiếm → Đổi port trong `.env` hoặc kill process

### Bước 2: Kiểm tra URL (Nếu test trên điện thoại)

**Emulator/Simulator:**

- ✅ Sử dụng `localhost:8080` - OK

**Điện thoại thật:**

- ❌ `localhost` không hoạt động
- ✅ Phải thay bằng IP máy tính

**Lấy IP máy tính:**

```bash
# Windows
ipconfig

# Mac/Linux
ifconfig

# Tìm IP dạng: 192.168.1.xxx hoặc 10.0.0.xxx
```

**Sửa file `authApi.ts`:**

```typescript
// Thay localhost bằng IP máy tính
const API_BASE_URL = "http://192.168.1.100:8080/api";
```

### Bước 3: Tắt Firewall (tạm thời)

- **Windows:** Tắt Windows Defender Firewall
- **Mac:** System Preferences → Security & Privacy → Firewall → Turn Off
- **Hoặc:** Cho phép port 8080

### Bước 4: Kiểm tra Network

- Đảm bảo điện thoại và máy tính cùng WiFi
- Không sử dụng VPN
- Test ping từ điện thoại đến máy tính

## 🧪 Test nhanh:

### Test 1: Backend Running

Mở browser: `http://localhost:8080`

- ✅ Thấy: `{"message": "FPT Canteen API is running..."}`
- ❌ Không load → Backend chưa chạy

### Test 2: Network Connection

Mở app → Màn hình login có **Network Debug box**:

- 🟢 Internet: OK, Backend: OK → Hoàn hảo!
- 🟠 Internet: OK, Backend: Failed → Kiểm tra URL/Firewall
- 🔴 Internet: Failed → Kiểm tra WiFi

## 📱 Test trên từng môi trường:

### Expo Go (điện thoại thật):

1. Lấy IP máy tính
2. Sửa URL trong `authApi.ts`
3. Tắt firewall
4. Restart Expo server

### iOS Simulator:

- Sử dụng `localhost:8080` - Không cần đổi

### Android Emulator:

- Sử dụng `localhost:8080` - Không cần đổi

## 🚀 Test flow sau khi sửa:

1. **Khởi chạy Backend:**

   ```bash
   cd Backend && npm start
   ```

2. **Khởi chạy Frontend:**

   ```bash
   cd FPTCanteenApp && expo start
   ```

3. **Kiểm tra Network Debug:**

   - Mở app
   - Thấy Network Debug box → Nhấn "Test lại"
   - Đảm bảo cả Internet và Backend đều OK

4. **Test đăng ký:**

   ```
   Họ tên: Test User
   Username: testuser
   Email: test@example.com
   Mã SV: 123456
   Chuyên ngành: IT
   Năm: 3
   Lớp: IT301
   Password: 123456
   ```

5. **Test đăng nhập:**
   ```
   Email: test@example.com
   Password: 123456
   ```

## 📞 Nếu vẫn lỗi:

### Lỗi AsyncStorage: ✅ ĐÃ SỬA

- Import đã được sửa từ dynamic import thành static import

### Lỗi Network:

1. **Restart tất cả:**

   - Kill Backend (Ctrl+C)
   - Kill Expo (Ctrl+C)
   - Khởi chạy lại Backend
   - Khởi chạy lại Expo

2. **Kiểm tra log:**

   - Bật Developer Tools
   - Xem console log chi tiết
   - Tìm thông báo debug mới

3. **Thử URL khác:**

   ```typescript
   // Thử với IP khác nếu có nhiều network interface
   const API_BASE_URL = "http://10.0.0.5:8080/api";
   ```

4. **Test với Postman:**
   - Mở Postman
   - POST: `http://localhost:8080/api/auth/login`
   - Body: `{"email":"test@example.com","password":"123456"}`
   - Nếu OK → Vấn đề ở frontend

## ✅ Dấu hiệu thành công:

- Network Debug box biến mất (hoặc hiển thị tất cả OK)
- Đăng ký thành công → Thấy alert "Đăng ký thành công"
- Tự động vào màn hình chính
- Profile hiển thị đúng thông tin user

**🎯 Mục tiêu: Làm cho Network Debug box biến mất!**
