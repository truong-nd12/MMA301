import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function NutritionScreen({ navigation }: any) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyGoal] = useState({
    calories: 2000,
    protein: 60,
    carbs: 250,
    fat: 65,
    fiber: 25,
  });

  const [todayNutrition] = useState({
    calories: 1450,
    protein: 45,
    carbs: 180,
    fat: 52,
    fiber: 18,
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

  const calculateProgress = (current: number, goal: number) => {
    return Math.min((current / goal) * 100, 100);
  };

  const getProgressColor = (progress: number) => {
    if (progress >= 90) return "#4CAF50";
    if (progress >= 70) return "#FF9800";
    return "#F44336";
  };

  const renderNutritionCard = (
    title: string,
    current: number,
    goal: number,
    unit: string,
    color: string
  ) => {
    const progress = calculateProgress(current, goal);
    const progressColor = getProgressColor(progress);

    return (
      <View style={styles.nutritionCard}>
        <View style={styles.nutritionHeader}>
          <Text style={styles.nutritionTitle}>{title}</Text>
          <Text style={styles.nutritionValue}>
            {current}/{goal} {unit}
          </Text>
        </View>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${progress}%`, backgroundColor: progressColor },
            ]}
          />
        </View>
        <Text style={styles.progressText}>{progress.toFixed(0)}%</Text>
      </View>
    );
  };

  const renderWeeklyChart = () => {
    return (
      <View style={styles.weeklyChart}>
        <Text style={styles.chartTitle}>Calo trong tuần</Text>
        <View style={styles.chartContainer}>
          {weeklyData.map((day, index) => {
            const height = (day.calories / 2500) * 100;
            const isToday = index === new Date().getDay() - 1;

            return (
              <View key={day.day} style={styles.chartBar}>
                <View
                  style={[
                    styles.bar,
                    {
                      height: `${height}%`,
                      backgroundColor: isToday ? "#667eea" : "#e0e0e0",
                    },
                  ]}
                />
                <Text
                  style={[
                    styles.barLabel,
                    { color: isToday ? "#667eea" : "#666" },
                  ]}
                >
                  {day.day}
                </Text>
                <Text style={styles.barValue}>{day.calories}</Text>
              </View>
            );
          })}
        </View>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Theo dõi dinh dưỡng</Text>
        <TouchableOpacity style={styles.settingsBtn}>
          <Ionicons name="settings-outline" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Tổng quan hôm nay */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hôm nay</Text>
          <View style={styles.todayOverview}>
            <View style={styles.calorieCircle}>
              <Text style={styles.calorieNumber}>
                {todayNutrition.calories}
              </Text>
              <Text style={styles.calorieLabel}>calories</Text>
              <Text style={styles.calorieGoal}>/ {dailyGoal.calories}</Text>
            </View>
            <View style={styles.quickStats}>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todayNutrition.protein}g</Text>
                <Text style={styles.statLabel}>Protein</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todayNutrition.carbs}g</Text>
                <Text style={styles.statLabel}>Carbs</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statValue}>{todayNutrition.fat}g</Text>
                <Text style={styles.statLabel}>Fat</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Chi tiết dinh dưỡng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Chi tiết dinh dưỡng</Text>
          {renderNutritionCard(
            "Calories",
            todayNutrition.calories,
            dailyGoal.calories,
            "cal",
            "#FF6B6B"
          )}
          {renderNutritionCard(
            "Protein",
            todayNutrition.protein,
            dailyGoal.protein,
            "g",
            "#4ECDC4"
          )}
          {renderNutritionCard(
            "Carbs",
            todayNutrition.carbs,
            dailyGoal.carbs,
            "g",
            "#45B7D1"
          )}
          {renderNutritionCard(
            "Fat",
            todayNutrition.fat,
            dailyGoal.fat,
            "g",
            "#96CEB4"
          )}
          {renderNutritionCard(
            "Fiber",
            todayNutrition.fiber,
            dailyGoal.fiber,
            "g",
            "#FFEAA7"
          )}
        </View>

        {/* Biểu đồ tuần */}
        <View style={styles.section}>{renderWeeklyChart()}</View>

        {/* Bữa ăn gần đây */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Bữa ăn gần đây</Text>
            <TouchableOpacity
              onPress={() =>
                Alert.alert("Thông báo", "Tính năng đang phát triển")
              }
            >
              <Text style={styles.seeAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {recentMeals.map((meal) => (
            <View key={meal.id} style={styles.mealItem}>
              <View style={styles.mealInfo}>
                <Text style={styles.mealEmoji}>{meal.image}</Text>
                <View style={styles.mealDetails}>
                  <Text style={styles.mealName}>{meal.name}</Text>
                  <Text style={styles.mealTime}>{meal.time}</Text>
                </View>
              </View>
              <View style={styles.mealNutrition}>
                <Text style={styles.mealCalories}>{meal.calories} cal</Text>
                <Text style={styles.mealMacros}>
                  P: {meal.protein}g • C: {meal.carbs}g • F: {meal.fat}g
                </Text>
              </View>
            </View>
          ))}
        </View>

        {/* Gợi ý dinh dưỡng */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Gợi ý hôm nay</Text>
          <View style={styles.suggestionCard}>
            <Ionicons name="bulb-outline" size={24} color="#667eea" />
            <View style={styles.suggestionContent}>
              <Text style={styles.suggestionTitle}>Bổ sung protein</Text>
              <Text style={styles.suggestionText}>
                Bạn cần thêm {dailyGoal.protein - todayNutrition.protein}g
                protein. Thử món gà nướng hoặc cá hồi nhé!
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  aiChatBtn: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  settingsBtn: {
    position: "absolute",
    top: 50,
    right: 60,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  seeAllText: {
    color: "#667eea",
    fontSize: 14,
    fontWeight: "500",
  },
  todayOverview: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  calorieCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#667eea22",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 20,
  },
  calorieNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#667eea",
  },
  calorieLabel: {
    fontSize: 12,
    color: "#666",
  },
  calorieGoal: {
    fontSize: 10,
    color: "#999",
  },
  quickStats: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-around",
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    marginTop: 2,
  },
  nutritionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  nutritionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
  },
  nutritionTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  nutritionValue: {
    fontSize: 14,
    color: "#666",
  },
  progressBar: {
    height: 8,
    backgroundColor: "#f0f0f0",
    borderRadius: 4,
    marginBottom: 4,
  },
  progressFill: {
    height: "100%",
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: "#666",
    textAlign: "right",
  },
  weeklyChart: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  chartContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    height: 120,
  },
  chartBar: {
    flex: 1,
    alignItems: "center",
    marginHorizontal: 2,
  },
  bar: {
    width: 20,
    borderRadius: 10,
    marginBottom: 8,
  },
  barLabel: {
    fontSize: 12,
    fontWeight: "500",
    marginBottom: 4,
  },
  barValue: {
    fontSize: 10,
    color: "#666",
  },
  mealItem: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  mealInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  mealEmoji: {
    fontSize: 32,
    marginRight: 12,
  },
  mealDetails: {
    flex: 1,
  },
  mealName: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  mealTime: {
    fontSize: 12,
    color: "#666",
  },
  mealNutrition: {
    alignItems: "flex-end",
  },
  mealCalories: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
    marginBottom: 2,
  },
  mealMacros: {
    fontSize: 11,
    color: "#666",
  },
  suggestionCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    flexDirection: "row",
    alignItems: "flex-start",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  suggestionContent: {
    flex: 1,
    marginLeft: 12,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: "#666",
    lineHeight: 20,
  },
});
