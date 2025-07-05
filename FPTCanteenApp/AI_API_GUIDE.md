# 🤖 Hướng dẫn sử dụng AI API miễn phí

## 📋 Tổng quan

Ứng dụng FPTCanteen hỗ trợ 3 loại AI khác nhau:

1. **🏠 Local AI** - Hoàn toàn miễn phí, chạy offline
2. **🌐 Hugging Face** - API miễn phí (30k requests/tháng)
3. **⚡ OpenAI GPT** - API có phí (cần API key)

## 🏠 Local AI (Khuyến nghị)

### ✅ Ưu điểm:

- **100% miễn phí** - Không cần API key
- **Không giới hạn** - Dùng thoải mái
- **Hoạt động offline** - Không cần internet
- **Trả lời nhanh** - Không có độ trễ mạng
- **Bảo mật cao** - Dữ liệu không gửi đi đâu

### 🎯 Tính năng:

- Tư vấn dinh dưỡng thông minh
- Gợi ý món ăn dựa trên calo/protein
- Phân tích chỉ số dinh dưỡng
- Kế hoạch giảm/tăng cân
- Tư vấn vitamin và khoáng chất

### 🔧 Cách sử dụng:

1. Vào **Settings** > **AI Nutrition Coach**
2. Chọn **🏠 Local AI**
3. Chat thoải mái trong màn hình **Theo dõi dinh dưỡng**

## 🌐 Hugging Face API (Miễn phí)

### ✅ Ưu điểm:

- **30,000 requests/tháng** miễn phí
- **Nhiều model** AI chất lượng cao
- **Dễ sử dụng** - REST API đơn giản
- **Không cần thẻ tín dụng**

### 📊 Giới hạn:

- 30,000 requests/tháng
- Rate limit: 5 requests/giây
- Model: BlenderBot (chatbot)

### 🔧 Cách sử dụng:

1. Vào **Settings** > **AI Nutrition Coach**
2. Chọn **🌐 Hugging Face (Free)**
3. Bắt đầu chat - API sẽ tự động hoạt động

### 🌐 Website:

- https://huggingface.co/
- https://huggingface.co/docs/api-inference

## ⚡ OpenAI GPT (Có phí)

### ✅ Ưu điểm:

- **Chất lượng cao** - GPT-3.5/GPT-4
- **Hiểu context tốt** - Trả lời thông minh
- **Hỗ trợ tiếng Việt** - Tự nhiên

### 💰 Chi phí:

- **Free tier**: $5 credit miễn phí
- **GPT-3.5**: ~$0.002/1K tokens
- **GPT-4**: ~$0.03/1K tokens

### 🔧 Cách lấy API Key:

1. Truy cập: https://platform.openai.com/
2. Đăng ký tài khoản
3. Vào **API Keys** > **Create new secret key**
4. Copy API key (bắt đầu bằng `sk-`)

### 🔧 Cách sử dụng:

1. Vào **Settings** > **AI Nutrition Coach**
2. Chọn **⚡ OpenAI GPT**
3. Nhập API key khi được yêu cầu
4. Bắt đầu chat

## 🔄 Chuyển đổi giữa các loại AI

### Tự động chuyển đổi:

- Khi OpenAI hết quota → Tự động chuyển sang Local AI
- Khi Hugging Face lỗi → Tự động chuyển sang Local AI
- Luôn có fallback an toàn

### Chuyển đổi thủ công:

1. Vào **Settings** > **AI Nutrition Coach**
2. Chọn loại AI mong muốn
3. Lưu cài đặt

## 📱 Cách sử dụng trong app

### 1. Mở AI Chat:

- Vào **Theo dõi dinh dưỡng**
- Nhấn **Chat với AI**

### 2. Xem loại AI đang dùng:

- Header hiển thị: 🏠 Local AI, 🌐 Hugging Face, hoặc ⚡ OpenAI GPT
- Badge hiển thị: AI Offline, AI miễn phí, hoặc AI Cloud

### 3. Chat với AI:

- Hỏi về dinh dưỡng: "Tôi cần bao nhiêu protein?"
- Gợi ý món ăn: "Gợi ý món ăn cho tôi"
- Kế hoạch: "Làm sao để giảm cân?"
- Vitamin: "Vitamin nào tốt cho mắt?"

## 🛠️ Troubleshooting

### Lỗi OpenAI 429 (Quota exceeded):

```
❌ Lỗi: Hết quota OpenAI API
💡 Cách khắc phục:
1. Vào https://platform.openai.com/account/billing
2. Nạp thêm credit (tối thiểu $5)
3. Hoặc dùng AI Local (miễn phí)
🔄 Đang chuyển sang AI Local...
```

### Lỗi API Key không hợp lệ:

```
❌ API Key không hợp lệ
💡 Cách khắc phục:
1. Kiểm tra API key trong Settings
2. Đảm bảo key bắt đầu bằng "sk-"
3. Tạo key mới nếu cần
```

### Lỗi kết nối mạng:

```
🌐 Lỗi kết nối mạng
💡 Cách khắc phục:
1. Kiểm tra internet
2. Thử lại sau vài phút
3. Chuyển sang Local AI
```

## 💡 Lời khuyên

### 🏆 Khuyến nghị:

- **Bắt đầu với Local AI** - Miễn phí và đủ dùng
- **Thử Hugging Face** - Nếu muốn AI mạnh hơn
- **Dùng OpenAI** - Chỉ khi cần chất lượng cao nhất

### 💰 Tiết kiệm chi phí:

- Local AI: Hoàn toàn miễn phí
- Hugging Face: 30k requests/tháng miễn phí
- OpenAI: Chỉ dùng khi thực sự cần

### 🔒 Bảo mật:

- Local AI: Dữ liệu không rời khỏi thiết bị
- Hugging Face: Dữ liệu gửi đến server của họ
- OpenAI: Dữ liệu gửi đến OpenAI (có thể được sử dụng để training)

## 📞 Hỗ trợ

Nếu gặp vấn đề:

1. Kiểm tra phần Troubleshooting ở trên
2. Thử chuyển sang Local AI
3. Liên hệ support qua màn hình **Hỗ trợ**

---

**🎯 Kết luận:** Local AI là lựa chọn tốt nhất cho hầu hết người dùng - miễn phí, nhanh, và bảo mật!
