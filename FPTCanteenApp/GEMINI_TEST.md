# 🤖 Gemini API Integration Test

## ✅ **API Key đã được tích hợp:**
```
AIzaSyDddn1w-W-wdPdXMhBg-UbF5wIiAG7qNWM
```

## 🎯 **Cách test Gemini AI:**

### **1. Mở ứng dụng:**
- Chạy `npm start` hoặc `expo start`
- Mở app trên thiết bị/simulator

### **2. Kiểm tra Settings:**
- Vào **Settings** > **AI Nutrition Coach**
- Sẽ thấy **🤖 Google Gemini (Free)** được chọn
- Hiển thị: "AI miễn phí từ Google Gemini (60 requests/phút)"

### **3. Test Chat:**
- Vào **Theo dõi dinh dưỡng**
- Nhấn **Chat với AI**
- Header sẽ hiển thị: **🤖 Google Gemini** + **AI miễn phí**
- Thử chat: "Gợi ý món ăn cho tôi"

### **4. Kiểm tra Console:**
- Sẽ thấy log: `🤖 Using Google Gemini AI - Free and powerful!`
- Khi chat: `🤖 Calling Gemini API...`
- Response: `📡 Gemini response: {...}`

## 🔧 **Tính năng đã cấu hình:**

### **Auto-enable:**
- ✅ Tự động enable Gemini khi có API key
- ✅ Ưu tiên Gemini cao hơn các AI khác
- ✅ Auto-fallback về Local AI nếu lỗi

### **API Configuration:**
- ✅ Model: `gemini-pro`
- ✅ Temperature: 0.7
- ✅ Max tokens: 500
- ✅ Vietnamese prompt optimization

### **Error Handling:**
- ✅ Network error fallback
- ✅ Rate limit handling
- ✅ Invalid response fallback
- ✅ Detailed logging

## 📊 **Gemini Free Tier:**
- **60 requests/minute** - Rất nhiều cho chat
- **15 requests/minute** cho Gemini Pro
- **Không cần thẻ tín dụng**
- **Chất lượng cao** - Hiểu tiếng Việt tốt

## 🎉 **Kết quả mong đợi:**

### **Chat Examples:**
```
User: "Gợi ý món ăn cho tôi"
Gemini: "Dựa trên dinh dưỡng của bạn (1200/2000 cal), tôi gợi ý:
• Cơm gà xối mỡ (650 cal, 25g protein)
• Phở bò (450 cal, 18g protein)
• Bún chả (550 cal, 20g protein)

Bạn cần thêm 800 cal và 35g protein. Thử món giàu dinh dưỡng nhé!"

User: "Tôi cần bao nhiêu protein?"
Gemini: "🥩 Protein rất quan trọng cho cơ bắp và sức khỏe!

📊 Tình trạng của bạn:
• Đã ăn: 45g
• Mục tiêu: 80g
• Còn thiếu: 35g

💡 Lời khuyên:
Bạn cần thêm 35g protein. Thử món giàu đạm nhé!

🍽️ Gợi ý: Gà nướng, Cá hồi, Trứng, Đậu hũ"
```

## 🚀 **Bắt đầu sử dụng:**

1. **Mở app** và vào **Theo dõi dinh dưỡng**
2. **Chat với AI** - Gemini sẽ tự động hoạt động
3. **Thử các câu hỏi:**
   - "Gợi ý món ăn"
   - "Tôi cần bao nhiêu protein?"
   - "Làm sao để giảm cân?"
   - "Vitamin nào tốt cho mắt?"

## 🔍 **Troubleshooting:**

### **Nếu Gemini không hoạt động:**
1. Kiểm tra internet connection
2. Xem console log để debug
3. Tự động fallback về Local AI
4. Kiểm tra API key trong Settings

### **Nếu rate limit:**
- Gemini sẽ tự động chuyển Local AI
- Đợi 1 phút rồi thử lại
- Free tier: 60 requests/phút

---

**🎯 Kết luận:** Gemini API đã được tích hợp thành công và sẵn sàng sử dụng! 