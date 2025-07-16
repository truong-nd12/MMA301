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
  Dimensions,
  Clipboard,
  Vibration,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { aiService, NutritionData, AIResponse } from "../services/aiService";

const { width } = Dimensions.get("window");

interface Message {
  id: string;
  text: string;
  isUser: boolean;
  timestamp: Date;
  type?: "text" | "suggestion" | "nutrition_alert";
  suggestions?: string[];
  nutritionData?: any;
  isLiked?: boolean;
  isDisliked?: boolean;
}

const TypingIndicator = () => (
  <Animatable.View animation="fadeIn" style={styles.typingIndicatorContainer}>
    <View style={styles.typingBubble}>
      <View style={styles.typingDots}>
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={[styles.typingDot, { animationDelay: 0 }]}
        />
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={[styles.typingDot, { animationDelay: 200 }]}
        />
        <Animatable.View
          animation="pulse"
          iterationCount="infinite"
          style={[styles.typingDot, { animationDelay: 400 }]}
        />
      </View>
      <Text style={styles.typingLabel}>AI đang soạn tin...</Text>
    </View>
  </Animatable.View>
);

const QuickActions = ({
  onActionPress,
}: {
  onActionPress: (action: string) => void;
}) => (
  <Animatable.View animation="fadeInUp" style={styles.quickActionsContainer}>
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => onActionPress("Tư vấn dinh dưỡng cho tôi")}
      >
        <Ionicons name="nutrition" size={20} color="#FF6B6B" />
        <Text style={styles.quickActionText}>Dinh dưỡng</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => onActionPress("Gợi ý món ăn healthy")}
      >
        <Ionicons name="restaurant" size={20} color="#4CAF50" />
        <Text style={styles.quickActionText}>Món ăn</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => onActionPress("Phân tích calo hôm nay")}
      >
        <Ionicons name="analytics" size={20} color="#2196F3" />
        <Text style={styles.quickActionText}>Phân tích</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={styles.quickActionButton}
        onPress={() => onActionPress("Lập kế hoạch ăn uống")}
      >
        <Ionicons name="calendar" size={20} color="#FF9500" />
        <Text style={styles.quickActionText}>Kế hoạch</Text>
      </TouchableOpacity>
    </ScrollView>
  </Animatable.View>
);

