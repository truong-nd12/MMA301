# Chức năng Quản lý Admin - FPTCanteenApp

## 📦 Quản lý món ăn

### Tính năng chính:
- **Thêm món ăn mới**: Tạo món ăn với đầy đủ thông tin
- **Sửa món ăn**: Cập nhật thông tin món ăn hiện có
- **Xóa món ăn**: Loại bỏ món ăn khỏi menu
- **Thiết lập ngày bán**: Chọn ngày trong tuần để bán món
- **Quản lý số lượng**: Cập nhật số lượng có sẵn và tối đa
- **Trạng thái món**: Đặt trạng thái (Có sẵn/Sắp hết/Hết hàng)

### Cách sử dụng:

#### 1. Thêm món ăn mới:
- Nhấn nút "+" ở góc phải màn hình
- Điền đầy đủ thông tin:
  - Tên món (bắt buộc)
  - Giá bán (bắt buộc)
  - Mô tả
  - Hình ảnh URL
  - Chọn quầy bán
  - Chọn danh mục
  - Chọn ngày bán
  - Số lượng có sẵn và tối đa
- Nhấn "Thêm mới"

#### 2. Sửa món ăn:
- Nhấn nút "..." trên card món ăn
- Chọn "Sửa"
- Cập nhật thông tin cần thiết
- Nhấn "Cập nhật"

#### 3. Xóa món ăn:
- Nhấn nút "..." trên card món ăn
- Chọn "Xóa"
- Xác nhận xóa

#### 4. Quản lý trạng thái:
- Chọn trạng thái từ các nút: Có sẵn/Sắp hết/Hết hàng
- Trạng thái tự động cập nhật dựa trên số lượng

#### 5. Cập nhật số lượng:
- Nhập số lượng trực tiếp vào ô input
- Hệ thống tự động cập nhật trạng thái

## 📊 Thống kê đơn hàng

### Tính năng chính:
- **Tổng quan**: Số đơn hàng, doanh thu, giá trị trung bình
- **Thống kê theo ngày**: Biểu đồ đơn hàng theo ngày trong tuần
- **Giờ cao điểm**: Phân tích giờ đặt hàng nhiều nhất
- **Món bán chạy**: Top 5 món ăn được đặt nhiều nhất
- **Thông tin chi tiết**: Ngày bận nhất, giờ thấp điểm, món bán chạy nhất

### Cách sử dụng:

#### 1. Chọn khoảng thời gian:
- Hôm nay
- Tuần này
- Tháng này
- Quý này

#### 2. Xem thống kê:
- **Tổng đơn hàng**: Số lượng đơn hàng trong khoảng thời gian
- **Tổng doanh thu**: Tổng tiền thu được
- **Đơn hàng TB**: Giá trị trung bình mỗi đơn
- **Giờ cao điểm**: Giờ có nhiều đơn hàng nhất

#### 3. Phân tích biểu đồ:
- **Đơn hàng theo ngày**: Biểu đồ cột thể hiện số đơn theo ngày
- **Giờ cao điểm**: Biểu đồ cột thể hiện số đơn theo giờ

#### 4. Top món bán chạy:
- Danh sách món ăn được đặt nhiều nhất
- Hiển thị số lượng và doanh thu

## 🔧 Cấu trúc API

### Menu Management API:
```typescript
// Lấy danh sách món ăn
getMenuItems(): Promise<MenuItem[]>

// Lấy chi tiết món ăn
getMenuItem(id: string): Promise<MenuItem | undefined>

// Thêm món ăn mới
createMenuItem(item: Omit<MenuItem, 'id'>): Promise<MenuItem>

// Cập nhật món ăn
updateMenuItem(id: string, updates: Partial<MenuItem>): Promise<MenuItem | undefined>

// Xóa món ăn
deleteMenuItem(id: string): Promise<boolean>

// Cập nhật trạng thái
updateMenuItemStatus(id: string, status: MenuItem['status']): Promise<MenuItem | undefined>

// Cập nhật số lượng
updateMenuItemQuantity(id: string, availableQuantity: number): Promise<MenuItem | undefined>
```

### Order Statistics API:
```typescript
// Lấy thống kê đơn hàng
getOrderStats(dateRange?: { start: string; end: string }): Promise<OrderStats>

// Lấy đơn hàng theo khoảng thời gian
getOrdersByDateRange(startDate: string, endDate: string): Promise<Order[]>

// Lấy top món bán chạy
getTopSellingItems(limit: number = 10): Promise<Array<{ id: string; name: string; quantity: number; revenue: number }>>
```

## 📱 Giao diện người dùng

### Màn hình Quản lý món ăn:
- Header với nút thêm món mới
- Danh sách món ăn dạng card
- Mỗi card hiển thị: hình ảnh, tên, giá, trạng thái
- Nút action để sửa/xóa
- Form nhập liệu cho thêm/sửa món

### Màn hình Thống kê:
- Header với nút refresh
- Bộ lọc khoảng thời gian
- 4 card thống kê tổng quan
- 2 biểu đồ: đơn hàng theo ngày và giờ cao điểm
- Danh sách top món bán chạy
- Thông tin chi tiết bổ sung

## 🎨 Thiết kế UI/UX

### Màu sắc:
- Primary: #3498DB (Xanh dương)
- Success: #27AE60 (Xanh lá)
- Warning: #F39C12 (Cam)
- Danger: #E74C3C (Đỏ)
- Neutral: #7F8C8D (Xám)

### Animation:
- FadeInUp cho các card
- FadeIn cho menu action
- Smooth transitions

### Responsive:
- Tương thích với các kích thước màn hình
- ScrollView cho nội dung dài
- Horizontal scroll cho các nút option

## 🔐 Bảo mật

### Quyền truy cập:
- Admin mode cần xác thực
- Chỉ admin mới có thể truy cập các chức năng quản lý
- User mode chỉ có thể xem menu và đặt hàng

### Validation:
- Kiểm tra dữ liệu đầu vào
- Xác nhận trước khi xóa
- Hiển thị thông báo lỗi/thành công

## 🚀 Triển khai

### Cài đặt:
1. Đảm bảo đã cài đặt các dependencies cần thiết
2. Import các component mới vào navigation
3. Cấu hình routing cho admin mode

### Sử dụng:
1. Chuyển sang Admin Mode từ màn hình chính
2. Truy cập "Quản lý món" để quản lý menu
3. Truy cập "Thống kê" để xem báo cáo

## 📝 Ghi chú

- Dữ liệu hiện tại sử dụng mock data
- Có thể tích hợp với backend thực tế
- Hỗ trợ đa ngôn ngữ (hiện tại: Tiếng Việt)
- Có thể mở rộng thêm các tính năng khác 