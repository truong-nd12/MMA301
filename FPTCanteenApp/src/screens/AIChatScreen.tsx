import React, { useState, useRef, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { aiService, NutritionData, AIResponse } from "../services/aiService";

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: "text" | "suggestion" | "nutrition_alert";
  suggestions?: string[];
  nutritionData?: any;
}

export default function AIChatScreen({ navigation, route }: any) {
  const getWelcomeMessage = () => {
    if (route.name === "GeminiAI") {
      return "Xin chào! Tôi là Google Gemini AI. Tôi có thể giúp bạn:\n\n• Trả lời bất kỳ câu hỏi nào\n• Tư vấn dinh dưỡng và sức khỏe\n• Hỗ trợ học tập và công việc\n• Giải trí và trò chuyện\n• Và nhiều điều khác!\n\nBạn muốn hỏi gì?";
    } else {
      return "Xin chào! Tôi là AICanteenFPT - Chatbot thông minh của FPT. Tôi có thể giúp bạn:\n\n• Tư vấn dinh dưỡng và sức khỏe\n• Gợi ý món ăn phù hợp\n• Phân tích chỉ số dinh dưỡng\n• Lập kế hoạch ăn uống\n• Hỗ trợ về căng tin FPT\n\nBạn muốn hỏi gì?";
    }
  };

  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: getWelcomeMessage(),
      isUser: false,
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [inputText, setInputText] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isAIConnected, setIsAIConnected] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get AI type info for display based on route
  const getAiTypeInfo = () => {
    if (route.name === "GeminiAI") {
      return {
        type: "🤖 Google Gemini",
        color: "#4285f4",
        description: "AI miễn phí",
      };
    } else {
      return {
        type: "🏠 AICanteenFPT",
        color: "#FF6F00",
        description: "AI Offline",
      };
    }
  };

  const aiInfo = getAiTypeInfo();

  // Dữ liệu dinh dưỡng mẫu của user
  const userNutritionData: NutritionData = {
    todayCalories: 1450,
    dailyGoal: 2000,
    protein: 45,
    proteinGoal: 60,
    carbs: 180,
    carbsGoal: 250,
    fat: 52,
    fatGoal: 65,
    recentMeals: ["Cơm gà xối mỡ", "Phở bò", "Sinh tố trái cây"],
  };

  // Initialize AI Service based on route
  useEffect(() => {
    initializeAI();
  }, [route.name]);

  const initializeAI = async () => {
    try {
      if (route.name === "GeminiAI") {
        // Use Gemini AI
        aiService.enableGemini();
        setIsAIConnected(true);
        console.log("🤖 Using Google Gemini AI - Free and powerful!");
      } else {
        // Use Local AI (AICanteenFPT)
        aiService.setUseLocalAI(true);
        setIsAIConnected(false);
        console.log("🏠 Using AICanteenFPT - Smart local chatbot!");
      }
    } catch (error) {
      console.log("❌ AI initialization error:", error);
      setIsAIConnected(false);
    }
  };

  const sendMessage = async () => {
    if (inputText.trim() === "") return;

    const userMessage: Message = {
      id: Date.now().toString(),
      text: inputText,
      isUser: true,
      timestamp: new Date(),
      type: "text",
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputText("");
    setIsTyping(true);

    try {
      // Gọi AI service thật
      const aiResponse: AIResponse = await aiService.getResponse(
        inputText,
        userNutritionData
      );

      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: aiResponse.text,
        isUser: false,
        timestamp: new Date(),
        type: aiResponse.type,
        suggestions: aiResponse.suggestions,
      };

      setMessages((prev) => [...prev, aiMessage]);
    } catch (error: any) {
      console.error("AI Service error:", error);

      let errorMessage = "Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.";

      // Xử lý lỗi cụ thể
      if (error.message && error.message.includes("429")) {
        errorMessage = `🤖 AI đang bận!\n\n❌ Lỗi: Hết quota OpenAI API\n\n💡 Cách khắc phục:\n1. Vào https://platform.openai.com/account/billing\n2. Nạp thêm credit (tối thiểu $5)\n3. Hoặc dùng AI Local (miễn phí)\n\n🔄 Đang chuyển sang AI Local...`;

        // Tự động chuyển sang local AI
        aiService.setUseLocalAI(true);
        setIsAIConnected(false);

        // Thử lại với local AI
        setTimeout(async () => {
          try {
            const localResponse = await aiService.getResponse(
              inputText,
              userNutritionData
            );
            const localMessage: Message = {
              id: (Date.now() + 2).toString(),
              text: localResponse.text,
              isUser: false,
              timestamp: new Date(),
              type: localResponse.type,
              suggestions: localResponse.suggestions,
            };
            setMessages((prev) => [...prev, localMessage]);
          } catch (localError) {
            console.error("Local AI error:", localError);
          }
        }, 1000);
      } else if (error.message && error.message.includes("401")) {
        errorMessage =
          "❌ API Key không hợp lệ. Vui lòng kiểm tra lại trong Settings > Cài đặt AI.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "🌐 Lỗi kết nối mạng. Vui lòng kiểm tra internet và thử lại.";
      }

      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        text: errorMessage,
        isUser: false,
        timestamp: new Date(),
        type: "text",
      };

      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleSuggestionPress = (suggestion: string) => {
    setInputText(suggestion);
  };

  const renderMessage = (message: Message) => {
    return (
      <View
        key={message.id}
        style={[
          styles.messageContainer,
          message.isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        <View
          style={[
            styles.messageBubble,
            message.isUser ? styles.userBubble : styles.aiBubble,
          ]}
        >
          <Text
            style={[
              styles.messageText,
              message.isUser ? styles.userText : styles.aiText,
            ]}
          >
            {message.text}
          </Text>

          {message.suggestions && message.suggestions.length > 0 && (
            <View style={styles.suggestionsContainer}>
              {message.suggestions.map((suggestion, index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.suggestionButton}
                  onPress={() => handleSuggestionPress(suggestion)}
                >
                  <Text style={styles.suggestionText}>{suggestion}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}

          <Text style={styles.timestamp}>
            {message.timestamp.toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        </View>
      </View>
    );
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <View style={styles.headerContent}>
          <View style={styles.aiAvatar}>
            <Ionicons name="chatbubbles" size={24} color="#fff" />
          </View>
          <View style={styles.headerText}>
            <Text style={styles.headerTitle}>
              {route.name === "GeminiAI" ? "Gemini AI" : "AICanteenFPT"}
            </Text>
            <View style={styles.headerStatus}>
              <Text style={styles.headerSubtitle}>
                {isTyping ? "Đang nhập..." : "Trực tuyến"}
              </Text>
              <View
                style={[styles.statusDot, { backgroundColor: aiInfo.color }]}
              />
              <Text style={styles.statusText}>{aiInfo.type}</Text>
              <View
                style={[styles.aiTypeBadge, { backgroundColor: aiInfo.color }]}
              >
                <Text style={styles.aiTypeBadgeText}>{aiInfo.description}</Text>
              </View>
            </View>
          </View>
        </View>
      </LinearGradient>

      <KeyboardAvoidingView
        style={styles.chatContainer}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesContainer}
          showsVerticalScrollIndicator={false}
        >
          {messages.map(renderMessage)}
          {isTyping && (
            <View style={styles.typingIndicator}>
              <Text style={styles.typingText}>AI đang nhập...</Text>
            </View>
          )}
        </ScrollView>

        <View style={styles.inputContainer}>
          <TextInput
            style={styles.textInput}
            value={inputText}
            onChangeText={setInputText}
            placeholder={
              route.name === "GeminiAI"
                ? "Nhập câu hỏi bất kỳ..."
                : "Nhập câu hỏi về dinh dưỡng..."
            }
            placeholderTextColor="#999"
            multiline
            maxLength={500}
          />
          <TouchableOpacity
            style={[
              styles.sendButton,
              inputText.trim()
                ? styles.sendButtonActive
                : styles.sendButtonInactive,
            ]}
            onPress={sendMessage}
            disabled={!inputText.trim()}
          >
            <Ionicons
              name="send"
              size={20}
              color={inputText.trim() ? "#fff" : "#ccc"}
            />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: 60,
    paddingBottom: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },

  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
  },
  aiAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 2,
  },
  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 4,
  },
  statusText: {
    fontSize: 10,
    color: "rgba(255,255,255,0.8)",
  },
  aiTypeBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    marginLeft: 4,
  },
  aiTypeBadgeText: {
    fontSize: 8,
    color: "#fff",
    fontWeight: "500",
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
    padding: 16,
  },
  messageContainer: {
    marginBottom: 16,
  },
  userMessage: {
    alignItems: "flex-end",
  },
  aiMessage: {
    alignItems: "flex-start",
  },
  messageBubble: {
    maxWidth: "80%",
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    backgroundColor: "#667eea",
    borderBottomRightRadius: 4,
  },
  aiBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
  },
  aiText: {
    color: "#333",
  },
  suggestionsContainer: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: "#667eea22",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#667eea44",
  },
  suggestionText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "500",
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
    marginTop: 8,
    textAlign: "right",
  },
  typingIndicator: {
    alignItems: "flex-start",
    marginBottom: 16,
  },
  typingText: {
    fontSize: 14,
    color: "#666",
    fontStyle: "italic",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f8f9fa",
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginRight: 12,
    fontSize: 16,
    maxHeight: 100,
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    backgroundColor: "#667eea",
  },
  sendButtonInactive: {
    backgroundColor: "#f0f0f0",
  },
});