export default function AIChatScreen({ navigation, route }: any) {
  const getWelcomeMessage = () => {
    if (route.name === "GeminiAI") {
      return "👋 Xin chào! Tôi là **Google Gemini AI**\n\n🚀 Tôi có thể giúp bạn:\n• Trả lời mọi câu hỏi\n• Tư vấn dinh dưỡng & sức khỏe\n• Hỗ trợ học tập & công việc\n• Giải trí và trò chuyện\n• Và nhiều điều thú vị khác!\n\n💬 Hãy bắt đầu cuộc trò chuyện nhé!";
    } else {
      return "🏠 Chào mừng đến với **AICanteenFPT**!\n\n🤖 Tôi là trợ lý AI thông minh của căng tin FPT:\n• 🥗 Tư vấn dinh dưỡng cá nhân\n• 🍽️ Gợi ý món ăn phù hợp\n• 📊 Phân tích chỉ số dinh dưỡng\n• 📅 Lập kế hoạch ăn uống\n• 🏢 Hỗ trợ thông tin căng tin\n\n✨ Hỏi tôi bất cứ điều gì bạn muốn biết!";
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
  const [showQuickActions, setShowQuickActions] = useState(true);
  const scrollViewRef = useRef<ScrollView>(null);

  // Get AI type info for display based on route
  const getAiTypeInfo = () => {
    if (route.name === "GeminiAI") {
      return {
        type: "🤖 Google Gemini",
        color: "#4285f4",
        description: "AI miễn phí",
        avatar: "🤖",
      };
    } else {
      return {
        type: "🏠 AICanteenFPT",
        color: "#FF6B6B",
        description: "AI Local",
        avatar: "🏠",
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

  const sendMessage = async (text?: string) => {
    const messageText = text || inputText.trim();
    if (messageText === "") return;

    setShowQuickActions(false);

    const userMessage: Message = {
      id: Date.now().toString(),
      text: messageText,
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
        messageText,
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

      let errorMessage =
        "😔 Xin lỗi, tôi đang gặp sự cố. Vui lòng thử lại sau.";

      // Xử lý lỗi cụ thể
      if (error.message && error.message.includes("429")) {
        errorMessage = `🤖 **AI đang bận!**\n\n❌ **Lỗi:** Hết quota OpenAI API\n\n💡 **Cách khắc phục:**\n1. Vào https://platform.openai.com/account/billing\n2. Nạp thêm credit (tối thiểu $5)\n3. Hoặc dùng AI Local (miễn phí)\n\n🔄 Đang chuyển sang AI Local...`;

        // Tự động chuyển sang local AI
        aiService.setUseLocalAI(true);
        setIsAIConnected(false);

        // Thử lại với local AI
        setTimeout(async () => {
          try {
            const localResponse = await aiService.getResponse(
              messageText,
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
          "❌ **API Key không hợp lệ**\n\nVui lòng kiểm tra lại trong Settings > Cài đặt AI.";
      } else if (error.message && error.message.includes("network")) {
        errorMessage =
          "🌐 **Lỗi kết nối mạng**\n\nVui lòng kiểm tra internet và thử lại.";
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

  const handleQuickAction = (action: string) => {
    sendMessage(action);
  };

  const copyMessage = (text: string) => {
    Clipboard.setString(text);
    Vibration.vibrate(50);
    Alert.alert("✅ Đã sao chép", "Nội dung đã được sao chép vào clipboard");
  };

  const likeMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isLiked: !msg.isLiked, isDisliked: false }
          : msg
      )
    );
    Vibration.vibrate(50);
  };

  const dislikeMessage = (messageId: string) => {
    setMessages((prev) =>
      prev.map((msg) =>
        msg.id === messageId
          ? { ...msg, isDisliked: !msg.isDisliked, isLiked: false }
          : msg
      )
    );
    Vibration.vibrate(50);
  };

  const regenerateResponse = (messageIndex: number) => {
    if (messageIndex > 0) {
      const previousUserMessage = messages[messageIndex - 1];
      if (previousUserMessage.isUser) {
        sendMessage(previousUserMessage.text);
      }
    }
  };

  const renderMessage = (message: Message, index: number) => {
    const isUser = message.isUser;

    return (
      <Animatable.View
        key={message.id}
        animation="fadeInUp"
        delay={index * 100}
        style={[
          styles.messageContainer,
          isUser ? styles.userMessage : styles.aiMessage,
        ]}
      >
        {!isUser && (
          <View style={styles.aiAvatarContainer}>
            <LinearGradient
              colors={[aiInfo.color, aiInfo.color + "80"]}
              style={styles.aiAvatar}
            >
              <Text style={styles.aiAvatarText}>{aiInfo.avatar}</Text>
            </LinearGradient>
          </View>
        )}

        <View style={styles.messageBubbleContainer}>
          {isUser ? (
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={[styles.messageBubble, styles.userBubble]}
            >
              <Text style={[styles.messageText, styles.userText]}>
                {message.text}
              </Text>
            </LinearGradient>
          ) : (
            <View style={[styles.messageBubble, styles.aiBubble]}>
              <Text style={[styles.messageText, styles.aiText]}>
                {message.text}
              </Text>

              {message.suggestions && message.suggestions.length > 0 && (
                <View style={styles.suggestionsContainer}>
                  {message.suggestions.map((suggestion, suggestionIndex) => (
                    <Animatable.View
                      key={suggestionIndex}
                      animation="fadeInRight"
                      delay={suggestionIndex * 100}
                    >
                      <TouchableOpacity
                        style={styles.suggestionButton}
                        onPress={() => handleSuggestionPress(suggestion)}
                      >
                        <Text style={styles.suggestionText}>{suggestion}</Text>
                      </TouchableOpacity>
                    </Animatable.View>
                  ))}
                </View>
              )}
            </View>
          )}

          <View style={styles.messageFooter}>
            <Text style={styles.timestamp}>
              {message.timestamp.toLocaleTimeString("vi-VN", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </Text>

            {!isUser && (
              <View style={styles.messageActions}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => copyMessage(message.text)}
                >
                  <Ionicons name="copy-outline" size={16} color="#666" />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    message.isLiked && styles.activeAction,
                  ]}
                  onPress={() => likeMessage(message.id)}
                >
                  <Ionicons
                    name={message.isLiked ? "thumbs-up" : "thumbs-up-outline"}
                    size={16}
                    color={message.isLiked ? "#4CAF50" : "#666"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={[
                    styles.actionButton,
                    message.isDisliked && styles.activeAction,
                  ]}
                  onPress={() => dislikeMessage(message.id)}
                >
                  <Ionicons
                    name={
                      message.isDisliked ? "thumbs-down" : "thumbs-down-outline"
                    }
                    size={16}
                    color={message.isDisliked ? "#F44336" : "#666"}
                  />
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => regenerateResponse(index)}
                >
                  <Ionicons name="refresh-outline" size={16} color="#666" />
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {isUser && (
          <View style={styles.userAvatarContainer}>
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.userAvatar}
            >
              <Ionicons name="person" size={16} color="#fff" />
            </LinearGradient>
          </View>
        )}
      </Animatable.View>
    );
  };

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <View style={styles.headerInfo}>
            <View style={styles.headerAvatar}>
              <Text style={styles.headerAvatarText}>{aiInfo.avatar}</Text>
            </View>
            <View style={styles.headerText}>
              <Text style={styles.headerTitle}>
                {route.name === "GeminiAI" ? "Gemini AI" : "AICanteenFPT"}
              </Text>
              <View style={styles.headerStatus}>
                <View
                  style={[
                    styles.statusDot,
                    {
                      backgroundColor: isTyping ? "#FFD700" : "#4CAF50",
                    },
                  ]}
                />
                <Text style={styles.headerSubtitle}>
                  {isTyping ? "Đang soạn tin..." : "Trực tuyến"}
                </Text>
                <View
                  style={[
                    styles.aiTypeBadge,
                    { backgroundColor: aiInfo.color + "40" },
                  ]}
                >
                  <Text style={styles.aiTypeBadgeText}>
                    {aiInfo.description}
                  </Text>
                </View>
              </View>
            </View>
          </View>

          <TouchableOpacity
            style={styles.settingsButton}
            onPress={() => Alert.alert("Cài đặt", "Tính năng đang phát triển")}
          >
            <Ionicons name="settings-outline" size={22} color="#fff" />
          </TouchableOpacity>
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
          contentContainerStyle={styles.messagesContent}
        >
          {messages.map(renderMessage)}
          {isTyping && <TypingIndicator />}
        </ScrollView>

        {showQuickActions && messages.length <= 1 && (
          <QuickActions onActionPress={handleQuickAction} />
        )}

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder={
                route.name === "GeminiAI"
                  ? "Nhập câu hỏi bất kỳ..."
                  : "Hỏi tôi về dinh dưỡng..."
              }
              placeholderTextColor="#999"
              multiline
              maxLength={500}
            />
            <View style={styles.inputActions}>
              <TouchableOpacity
                style={styles.attachButton}
                onPress={() => Alert.alert("Tính năng", "Đang phát triển")}
              >
                <Ionicons name="attach-outline" size={20} color="#666" />
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  inputText.trim()
                    ? styles.sendButtonActive
                    : styles.sendButtonInactive,
                ]}
                onPress={() => sendMessage()}
                disabled={!inputText.trim()}
              >
                {inputText.trim() ? (
                  <LinearGradient
                    colors={["#FF6B6B", "#FF8E53"]}
                    style={styles.sendButtonGradient}
                  >
                    <Ionicons name="send" size={18} color="#fff" />
                  </LinearGradient>
                ) : (
                  <Ionicons name="send" size={18} color="#ccc" />
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    marginLeft: 12,
  },
  headerAvatar: {
    width: 45,
    height: 45,
    borderRadius: 22.5,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerAvatarText: {
    fontSize: 20,
  },
  headerText: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  headerStatus: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerSubtitle: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginLeft: 6,
    marginRight: 8,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  aiTypeBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  aiTypeBadgeText: {
    fontSize: 10,
    color: "#fff",
    fontWeight: "600",
  },
  settingsButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  chatContainer: {
    flex: 1,
  },
  messagesContainer: {
    flex: 1,
  },
  messagesContent: {
    padding: 16,
    paddingBottom: 20,
  },
  messageContainer: {
    marginBottom: 20,
    flexDirection: "row",
    alignItems: "flex-end",
  },
  userMessage: {
    justifyContent: "flex-end",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  messageBubbleContainer: {
    flex: 1,
    maxWidth: "85%",
  },
  messageBubble: {
    padding: 16,
    borderRadius: 20,
  },
  userBubble: {
    borderBottomRightRadius: 4,
    marginLeft: 10,
  },
  aiBubble: {
    backgroundColor: "#fff",
    borderBottomLeftRadius: 4,
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 22,
  },
  userText: {
    color: "#fff",
    fontWeight: "500",
  },
  aiText: {
    color: "#2c3e50",
  },
  aiAvatarContainer: {
    marginRight: 8,
    marginBottom: 20,
  },
  aiAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: "center",
    justifyContent: "center",
  },
  aiAvatarText: {
    fontSize: 16,
  },
  userAvatarContainer: {
    marginLeft: 8,
    marginBottom: 20,
  },
  userAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17.5,
    alignItems: "center",
    justifyContent: "center",
  },
  suggestionsContainer: {
    marginTop: 12,
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  suggestionButton: {
    backgroundColor: "#FF6B6B10",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#FF6B6B30",
  },
  suggestionText: {
    color: "#FF6B6B",
    fontSize: 13,
    fontWeight: "500",
  },
  messageFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 8,
  },
  timestamp: {
    fontSize: 11,
    color: "#999",
  },
  messageActions: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    padding: 6,
    marginLeft: 4,
    borderRadius: 12,
  },
  activeAction: {
    backgroundColor: "#f0f0f0",
  },
  typingIndicatorContainer: {
    alignItems: "flex-start",
    marginBottom: 20,
    flexDirection: "row",
  },
  typingBubble: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    borderBottomLeftRadius: 4,
    marginLeft: 43,
    marginRight: 10,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  typingDots: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  typingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FF6B6B",
    marginRight: 4,
  },
  typingLabel: {
    fontSize: 12,
    color: "#666",
    fontStyle: "italic",
  },
  quickActionsContainer: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  quickActionButton: {
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginRight: 12,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e9ecef",
    minWidth: 80,
  },
  quickActionText: {
    fontSize: 12,
    color: "#666",
    marginTop: 4,
    fontWeight: "500",
  },
  inputContainer: {
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "flex-end",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minHeight: 50,
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    color: "#2c3e50",
  },
  inputActions: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  attachButton: {
    padding: 8,
    marginRight: 8,
  },
  sendButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonGradient: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  sendButtonActive: {
    // Gradient will be applied
  },
  sendButtonInactive: {
    backgroundColor: "#e9ecef",
  },
});
