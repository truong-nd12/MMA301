import React from "react";
import { View, Text, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";

interface WalletStatsProps {
  totalSpent: number;
  totalDeposited: number;
  totalWithdrawn: number;
  transactionCount: number;
}

export default function WalletStats({
  totalSpent,
  totalDeposited,
  totalWithdrawn,
  transactionCount,
}: WalletStatsProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Thống kê ví điện tử</Text>

      <View style={styles.statsGrid}>
        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trending-up" size={24} color="#4CAF50" />
          </View>
          <Text style={styles.statNumber}>
            {formatCurrency(totalDeposited)}
          </Text>
          <Text style={styles.statLabel}>Tổng nạp</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="trending-down" size={24} color="#F44336" />
          </View>
          <Text style={styles.statNumber}>{formatCurrency(totalSpent)}</Text>
          <Text style={styles.statLabel}>Tổng chi tiêu</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="remove-circle" size={24} color="#FF9800" />
          </View>
          <Text style={styles.statNumber}>
            {formatCurrency(totalWithdrawn)}
          </Text>
          <Text style={styles.statLabel}>Tổng rút</Text>
        </View>

        <View style={styles.statCard}>
          <View style={styles.statIcon}>
            <Ionicons name="list" size={24} color="#2196F3" />
          </View>
          <Text style={styles.statNumber}>{transactionCount}</Text>
          <Text style={styles.statLabel}>Giao dịch</Text>
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
    fontSize: 14,
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
