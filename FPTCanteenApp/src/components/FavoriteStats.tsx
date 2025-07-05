import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface FavoriteStatsProps {
  totalFavorites: number;
  mostOrdered: string;
  totalSpent: number;
  averageRating: number;
}

export default function FavoriteStats({
  totalFavorites,
  mostOrdered,
  totalSpent,
  averageRating,
}: FavoriteStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê món yêu thích</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="heart" size={24} color="#E91E63" />
          </View>
          <Text style={styles.statNumber}>{totalFavorites}</Text>
          <Text style={styles.statLabel}>Món yêu thích</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="star" size={24} color="#FFD700" />
          </View>
          <Text style={styles.statNumber}>{averageRating.toFixed(1)}</Text>
          <Text style={styles.statLabel}>Đánh giá TB</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="wallet" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statNumber}>{formatCurrency(totalSpent)}</Text>
          <Text style={styles.statLabel}>Tổng chi tiêu</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trophy" size={24} color="#FF9800" />
          </View>
          <Text style={styles.statNumber} numberOfLines={1}>
            {mostOrdered}
          </Text>
          <Text style={styles.statLabel}>Món đặt nhiều nhất</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    margin: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 16,
    color: "#333",
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  statCard: {
    width: "48%",
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  statIcon: {
    marginBottom: 8,
  },
  statNumber: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
    textAlign: "center",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
});
