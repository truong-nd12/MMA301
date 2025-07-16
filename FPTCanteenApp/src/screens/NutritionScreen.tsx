import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  RefreshControl,
  Dimensions,
  StatusBar,
  Modal,
  TextInput,
  FlatList,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import * as Animatable from "react-native-animatable";
import * as Haptics from "expo-haptics";
import { aiService, NutritionData, AIResponse } from "../services/aiService";

const { width } = Dimensions.get("window");

interface AIMessage {
  id: string;
  text: string;
  isAI: boolean;
  timestamp: Date;
  suggestions?: string[];
}

interface AISuggestion {
  title: string;
  description: string;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  icon: string;
}

export default function NutritionScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const [showAIChat, setShowAIChat] = useState(false);
  const [aiMessages, setAiMessages] = useState<AIMessage[]>([]);
  const [aiInput, setAiInput] = useState("");
  const [isAILoading, setIsAILoading] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AISuggestion[]>([]);
  const [showAISuggestions, setShowAISuggestions] = useState(false);

  const [dailyGoal] = useState({
    calories: 2000,
    protein: 60,
    carbs: 250,
    fat: 65,
    fiber: 25,
    water: 8, // glasses
  });

  const [todayNutrition] = useState({
    calories: 1450,
    protein: 45,
    carbs: 180,
    fat: 52,
    fiber: 18,
    water: 6,
  });

  const [weeklyData] = useState([
    { day: "T2", calories: 1850, protein: 58, carbs: 220, fat: 68 },
    { day: "T3", calories: 2100, protein: 65, carbs: 260, fat: 72 },
    { day: "T4", calories: 1650, protein: 52, carbs: 190, fat: 58 },
    { day: "T5", calories: 1950, protein: 62, carbs: 240, fat: 65 },
    { day: "T6", calories: 1750, protein: 55, carbs: 210, fat: 60 },
    { day: "T7", calories: 2200, protein: 68, carbs: 280, fat: 75 },
    { day: "CN", calories: 1800, protein: 58, carbs: 220, fat: 65 },
  ]);

  const [recentMeals] = useState([
    {
      id: "1",
      name: "Cơm gà xối mỡ",
      time: "12:30",
      calories: 650,
      protein: 25,
      carbs: 85,
      fat: 22,
      image: "🍗",
    },
    {
      id: "2",
      name: "Phở bò",
      time: "18:00",
      calories: 450,
      protein: 18,
      carbs: 65,
      fat: 15,
      image: "🍜",
    },
    {
      id: "3",
      name: "Sinh tố trái cây",
      time: "15:30",
      calories: 120,
      protein: 2,
      carbs: 25,
      fat: 0,
      image: "🥤",
    },
  ]);

  // Tạo nutrition data cho AI
  const getNutritionData = (): NutritionData => ({
    todayCalories: todayNutrition.calories,
    dailyGoal: dailyGoal.calories,
    protein: todayNutrition.protein,
    proteinGoal: dailyGoal.protein,
    carbs: todayNutrition.carbs,
    carbsGoal: dailyGoal.carbs,
    fat: todayNutrition.fat,
    fatGoal: dailyGoal.fat,
    recentMeals: recentMeals.map((meal) => meal.name),
  });

  // AI Analysis functions
  const analyzeNutritionWithAI = async (type: string) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsAILoading(true);

    try {
      const nutritionData = getNutritionData();
      let query = "";

      switch (type) {
        case "calories":
          query = `Phân tích chi tiết tình trạng calo của tôi hôm nay (${nutritionData.todayCalories}/${nutritionData.dailyGoal} cal). Đưa ra lời khuyên cụ thể về việc ăn uống tiếp theo.`;
          break;
        case "protein":
          query = `Phân tích tình trạng protein của tôi (${nutritionData.protein}/${nutritionData.proteinGoal}g). Tôi cần ăn gì để đủ protein?`;
          break;
        case "balance":
          query = `Phân tích tổng thể cân bằng dinh dưỡng của tôi hôm nay. Protein: ${nutritionData.protein}/${nutritionData.proteinGoal}g, Carbs: ${nutritionData.carbs}/${nutritionData.carbsGoal}g, Fat: ${nutritionData.fat}/${nutritionData.fatGoal}g. Đưa ra kế hoạch ăn uống cho buổi tối.`;
          break;
        case "suggestions":
          query = `Dựa trên dinh dưỡng hiện tại của tôi, hãy gợi ý 3-4 món ăn cụ thể từ thực đơn canteen FPT với calories và dinh dưỡng chi tiết.`;
          break;
        default:
          query = "Phân tích tổng thể dinh dưỡng của tôi và đưa ra lời khuyên.";
      }

      const response = await aiService.getResponse(query, nutritionData);

      // Hiển thị kết quả trong alert hoặc modal
      Alert.alert("🤖 Phân tích AI", response.text, [
        { text: "Đóng", style: "cancel" },
        { text: "Chat với AI", onPress: () => setShowAIChat(true) },
      ]);

      // Nếu có suggestions, tạo AI suggestions
      if (response.suggestions && response.suggestions.length > 0) {
        generateAISuggestions(response.suggestions);
      }
    } catch (error) {
      Alert.alert("Lỗi", "Không thể phân tích dinh dưỡng. Vui lòng thử lại.");
    } finally {
      setIsAILoading(false);
    }
  };

  // Generate AI meal suggestions với nutrition details
  const generateAISuggestions = (mealNames: string[]) => {
    const mealDatabase: { [key: string]: AISuggestion } = {
      "Cơm gà xối mỡ": {
        title: "Cơm gà xối mỡ",
        description: "Món chính giàu protein, cân bằng dinh dưỡng",
        calories: 650,
        protein: 25,
        carbs: 85,
        fat: 22,
        icon: "🍗",
      },
      "Phở bò": {
        title: "Phở bò",
        description: "Món truyền thống, nhẹ nhàng, dễ tiêu hóa",
        calories: 450,
        protein: 18,
        carbs: 65,
        fat: 15,
        icon: "🍜",
      },
      "Gà nướng": {
        title: "Gà nướng",
        description: "Giàu protein, ít carbs, phù hợp giảm cân",
        calories: 400,
        protein: 35,
        carbs: 5,
        fat: 18,
        icon: "🍗",
      },
      "Cá hồi": {
        title: "Cá hồi nướng",
        description: "Giàu omega-3, protein cao chất lượng",
        calories: 380,
        protein: 28,
        carbs: 0,
        fat: 20,
        icon: "🐟",
      },
      "Salad rau": {
        title: "Salad rau củ",
        description: "Ít calo, nhiều vitamin, chất xơ cao",
        calories: 150,
        protein: 8,
        carbs: 20,
        fat: 5,
        icon: "🥗",
      },
      "Bún chả": {
        title: "Bún chả",
        description: "Cân bằng protein và carbs, đậm đà",
        calories: 550,
        protein: 20,
        carbs: 70,
        fat: 18,
        icon: "🍝",
      },
    };

    const suggestions = mealNames
      .map(
        (name) =>
          mealDatabase[name] || {
            title: name,
            description: "Món ăn được AI đề xuất",
            calories: 400,
            protein: 15,
            carbs: 50,
            fat: 12,
            icon: "🍽️",
          }
      )
      .slice(0, 4);

    setAiSuggestions(suggestions);
    setShowAISuggestions(true);
  };

  // AI Chat functions
  const sendAIMessage = async () => {
    if (!aiInput.trim()) return;

    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    const userMessage: AIMessage = {
      id: Date.now().toString(),
      text: aiInput.trim(),
      isAI: false,
      timestamp: new Date(),
    };

    setAiMessages((prev) => [...prev, userMessage]);
    setAiInput("");
    setIsAILoading(true);

    try {
      const nutritionData = getNutritionData();
      const response = await aiService.getResponse(
        aiInput.trim(),
        nutritionData
      );

      const aiMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: response.text,
        isAI: true,
        timestamp: new Date(),
        suggestions: response.suggestions,
      };

      setAiMessages((prev) => [...prev, aiMessage]);

      // Nếu có suggestions từ AI, generate meal suggestions
      if (response.suggestions && response.suggestions.length > 0) {
        generateAISuggestions(response.suggestions);
      }
    } catch (error) {
      const errorMessage: AIMessage = {
        id: (Date.now() + 1).toString(),
        text: "Xin lỗi, tôi gặp lỗi khi phân tích. Vui lòng thử lại sau.",
        isAI: true,
        timestamp: new Date(),
      };
      setAiMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsAILoading(false);
    }
  };

  const initializeAIChat = async () => {
    const nutritionData = getNutritionData();
    const calorieDeficit =
      nutritionData.dailyGoal - nutritionData.todayCalories;
    const proteinDeficit = nutritionData.proteinGoal - nutritionData.protein;

    let welcomeMessage = `🤖 Chào bạn! Tôi là AI Dinh Dưỡng của FPT Canteen.\n\n`;
    welcomeMessage += `📊 Tình trạng dinh dưỡng hôm nay:\n`;
    welcomeMessage += `• Calo: ${nutritionData.todayCalories}/${
      nutritionData.dailyGoal
    } (${calorieDeficit > 0 ? `thiếu ${calorieDeficit}` : "đủ"})\n`;
    welcomeMessage += `• Protein: ${nutritionData.protein}/${
      nutritionData.proteinGoal
    }g (${proteinDeficit > 0 ? `thiếu ${proteinDeficit}g` : "đủ"})\n\n`;
    welcomeMessage += `💡 Bạn có thể hỏi tôi về:\n`;
    welcomeMessage += `• Phân tích dinh dưỡng chi tiết\n`;
    welcomeMessage += `• Gợi ý món ăn phù hợp\n`;
    welcomeMessage += `• Kế hoạch giảm/tăng cân\n`;
    welcomeMessage += `• Lời khuyên dinh dưỡng\n\n`;
    welcomeMessage += `Bạn muốn tôi phân tích gì?`;

    const initialMessage: AIMessage = {
      id: "welcome",
      text: welcomeMessage,
      isAI: true,
      timestamp: new Date(),
    };

    setAiMessages([initialMessage]);
  };

  useEffect(() => {
    if (showAIChat && aiMessages.length === 0) {
      initializeAIChat();
    }
  }, [showAIChat]);

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "#4ECDC4";
    if (progress >= 70) return "#FF8E53";
    return "#FF6B6B";
  };

  const handleAIChat = async () => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setShowAIChat(true);
  };

  const handleMealPress = async (meal: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Alert.alert("Thông tin món ăn", `${meal.name}\n${meal.calories} calories`, [
      { text: "Đóng", style: "cancel" },
      {
        text: "Phân tích AI",
        onPress: () => analyzeNutritionWithAI("suggestions"),
      },
    ]);
  };

  // Render AI Analysis Buttons
  const renderAIAnalysisSection = () => {
    return (
      <Animatable.View
        animation="fadeInUp"
        delay={300}
        style={styles.aiAnalysisSection}
      >
        <Text style={styles.sectionTitle}>🤖 Phân tích AI</Text>

        <View style={styles.aiButtonsGrid}>
          <TouchableOpacity
            style={styles.aiAnalysisButton}
            onPress={() => analyzeNutritionWithAI("calories")}
            disabled={isAILoading}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.aiButtonGradient}
            >
              <Ionicons name="flame-outline" size={24} color="#fff" />
              <Text style={styles.aiButtonText}>Phân tích Calo</Text>
              <Text style={styles.aiButtonSubtext}>AI phân tích chi tiết</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aiAnalysisButton}
            onPress={() => analyzeNutritionWithAI("protein")}
            disabled={isAILoading}
          >
            <LinearGradient
              colors={["#4ECDC4", "#45B7D1"]}
              style={styles.aiButtonGradient}
            >
              <Ionicons name="fitness-outline" size={24} color="#fff" />
              <Text style={styles.aiButtonText}>Phân tích Protein</Text>
              <Text style={styles.aiButtonSubtext}>Tối ưu cơ bắp</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aiAnalysisButton}
            onPress={() => analyzeNutritionWithAI("balance")}
            disabled={isAILoading}
          >
            <LinearGradient
              colors={["#96CEB4", "#FFEAA7"]}
              style={styles.aiButtonGradient}
            >
              <Ionicons name="analytics-outline" size={24} color="#fff" />
              <Text style={styles.aiButtonText}>Cân bằng tổng thể</Text>
              <Text style={styles.aiButtonSubtext}>Kế hoạch buổi tối</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.aiAnalysisButton}
            onPress={() => analyzeNutritionWithAI("suggestions")}
            disabled={isAILoading}
          >
            <LinearGradient
              colors={["#DDA0DD", "#FF8E53"]}
              style={styles.aiButtonGradient}
            >
              <Ionicons name="restaurant-outline" size={24} color="#fff" />
              <Text style={styles.aiButtonText}>Gợi ý thực đơn</Text>
              <Text style={styles.aiButtonSubtext}>AI đề xuất món ăn</Text>
            </LinearGradient>
          </TouchableOpacity>
        </View>
      </Animatable.View>
    );
  };

  // Render AI Suggestions Modal
  const renderAISuggestionsModal = () => {
    return (
      <Modal
        visible={showAISuggestions}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAISuggestions(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View
            animation="slideInUp"
            style={styles.aiSuggestionsModal}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>🍽️ Gợi ý từ AI</Text>
              <TouchableOpacity
                onPress={() => setShowAISuggestions(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <ScrollView style={styles.modalContent}>
              {aiSuggestions.map((suggestion, index) => (
                <Animatable.View
                  key={index}
                  animation="fadeInUp"
                  delay={index * 100}
                  style={styles.aiSuggestionCard}
                >
                  <View style={styles.suggestionHeader}>
                    <Text style={styles.suggestionIcon}>{suggestion.icon}</Text>
                    <View style={styles.suggestionInfo}>
                      <Text style={styles.suggestionTitle}>
                        {suggestion.title}
                      </Text>
                      <Text style={styles.suggestionDescription}>
                        {suggestion.description}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.suggestionNutrition}>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {suggestion.calories}
                      </Text>
                      <Text style={styles.nutritionLabel}>cal</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {suggestion.protein}g
                      </Text>
                      <Text style={styles.nutritionLabel}>protein</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {suggestion.carbs}g
                      </Text>
                      <Text style={styles.nutritionLabel}>carbs</Text>
                    </View>
                    <View style={styles.nutritionItem}>
                      <Text style={styles.nutritionValue}>
                        {suggestion.fat}g
                      </Text>
                      <Text style={styles.nutritionLabel}>fat</Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    style={styles.addMealButton}
                    onPress={async () => {
                      await Haptics.impactAsync(
                        Haptics.ImpactFeedbackStyle.Light
                      );
                      Alert.alert(
                        "Thêm món",
                        `Đã thêm ${suggestion.title} vào kế hoạch!`
                      );
                    }}
                  >
                    <LinearGradient
                      colors={["#4ECDC4", "#45B7D1"]}
                      style={styles.addMealGradient}
                    >
                      <Ionicons
                        name="add-circle-outline"
                        size={20}
                        color="#fff"
                      />
                      <Text style={styles.addMealText}>Thêm vào kế hoạch</Text>
                    </LinearGradient>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </ScrollView>
          </Animatable.View>
        </View>
      </Modal>
    );
  };

  // Render AI Chat Modal
  const renderAIChatModal = () => {
    return (
      <Modal
        visible={showAIChat}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAIChat(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.aiChatModal}>
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.modalHeader}
            >
              <Text style={styles.modalTitle}>🤖 AI Dinh Dưỡng</Text>
              <TouchableOpacity
                onPress={() => setShowAIChat(false)}
                style={styles.modalCloseButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </LinearGradient>

            <FlatList
              data={aiMessages}
              keyExtractor={(item) => item.id}
              style={styles.chatMessages}
              renderItem={({ item, index }) => (
                <Animatable.View
                  animation="fadeInUp"
                  delay={index * 100}
                  style={[
                    styles.messageContainer,
                    item.isAI ? styles.aiMessage : styles.userMessage,
                  ]}
                >
                  {item.isAI && (
                    <View style={styles.aiAvatar}>
                      <Text style={styles.aiAvatarText}>🤖</Text>
                    </View>
                  )}
                  <View
                    style={[
                      styles.messageBubble,
                      item.isAI
                        ? styles.aiMessageBubble
                        : styles.userMessageBubble,
                    ]}
                  >
                    <Text
                      style={[
                        styles.messageText,
                        item.isAI
                          ? styles.aiMessageText
                          : styles.userMessageText,
                      ]}
                    >
                      {item.text}
                    </Text>
                    {item.suggestions && item.suggestions.length > 0 && (
                      <View style={styles.messageSuggestions}>
                        {item.suggestions.map((suggestion, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.suggestionChip}
                            onPress={() => {
                              setAiInput(suggestion);
                            }}
                          >
                            <Text style={styles.suggestionChipText}>
                              {suggestion}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}
                  </View>
                </Animatable.View>
              )}
            />

            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                value={aiInput}
                onChangeText={setAiInput}
                placeholder="Hỏi AI về dinh dưỡng..."
                placeholderTextColor="#999"
                multiline
                returnKeyType="send"
                onSubmitEditing={sendAIMessage}
              />
              <TouchableOpacity
                style={styles.sendButton}
                onPress={sendAIMessage}
                disabled={isAILoading || !aiInput.trim()}
              >
                <LinearGradient
                  colors={
                    isAILoading ? ["#ccc", "#999"] : ["#FF6B6B", "#FF8E53"]
                  }
                  style={styles.sendButtonGradient}
                >
                  <Ionicons
                    name={isAILoading ? "hourglass-outline" : "send"}
                    size={20}
                    color="#fff"
                  />
                </LinearGradient>
              </TouchableOpacity>
            </View>
          </Animatable.View>
        </View>
      </Modal>
    );
  };

  const renderCircularProgress = (
    percentage: number,
    color: string,
    size: number = 80
  ) => {
    const radius = (size - 8) / 2;
    const circumference = 2 * Math.PI * radius;
    const strokeDasharray = circumference;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;

    return (
      <View style={{ width: size, height: size }}>
        <View
          style={[styles.circularProgressBase, { width: size, height: size }]}
        >
          <View
            style={[
              styles.circularProgressFill,
              {
                width: size - 8,
                height: size - 8,
                borderRadius: (size - 8) / 2,
                transform: [{ rotate: `${(percentage / 100) * 360}deg` }],
              },
            ]}
          >
            <LinearGradient
              colors={[color, `${color}80`]}
              style={[
                styles.circularGradient,
                {
                  width: size - 8,
                  height: size - 8,
                  borderRadius: (size - 8) / 2,
                },
              ]}
            />
          </View>
        </View>
      </View>
    );
  };

  const renderNutritionCard = (
    title: string,
    current: number,
    goal: number,
    unit: string,
    color: string,
    icon: string
  ) => {
    const progress = calculateProgress(current, goal);
    const progressColor = getProgressColor(progress);

    return (
      <Animatable.View animation="fadeInUp" style={styles.nutritionCard}>
        <LinearGradient
          colors={[`${color}15`, `${color}05`]}
          style={styles.nutritionCardGradient}
        >
          <View style={styles.nutritionHeader}>
            <View style={styles.nutritionTitleRow}>
              <LinearGradient
                colors={[color, `${color}80`]}
                style={styles.nutritionIcon}
              >
                <Ionicons name={icon as any} size={20} color="#fff" />
              </LinearGradient>
              <Text style={styles.nutritionTitle}>{title}</Text>
            </View>
            <Text style={styles.nutritionValue}>
              {current}/{goal} {unit}
            </Text>
          </View>

          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <LinearGradient
                colors={[progressColor, `${progressColor}80`]}
                style={[styles.progressFill, { width: `${progress}%` }]}
              />
            </View>
            <Text style={[styles.progressText, { color: progressColor }]}>
              {progress.toFixed(0)}%
            </Text>
          </View>
        </LinearGradient>
      </Animatable.View>
    );
  };

  const renderWeeklyChart = () => {
    const maxCalories = Math.max(...weeklyData.map((d) => d.calories));

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={400}
        style={styles.weeklyChart}
      >
        <LinearGradient
          colors={["#fff", "#fafbff"]}
          style={styles.chartGradient}
        >
          <Text style={styles.chartTitle}>📊 Calo trong tuần</Text>
          <View style={styles.chartContainer}>
            {weeklyData.map((day, index) => {
              const height = (day.calories / maxCalories) * 100;
              const isToday = index === new Date().getDay() - 1;

              return (
                <Animatable.View
                  key={day.day}
                  style={styles.chartBar}
                  animation="slideInUp"
                  delay={500 + index * 100}
                >
                  <View style={styles.barContainer}>
                    <LinearGradient
                      colors={
                        isToday
                          ? ["#FF6B6B", "#FF8E53"]
                          : ["#E0E0E0", "#F5F5F5"]
                      }
                      style={[styles.bar, { height: `${height}%` }]}
                    />
                  </View>
                  <Text
                    style={[
                      styles.barLabel,
                      {
                        color: isToday ? "#FF6B6B" : "#666",
                        fontWeight: isToday ? "bold" : "normal",
                      },
                    ]}
                  >
                    {day.day}
                  </Text>
                  <Text style={styles.barValue}>{day.calories}</Text>
                </Animatable.View>
              );
            })}
          </View>
        </LinearGradient>
      </Animatable.View>
    );
  };

  const renderCalorieOverview = () => {
    const calorieProgress = calculateProgress(
      todayNutrition.calories,
      dailyGoal.calories
    );

    return (
      <Animatable.View
        animation="bounceIn"
        delay={200}
        style={styles.todayOverview}
      >
        <LinearGradient
          colors={["#fff", "#fafbff"]}
          style={styles.overviewGradient}
        >
          <View style={styles.calorieSection}>
            <View style={styles.calorieCircleContainer}>
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                style={styles.calorieCircle}
              >
                <Text style={styles.calorieNumber}>
                  {todayNutrition.calories}
                </Text>
                <Text style={styles.calorieLabel}>calories</Text>
                <Text style={styles.calorieGoal}>/ {dailyGoal.calories}</Text>
              </LinearGradient>
              <View style={styles.calorieProgress}>
                <Text style={styles.calorieProgressText}>
                  {calorieProgress.toFixed(0)}%
                </Text>
              </View>
            </View>

            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <LinearGradient
                  colors={["#4ECDC4", "#4ECDC480"]}
                  style={styles.statIcon}
                >
                  <Ionicons name="fitness-outline" size={16} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{todayNutrition.protein}g</Text>
                <Text style={styles.statLabel}>Protein</Text>
              </View>

              <View style={styles.statItem}>
                <LinearGradient
                  colors={["#45B7D1", "#45B7D180"]}
                  style={styles.statIcon}
                >
                  <Ionicons name="flash-outline" size={16} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{todayNutrition.carbs}g</Text>
                <Text style={styles.statLabel}>Carbs</Text>
              </View>

              <View style={styles.statItem}>
                <LinearGradient
                  colors={["#96CEB4", "#96CEB480"]}
                  style={styles.statIcon}
                >
                  <Ionicons name="water-outline" size={16} color="#fff" />
                </LinearGradient>
                <Text style={styles.statValue}>{todayNutrition.fat}g</Text>
                <Text style={styles.statLabel}>Fat</Text>
              </View>
            </View>
          </View>
        </LinearGradient>
      </Animatable.View>
    );
  };

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />

      {/* Header với gradient */}
      <Animatable.View animation="fadeIn" duration={1000}>
        <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.header}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.goBack();
            }}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>

          <Text style={styles.headerTitle}>🥗 Theo dõi dinh dưỡng</Text>

          <View style={styles.headerButtons}>
            <TouchableOpacity style={styles.aiChatBtn} onPress={handleAIChat}>
              <Ionicons
                name="chatbubble-ellipses-outline"
                size={22}
                color="#fff"
              />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.settingsBtn}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert("Cài đặt", "Tính năng đang phát triển");
              }}
            >
              <Ionicons name="settings-outline" size={22} color="#fff" />
            </TouchableOpacity>
          </View>
        </LinearGradient>
      </Animatable.View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B6B"]}
            tintColor="#FF6B6B"
          />
        }
      >
        {/* AI Analysis Section */}
        {renderAIAnalysisSection()}

        {/* Tổng quan hôm nay */}
        <View style={styles.section}>
          <Animatable.Text animation="fadeInLeft" style={styles.sectionTitle}>
            📅 Hôm nay
          </Animatable.Text>
          {renderCalorieOverview()}
        </View>

        {/* Chi tiết dinh dưỡng */}
        <View style={styles.section}>
          <Animatable.Text
            animation="fadeInLeft"
            delay={300}
            style={styles.sectionTitle}
          >
            📈 Chi tiết dinh dưỡng
          </Animatable.Text>

          <Animatable.View animation="fadeInUp" delay={400}>
            {renderNutritionCard(
              "Calories",
              todayNutrition.calories,
              dailyGoal.calories,
              "cal",
              "#FF6B6B",
              "flame-outline"
            )}
            {renderNutritionCard(
              "Protein",
              todayNutrition.protein,
              dailyGoal.protein,
              "g",
              "#4ECDC4",
              "fitness-outline"
            )}
            {renderNutritionCard(
              "Carbs",
              todayNutrition.carbs,
              dailyGoal.carbs,
              "g",
              "#45B7D1",
              "flash-outline"
            )}
            {renderNutritionCard(
              "Fat",
              todayNutrition.fat,
              dailyGoal.fat,
              "g",
              "#96CEB4",
              "water-outline"
            )}
            {renderNutritionCard(
              "Fiber",
              todayNutrition.fiber,
              dailyGoal.fiber,
              "g",
              "#FFEAA7",
              "leaf-outline"
            )}
            {renderNutritionCard(
              "Nước",
              todayNutrition.water,
              dailyGoal.water,
              "ly",
              "#DDA0DD",
              "water"
            )}
          </Animatable.View>
        </View>

        {/* Biểu đồ tuần */}
        <View style={styles.section}>{renderWeeklyChart()}</View>

        {/* Bữa ăn gần đây */}
        <View style={styles.section}>
          <Animatable.View
            animation="fadeInLeft"
            delay={600}
            style={styles.sectionHeader}
          >
            <Text style={styles.sectionTitle}>🍽️ Bữa ăn gần đây</Text>
            <TouchableOpacity
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                Alert.alert("Thông báo", "Tính năng đang phát triển");
              }}
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </Animatable.View>

          {recentMeals.map((meal, index) => (
            <Animatable.View
              key={meal.id}
              animation="fadeInUp"
              delay={700 + index * 100}
            >
              <TouchableOpacity
                style={styles.mealItem}
                onPress={() => handleMealPress(meal)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={["#fff", "#fafbff"]}
                  style={styles.mealGradient}
                >
                  <View style={styles.mealInfo}>
                    <View style={styles.mealEmojiContainer}>
                      <Text style={styles.mealEmoji}>{meal.image}</Text>
                    </View>
                    <View style={styles.mealDetails}>
                      <Text style={styles.mealName}>{meal.name}</Text>
                      <Text style={styles.mealTime}>🕐 {meal.time}</Text>
                    </View>
                  </View>
                  <View style={styles.mealNutrition}>
                    <LinearGradient
                      colors={["#FF6B6B", "#FF8E53"]}
                      style={styles.calorieTag}
                    >
                      <Text style={styles.mealCalories}>{meal.calories}</Text>
                      <Text style={styles.calorieUnit}>cal</Text>
                    </LinearGradient>
                    <Text style={styles.mealMacros}>
                      P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                    </Text>
                  </View>
                </LinearGradient>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </View>

        <View style={styles.bottomSpacer} />
      </ScrollView>

      {/* AI Chat Modal */}
      {renderAIChatModal()}

      {/* AI Suggestions Modal */}
      {renderAISuggestionsModal()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 35,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: "center",
    position: "relative",
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerButtons: {
    position: "absolute",
    top: 50,
    right: 20,
    flexDirection: "row",
    zIndex: 2,
  },
  aiChatBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 10,
    marginRight: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  settingsBtn: {
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 10,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 25,
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
    marginLeft: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  seeAllText: {
    color: "#FF6B6B",
    fontSize: 16,
    fontWeight: "600",
  },

  // AI Analysis Section
  aiAnalysisSection: {
    marginBottom: 30,
  },
  aiButtonsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  aiAnalysisButton: {
    width: (width - 50) / 2,
    marginBottom: 15,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 6,
  },
  aiButtonGradient: {
    padding: 20,
    alignItems: "center",
    minHeight: 110,
    justifyContent: "center",
  },
  aiButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginTop: 8,
    textAlign: "center",
  },
  aiButtonSubtext: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 11,
    marginTop: 4,
    textAlign: "center",
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  aiChatModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    height: "80%",
    overflow: "hidden",
  },
  aiSuggestionsModal: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    maxHeight: "70%",
    overflow: "hidden",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  modalTitle: {
    color: "#fff",
    fontSize: 20,
    fontWeight: "bold",
  },
  modalCloseButton: {
    padding: 5,
  },
  modalContent: {
    padding: 20,
  },

  // AI Suggestions Styles
  aiSuggestionCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.1)",
  },
  suggestionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  suggestionIcon: {
    fontSize: 32,
    marginRight: 15,
  },
  suggestionInfo: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  suggestionDescription: {
    fontSize: 14,
    color: "#666",
  },
  suggestionNutrition: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 15,
    paddingVertical: 10,
    backgroundColor: "rgba(255,107,107,0.05)",
    borderRadius: 15,
  },
  nutritionItem: {
    alignItems: "center",
  },
  nutritionValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  nutritionLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  addMealButton: {
    borderRadius: 15,
    overflow: "hidden",
  },
  addMealGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 20,
  },
  addMealText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
    marginLeft: 8,
  },

  // Chat Styles
  chatMessages: {
    flex: 1,
    padding: 20,
  },
  messageContainer: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "flex-start",
  },
  aiMessage: {
    justifyContent: "flex-start",
  },
  userMessage: {
    justifyContent: "flex-end",
    flexDirection: "row-reverse",
  },
  aiAvatar: {
    width: 35,
    height: 35,
    borderRadius: 17,
    backgroundColor: "#FF6B6B",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
  },
  aiAvatarText: {
    fontSize: 18,
  },
  messageBubble: {
    maxWidth: "80%",
    borderRadius: 20,
    padding: 15,
  },
  aiMessageBubble: {
    backgroundColor: "#f0f0f0",
    borderBottomLeftRadius: 5,
  },
  userMessageBubble: {
    backgroundColor: "#FF6B6B",
    borderBottomRightRadius: 5,
  },
  messageText: {
    fontSize: 15,
    lineHeight: 22,
  },
  aiMessageText: {
    color: "#333",
  },
  userMessageText: {
    color: "#fff",
  },
  messageSuggestions: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
  },
  suggestionChip: {
    backgroundColor: "rgba(255,107,107,0.1)",
    borderRadius: 15,
    paddingHorizontal: 12,
    paddingVertical: 6,
    marginRight: 8,
    marginBottom: 5,
  },
  suggestionChipText: {
    color: "#FF6B6B",
    fontSize: 12,
    fontWeight: "500",
  },
  chatInputContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#eee",
    backgroundColor: "#fff",
  },
  chatInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    maxHeight: 100,
    marginRight: 10,
    fontSize: 15,
  },
  sendButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  sendButtonGradient: {
    width: 50,
    height: 50,
    borderRadius: 25,
    alignItems: "center",
    justifyContent: "center",
  },

  todayOverview: {
    borderRadius: 25,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
  },
  overviewGradient: {
    padding: 25,
  },
  calorieSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  calorieCircleContainer: {
    alignItems: "center",
    marginRight: 25,
  },
  calorieCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  calorieNumber: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#fff",
  },
  calorieLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
    marginTop: 2,
  },
  calorieGoal: {
    fontSize: 11,
    color: "rgba(255,255,255,0.7)",
  },
  calorieProgress: {
    marginTop: 12,
  },
  calorieProgressText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  quickStats: {
    flex: 1,
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
    marginBottom: 15,
  },
  statIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 13,
    color: "#666",
    fontWeight: "500",
  },
  nutritionCard: {
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  nutritionCardGradient: {
    padding: 20,
  },
  nutritionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  nutritionTitleRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  nutritionIcon: {
    width: 35,
    height: 35,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  nutritionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  nutritionValue: {
    fontSize: 16,
    color: "#666",
    fontWeight: "500",
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  progressBar: {
    flex: 1,
    height: 12,
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 6,
    marginRight: 15,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    borderRadius: 6,
  },
  progressText: {
    fontSize: 16,
    fontWeight: "600",
  },
  weeklyChart: {
    borderRadius: 25,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  chartGradient: {
    padding: 25,
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 20,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 140,
    paddingHorizontal: 5,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 3,
  },
  barContainer: {
    width: 25,
    height: 100,
    justifyContent: "flex-end",
    marginBottom: 12,
  },
  bar: {
    width: 25,
    borderRadius: 12,
    minHeight: 20,
  },
  barLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 6,
  },
  barValue: {
    fontSize: 11,
    color: "#666",
    fontWeight: "500",
  },
  mealItem: {
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    overflow: "hidden",
  },
  mealGradient: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
  },
  mealInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mealEmojiContainer: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "rgba(255,107,107,0.1)",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 15,
  },
  mealEmoji: {
    fontSize: 28,
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 17,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  mealTime: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  mealNutrition: {
    alignItems: "flex-end",
  },
  calorieTag: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    marginBottom: 6,
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#fff",
    marginRight: 2,
  },
  calorieUnit: {
    fontSize: 12,
    color: "rgba(255,255,255,0.9)",
  },
  mealMacros: {
    fontSize: 12,
    color: "#666",
    fontWeight: "500",
  },
  circularProgressBase: {
    backgroundColor: "rgba(0,0,0,0.1)",
    borderRadius: 50,
    position: "relative",
    alignItems: "center",
    justifyContent: "center",
  },
  circularProgressFill: {
    position: "absolute",
  },
  circularGradient: {
    position: "absolute",
  },
  bottomSpacer: {
    height: 30,
  },
});
