import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { getOrders, cancelOrder, Order, OrderStatus } from "../api/orderApi";

const statusLabel: Record<OrderStatus, string> = {
  preparing: "Đang chuẩn bị",
  delivering: "Đang giao",
  delivered: "Đã giao",
  cancelled: "Đã hủy",
};

export default function OrderTrackingScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  useEffect(() => {
    getOrders("user123").then((data) => {
      setOrders(data);
      setLoading(false);
    });
  }, []);

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    await cancelOrder(id);
    setOrders((prev) =>
      prev.map((order) =>
        order.id === id
          ? { ...order, status: "cancelled", canEdit: false }
          : order
      )
    );
    setCancellingId(null);
  };

  if (loading) return <ActivityIndicator style={{ marginTop: 40 }} />;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Đơn hàng của bạn</Text>
      <FlatList
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <Text style={styles.foodName}>{item.foodName}</Text>
            <Text style={styles.total}>{item.total.toLocaleString()}đ</Text>
            <Text style={styles.status}>{statusLabel[item.status]}</Text>
            <View style={styles.actions}>
              <TouchableOpacity
                style={styles.detailBtn}
                onPress={() =>
                  navigation.navigate("OrderDetail", { orderId: item.id })
                }
              >
                <Text style={{ color: "#667eea" }}>Xem chi tiết</Text>
              </TouchableOpacity>
              {item.canEdit && (
                <TouchableOpacity
                  style={styles.cancelBtn}
                  onPress={() => handleCancel(item.id)}
                  disabled={cancellingId === item.id}
                >
                  <Text
                    style={{
                      color: cancellingId === item.id ? "#aaa" : "#E74C3C",
                    }}
                  >
                    {cancellingId === item.id ? "Đang hủy..." : "Hủy đơn"}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginBottom: 16 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  foodName: { fontSize: 18, fontWeight: "600" },
  total: { fontSize: 16, color: "#667eea", marginVertical: 4 },
  status: { fontSize: 15, color: "#7f8c8d", marginBottom: 8 },
  actions: { flexDirection: "row" },
  detailBtn: { marginRight: 16 },
  cancelBtn: {},
});
