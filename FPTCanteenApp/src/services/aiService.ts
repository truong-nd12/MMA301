// AI Service for Nutrition Chatbot
import AsyncStorage from "@react-native-async-storage/async-storage";

export interface NutritionData {
  todayCalories: number;
  dailyGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
  recentMeals: string[];
}

export interface AIResponse {
  text: string;
  suggestions?: string[];
  type: "text" | "suggestion" | "nutrition_alert";
}

class AIService {
  private useLocalAI: boolean = true;
  private useGemini: boolean = false;
  private geminiApiKey: string = "AIzaSyDddn1w-W-wdPdXMhBg-UbF5wIiAG7qNWM"; // API key của user

  constructor() {
    this.loadGeminiApiKey();
    // Tự động enable Gemini nếu có API key
    if (this.geminiApiKey) {
      this.enableGemini();
    }
  }

  // Gemini API Integration (Free)
  async callGemini(
    userMessage: string,
    nutritionData: NutritionData
  ): Promise<AIResponse> {
    try {
      // Kiểm tra API key
      if (!this.geminiApiKey) {
        console.log("Gemini API key not configured, using local AI");
        return this.callLocalAI(userMessage, nutritionData);
      }

      const prompt = `Bạn là một trợ lý AI thông minh và hữu ích. Bạn có thể trả lời bất kỳ câu hỏi nào của người dùng.

${userMessage}

Hãy trả lời bằng tiếng Việt, chi tiết và hữu ích. Bạn có thể trả lời về bất kỳ chủ đề nào: học tập, công việc, giải trí, sức khỏe, dinh dưỡng, hoặc bất cứ điều gì khác.`;

      console.log("🤖 Calling Gemini API...");

      // Thử các model khác nhau
      const models = [
        "gemini-1.5-flash",
        "gemini-1.5-pro",
        "gemini-pro",
        "gemini-1.0-pro",
      ];

      let response;
      let lastError;

      for (const model of models) {
        try {
          console.log(`🔄 Trying model: ${model}`);

          response = await fetch(
            `https://generativelanguage.googleapis.com/v1/models/${model}:generateContent?key=${this.geminiApiKey}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: prompt,
                      },
                    ],
                  },
                ],
                generationConfig: {
                  temperature: 0.7,
                  topK: 40,
                  topP: 0.95,
                  maxOutputTokens: 500,
                },
              }),
            }
          );

          if (response.ok) {
            console.log(`✅ Model ${model} works!`);
            break;
          } else {
            const errorText = await response.text();
            console.log(
              `❌ Model ${model} failed: ${response.status} - ${errorText}`
            );
            lastError = new Error(
              `Gemini API error: ${response.status} - ${errorText}`
            );
          }
        } catch (error) {
          console.log(`❌ Model ${model} error:`, error);
          lastError = error;
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error("All Gemini models failed");
      }

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Gemini API error: ${response.status} - ${errorText}`);
        throw new Error(`Gemini API error: ${response.status}`);
      }

      const data = await response.json();
      console.log("📡 Gemini response:", data);

      let aiText = "";

      // Parse Gemini response
      if (data.candidates && data.candidates[0] && data.candidates[0].content) {
        aiText = data.candidates[0].content.parts[0].text;
      }

      // Fallback nếu response không tốt
      if (!aiText || aiText.length < 5) {
        console.log("Gemini response too short, using local AI");
        return this.callLocalAI(userMessage, nutritionData);
      }

      // Parse AI response for suggestions
      const suggestions = this.extractSuggestions(aiText);

      return {
        text: aiText,
        suggestions,
        type: suggestions.length > 0 ? "suggestion" : "text",
      };
    } catch (error) {
      console.error("Gemini API error:", error);
      // Fallback to local AI
      return this.callLocalAI(userMessage, nutritionData);
    }
  }

  // Local AI Fallback (Smart Rules)
  async callLocalAI(
    userMessage: string,
    nutritionData: NutritionData
  ): Promise<AIResponse> {
    const lowerMessage = userMessage.toLowerCase();

    // Enhanced local AI with more context and intelligence
    if (lowerMessage.includes("protein") || lowerMessage.includes("đạm")) {
      const proteinDeficit = nutritionData.proteinGoal - nutritionData.protein;
      const suggestions =
        proteinDeficit > 0
          ? ["Gà nướng", "Cá hồi", "Trứng", "Đậu hũ"]
          : ["Rau xanh", "Trái cây", "Ngũ cốc"];

      return {
        text: `🥩 Protein (đạm) rất quan trọng cho cơ bắp và sức khỏe!\n\n📊 Tình trạng của bạn:\n• Đã ăn: ${
          nutritionData.protein
        }g\n• Mục tiêu: ${nutritionData.proteinGoal}g\n• ${
          proteinDeficit > 0
            ? `Còn thiếu: ${proteinDeficit}g`
            : "✅ Đã đủ protein!"
        }\n\n💡 Lời khuyên:\n${
          proteinDeficit > 0
            ? `Bạn cần thêm ${proteinDeficit}g protein. Thử món giàu đạm nhé!`
            : "Tuyệt vời! Bạn đã đủ protein cho hôm nay."
        }\n\n🍽️ Gợi ý: ${suggestions.join(", ")}`,
        suggestions,
        type: "nutrition_alert",
      };
    }

    if (lowerMessage.includes("calo") || lowerMessage.includes("calories")) {
      const calorieDeficit =
        nutritionData.dailyGoal - nutritionData.todayCalories;
      const suggestions =
        calorieDeficit > 0
          ? ["Cơm gà xối mỡ", "Phở bò", "Bún chả"]
          : ["Salad rau", "Súp rau", "Trái cây"];

      return {
        text: `🔥 Calo là năng lượng cho cơ thể!\n\n📊 Hôm nay: ${
          nutritionData.todayCalories
        }/${nutritionData.dailyGoal} cal\n• ${
          calorieDeficit > 0
            ? `Còn thiếu: ${calorieDeficit} cal`
            : "✅ Đã đủ calo!"
        }\n\n💡 Lời khuyên:\n${
          calorieDeficit > 0
            ? `Bạn cần thêm ${calorieDeficit} cal. Thử món giàu năng lượng nhé!`
            : "Tuyệt vời! Bạn đã đủ calo cho hôm nay."
        }\n\n🍽️ Gợi ý: ${suggestions.join(", ")}`,
        suggestions,
        type: "nutrition_alert",
      };
    }

    if (lowerMessage.includes("gợi ý") || lowerMessage.includes("ăn gì")) {
      const calorieDeficit =
        nutritionData.dailyGoal - nutritionData.todayCalories;
      const proteinDeficit = nutritionData.proteinGoal - nutritionData.protein;

      let suggestions = [
        "Cơm gà xối mỡ",
        "Phở bò",
        "Bún chả",
        "Sinh tố trái cây",
      ];
      let recommendation = "";

      if (calorieDeficit > 200 && proteinDeficit > 10) {
        recommendation =
          "Bạn cần cả calo và protein. Gợi ý món chính giàu dinh dưỡng:";
        suggestions = [
          "Cơm gà xối mỡ",
          "Phở bò thêm thịt",
          "Bún chả",
          "Cơm tấm sườn",
        ];
      } else if (proteinDeficit > 10) {
        recommendation = "Bạn cần thêm protein. Gợi ý món giàu đạm:";
        suggestions = ["Gà nướng", "Cá hồi", "Trứng", "Đậu hũ"];
      } else if (calorieDeficit > 200) {
        recommendation = "Bạn cần thêm calo. Gợi ý món giàu năng lượng:";
        suggestions = ["Cơm gà xối mỡ", "Phở bò", "Bún chả", "Bánh mì thịt"];
      } else {
        recommendation = "Dựa trên dinh dưỡng của bạn, gợi ý món cân bằng:";
      }

      return {
        text: `🍽️ ${recommendation}\n\n🥗 Món chính:\n• Cơm gà xối mỡ (650 cal, 25g protein)\n• Phở bò (450 cal, 18g protein)\n• Bún chả (550 cal, 20g protein)\n\n🥤 Món phụ:\n• Sinh tố trái cây (120 cal)\n• Nước ép cam (80 cal)\n• Sữa chua (100 cal)\n\nBạn muốn đặt món nào?`,
        suggestions,
        type: "suggestion",
      };
    }

    if (lowerMessage.includes("giảm cân") || lowerMessage.includes("diet")) {
      return {
        text: `🎯 Kế hoạch giảm cân thông minh:\n\n📋 Nguyên tắc:\n• Calo nạp < Calo tiêu thụ (thiếu 300-500 cal)\n• Tăng protein (1.2-1.6g/kg cân nặng)\n• Giảm carbs, tăng chất xơ\n• Ăn nhiều rau xanh\n• Uống đủ nước (2-3 lít/ngày)\n\n🍽️ Món ăn phù hợp:\n• Salad gà (300 cal, 25g protein)\n• Cá hồi nướng (400 cal, 22g protein)\n• Súp rau (200 cal, 8g protein)\n• Trứng luộc (70 cal, 6g protein)\n\n💪 Kết hợp:\n• Tập cardio 30-45 phút/ngày\n• Tập strength 2-3 lần/tuần\n• Ngủ đủ 7-8 tiếng\n\n📊 Mục tiêu: Giảm 0.5-1kg/tuần`,
        type: "text",
      };
    }

    if (lowerMessage.includes("tăng cân") || lowerMessage.includes("bulk")) {
      return {
        text: `💪 Kế hoạch tăng cân lành mạnh:\n\n📋 Nguyên tắc:\n• Calo nạp > Calo tiêu thụ (thừa 300-500 cal)\n• Tăng protein (1.6-2.2g/kg cân nặng)\n• Tăng carbs phức hợp\n• Ăn 5-6 bữa/ngày\n• Tập luyện tăng cơ\n\n🍽️ Món ăn phù hợp:\n• Cơm gà xối mỡ (650 cal, 25g protein)\n• Phở bò thêm thịt (600 cal, 25g protein)\n• Bánh mì thịt (450 cal, 20g protein)\n• Sữa tươi (150 cal, 8g protein)\n\n🏋️ Tập luyện:\n• Strength training 3-4 lần/tuần\n• Progressive overload\n• Nghỉ ngơi đầy đủ\n\n📊 Mục tiêu: Tăng 0.5-1kg/tuần`,
        type: "text",
      };
    }

    if (lowerMessage.includes("vitamin") || lowerMessage.includes("vitamin")) {
      return {
        text: `🥬 Vitamin và khoáng chất quan trọng:\n\n🍊 Vitamin C:\n• Nguồn: Cam, chanh, ổi, ớt chuông\n• Tác dụng: Tăng miễn dịch, chống oxy hóa\n• Liều lượng: 75-90mg/ngày\n\n🥕 Vitamin A:\n• Nguồn: Cà rốt, bí đỏ, khoai lang\n• Tác dụng: Tốt cho mắt, tăng miễn dịch\n• Liều lượng: 700-900mcg/ngày\n\n🥬 Vitamin K:\n• Nguồn: Rau xanh, bông cải\n• Tác dụng: Tốt cho xương, đông máu\n• Liều lượng: 90-120mcg/ngày\n\n💊 Lời khuyên:\n• Ăn đa dạng rau củ quả\n• Ưu tiên thực phẩm tươi\n• Không nên lạm dụng supplement`,
        type: "text",
      };
    }

    if (lowerMessage.includes("carbs") || lowerMessage.includes("tinh bột")) {
      const carbsDeficit = nutritionData.carbsGoal - nutritionData.carbs;
      return {
        text: `🍚 Carbs (tinh bột) là nguồn năng lượng chính!\n\n📊 Tình trạng của bạn:\n• Đã ăn: ${
          nutritionData.carbs
        }g\n• Mục tiêu: ${nutritionData.carbsGoal}g\n• ${
          carbsDeficit > 0 ? `Còn thiếu: ${carbsDeficit}g` : "✅ Đã đủ carbs!"
        }\n\n💡 Lời khuyên:\n${
          carbsDeficit > 0
            ? `Bạn cần thêm ${carbsDeficit}g carbs. Thử món giàu tinh bột nhé!`
            : "Tuyệt vời! Bạn đã đủ carbs cho hôm nay."
        }\n\n🍽️ Gợi ý: Cơm, phở, bún, bánh mì, khoai tây`,
        suggestions: ["Cơm gà xối mỡ", "Phở bò", "Bún chả", "Bánh mì"],
        type: "nutrition_alert",
      };
    }

    if (lowerMessage.includes("fat") || lowerMessage.includes("chất béo")) {
      const fatDeficit = nutritionData.fatGoal - nutritionData.fat;
      return {
        text: `🥑 Fat (chất béo) quan trọng cho hormone và vitamin!\n\n📊 Tình trạng của bạn:\n• Đã ăn: ${
          nutritionData.fat
        }g\n• Mục tiêu: ${nutritionData.fatGoal}g\n• ${
          fatDeficit > 0 ? `Còn thiếu: ${fatDeficit}g` : "✅ Đã đủ fat!"
        }\n\n💡 Lời khuyên:\n${
          fatDeficit > 0
            ? `Bạn cần thêm ${fatDeficit}g fat. Thử món giàu chất béo tốt nhé!`
            : "Tuyệt vời! Bạn đã đủ fat cho hôm nay."
        }\n\n🍽️ Gợi ý: Cá hồi, bơ, hạt, dầu olive`,
        suggestions: ["Cá hồi", "Bơ", "Hạt điều", "Dầu olive"],
        type: "nutrition_alert",
      };
    }

    // Default response with context
    return {
      text: `Tôi hiểu bạn đang hỏi về "${userMessage}". Dựa trên dinh dưỡng hiện tại (${nutritionData.todayCalories}/${nutritionData.dailyGoal} cal), bạn có thể hỏi cụ thể về:\n\n• Protein, calo, carbs, fat\n• Gợi ý món ăn\n• Kế hoạch giảm/tăng cân\n• Vitamin và khoáng chất\n• Chế độ ăn đặc biệt\n\nHoặc nói "gợi ý" để tôi đề xuất món ăn phù hợp!`,
      type: "text",
    };
  }

  // Extract food suggestions from AI text
  private extractSuggestions(text: string): string[] {
    const foodItems = [
      "Gà nướng",
      "Cá hồi",
      "Trứng",
      "Đậu hũ",
      "Cơm gà xối mỡ",
      "Phở bò",
      "Bún chả",
      "Sinh tố trái cây",
      "Nước ép cam",
      "Sữa chua",
      "Salad rau",
      "Súp rau",
      "Trái cây",
    ];

    return foodItems
      .filter((item) => text.toLowerCase().includes(item.toLowerCase()))
      .slice(0, 4); // Max 4 suggestions
  }

  // Enable Gemini
  enableGemini() {
    this.useGemini = true;
    this.useLocalAI = false;
    console.log("Gemini AI enabled");
  }

  // Set Gemini API key
  async setGeminiApiKey(key: string) {
    this.geminiApiKey = key;
    await AsyncStorage.setItem("gemini_api_key", key);
    console.log("Gemini API key saved");
  }

  // Load Gemini API key
  private async loadGeminiApiKey() {
    try {
      const key = await AsyncStorage.getItem("gemini_api_key");
      if (key) {
        this.geminiApiKey = key;
        console.log("Gemini API key loaded");
      }
    } catch (error) {
      console.error("Error loading Gemini API key:", error);
    }
  }

  // Enable/disable local AI
  setUseLocalAI(useLocal: boolean) {
    this.useLocalAI = useLocal;
    this.useGemini = false;
  }

  // Check if Gemini is enabled
  isGeminiEnabled(): boolean {
    return this.useGemini;
  }

  // Main method to get AI response
  async getResponse(
    userMessage: string,
    nutritionData: NutritionData
  ): Promise<AIResponse> {
    if (this.useGemini) {
      return this.callGemini(userMessage, nutritionData);
    } else {
      return this.callLocalAI(userMessage, nutritionData);
    }
  }
}

export const aiService = new AIService();
