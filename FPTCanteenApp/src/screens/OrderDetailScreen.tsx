import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
} from "react-native";
import { getOrderDetail, Order, OrderStatus } from "../api/orderApi";

const statusLabel: Record<OrderStatus, string> = {
  processing: "Đang chuẩn bị",
  shipped: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export default function OrderDetailScreen({ route, navigation }: any) {
  const { orderId } = route.params;
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getOrderDetail(orderId).then((data) => {
      setOrder(data || null);
      setLoading(false);
    });
  }, [orderId]);

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;
  if (!order)
    return <Text style={{ margin: 32 }}>Không tìm thấy đơn hàng.</Text>;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chi tiết đơn hàng</Text>
      <View style={styles.card}>
        <Text style={styles.label}>Món ăn:</Text>
        <Text style={styles.value}>{order.foodName}</Text>
        <Text style={styles.label}>Tổng tiền:</Text>
        <Text style={styles.value}>{order.total.toLocaleString()}đ</Text>
        <Text style={styles.label}>Trạng thái:</Text>
        <Text
          style={[
            styles.value,
            {
              color:
                order.status === "cancelled"
                  ? "#E74C3C"
                  : order.status === "delivered"
                  ? "#4CAF50"
                  : "#667eea",
            },
          ]}
        >
          {statusLabel[order.status]}
        </Text>
        <Text style={styles.label}>Thời gian đặt:</Text>
        <Text style={styles.value}>
          {new Date(order.createdAt).toLocaleString()}
        </Text>
      </View>
      <TouchableOpacity
        style={styles.backBtn}
        onPress={() => navigation.goBack()}
      >
        <Text style={styles.backBtnText}>Quay lại</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 20 },
  title: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  label: { fontSize: 15, color: "#7f8c8d", marginTop: 10 },
  value: { fontSize: 17, color: "#2c3e50", fontWeight: "500", marginTop: 2 },
  backBtn: {
    backgroundColor: "#667eea",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  backBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
