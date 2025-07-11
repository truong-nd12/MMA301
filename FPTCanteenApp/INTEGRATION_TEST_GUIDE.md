# Hướng dẫn Test Tích hợp Frontend-Backend

## ✅ Tình trạng tích hợp

### Backend đã hoàn thành:

- ✅ Authentication API (đăng nhập, đăng ký)
- ✅ JWT Token management
- ✅ MongoDB connection
- ✅ User model với schema phù hợp

### Frontend đã tích hợp:

- ✅ AuthContext để quản lý trạng thái authentication
- ✅ API service để kết nối backend
- ✅ Auto navigation dựa trên authentication status
- ✅ Real-time login/register functionality
- ✅ Logout functionality
- ✅ ProfileScreen hiển thị user data thật

## 🚀 Cách test ứng dụng

### Bước 1: Khởi chạy Backend

```bash
cd Backend
npm start
```

Server sẽ chạy tại: `http://localhost:8080`

### Bước 2: Khởi chạy Frontend

```bash
cd FPTCanteenApp
npm start
# hoặc
expo start
```

### Bước 3: Test Flow Authentication

#### 3.1. Lần đầu mở app

- ✅ App sẽ hiển thị màn hình đăng nhập
- ✅ Có nút "Đăng ký" để chuyển sang màn hình đăng ký

#### 3.2. Test đăng ký user mới

1. Nhấn "Đăng ký"
2. Điền đầy đủ thông tin:
   ```
   Họ và tên: Nguyễn Văn A
   Tên đăng nhập: student01
   Email: student01@fpt.edu.vn
   Mã sinh viên: ST0001 (6 số)
   Chuyên ngành: Software Engineering
   Năm học: 3
   Lớp: SE1609
   Số điện thoại: 0123456789 (optional)
   Mật khẩu: 123456
   Xác nhận mật khẩu: 123456
   ```
3. Nhấn "Đăng ký"
4. ✅ Thành công: Alert "Đăng ký thành công" và tự động chuyển vào app
5. ✅ Thất bại: Hiển thị lỗi validation hoặc lỗi từ server

#### 3.3. Test đăng nhập

1. Nếu đã đăng ký, nhấn "Đăng nhập" ở màn hình đăng ký
2. Nhập:
   ```
   Email: student01@fpt.edu.vn
   Mật khẩu: 123456
   ```
3. Nhấn "Đăng nhập"
4. ✅ Thành công: Alert "Đăng nhập thành công" và vào app
5. ✅ Thất bại: Hiển thị lỗi "Invalid credentials"

#### 3.4. Test Profile Screen

1. Sau khi đăng nhập, vào tab "Profile"
2. ✅ Hiển thị thông tin user thật từ database:
   - Họ tên
   - Email
   - Mã sinh viên
   - Số lượng favorites
3. ✅ Có nút "Đăng xuất"

#### 3.5. Test logout

1. Ở Profile screen, nhấn "Đăng xuất"
2. ✅ Hiển thị confirm dialog
3. Nhấn "Đăng xuất"
4. ✅ Tự động quay về màn hình đăng nhập

#### 3.6. Test persistent login

1. Đăng nhập thành công
2. Kill app hoàn toàn
3. Mở lại app
4. ✅ Tự động vào app (không cần đăng nhập lại)

## 🧪 Test Cases chi tiết

### Authentication Tests

| Test Case                | Input                        | Expected Result                         |
| ------------------------ | ---------------------------- | --------------------------------------- |
| **Đăng ký hợp lệ**       | Đầy đủ thông tin đúng format | Thành công, auto login                  |
| **Email trùng**          | Email đã tồn tại             | Lỗi "User already exists"               |
| **Mật khẩu ngắn**        | Password < 6 ký tự           | Lỗi "Mật khẩu phải có ít nhất 6 ký tự"  |
| **Mã SV sai**            | StudentCode ≠ 6 số           | Lỗi "Mã sinh viên phải có đúng 6 ký tự" |
| **Email không hợp lệ**   | Email sai format             | Lỗi "Email không hợp lệ"                |
| **Confirm password sai** | confirmPassword ≠ password   | Lỗi "Mật khẩu xác nhận không khớp"      |
| **Đăng nhập đúng**       | Email/password đúng          | Thành công, vào app                     |
| **Đăng nhập sai**        | Email/password sai           | Lỗi "Invalid credentials"               |

### App Navigation Tests

| Test Case                 | Expected Result                |
| ------------------------- | ------------------------------ |
| **Chưa auth**             | Hiển thị Login/Register screen |
| **Đã auth**               | Hiển thị Main app              |
| **Logout**                | Quay về Login screen           |
| **Kill app khi đã login** | Auto login khi mở lại          |

## 🐛 Troubleshooting

### Backend không chạy

```bash
# Kiểm tra port 8080 có bị chiếm không
netstat -an | grep 8080

# Nếu bị chiếm, kill process hoặc đổi port
```

### MongoDB connection error

```bash
# Đảm bảo MongoDB đang chạy
brew services start mongodb-community  # macOS
sudo systemctl start mongod            # Ubuntu
net start MongoDB                      # Windows
```

### Frontend không kết nối được backend

1. Kiểm tra URL trong `authApi.ts`: `http://localhost:8080/api`
2. Nếu test trên device thật, đổi `localhost` thành IP máy
3. Đảm bảo backend đang chạy port 8080

### Token expired

- Logout và login lại
- Token có thời hạn 30 ngày (có thể config trong backend)

## 📱 Test trên Device

### iOS Simulator / Android Emulator

- Sử dụng `localhost:8080`

### Physical Device

- Thay `localhost` bằng IP máy tính:

```typescript
// trong authApi.ts
const API_BASE_URL = "http://192.168.1.100:8080/api";
```

### Expo Go

- Đảm bảo cùng network với máy chạy backend
- Có thể cần config firewall/antivirus

## 🔮 Tính năng sẽ phát triển tiếp

1. **Product Management**: CRUD sản phẩm
2. **Order System**: Đặt hàng, thanh toán
3. **Admin Panel**: Quản lý user, đơn hàng
4. **Push Notifications**: Thông báo real-time
5. **Image Upload**: Upload avatar, hình sản phẩm

## ✅ Checklist hoàn thành

- [x] Backend API Authentication
- [x] Frontend AuthContext
- [x] Login/Register UI integration
- [x] Auto navigation
- [x] Persistent login
- [x] Logout functionality
- [x] Profile data display
- [x] Error handling
- [x] Loading states
- [x] Validation

**🎉 Authentication system đã hoàn thành và sẵn sàng sử dụng!**
