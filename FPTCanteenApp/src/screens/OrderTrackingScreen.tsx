import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { getOrders, cancelOrder, Order, OrderStatus } from "../api/orderApi";

const { width } = Dimensions.get("window");

const statusConfig: Record<OrderStatus, { label: string; color: string; bgColor: string; icon: string }> = {
  preparing: {
    label: "Đang chuẩn bị",
    color: "#F39C12",
    bgColor: "#FEF9E7",
    icon: "restaurant-outline"
  },
  delivering: {
    label: "Đang giao",
    color: "#3498DB",
    bgColor: "#EBF5FB",
    icon: "bicycle-outline"
  },
  delivered: {
    label: "Đã giao",
    color: "#27AE60",
    bgColor: "#E8F8F5",
    icon: "checkmark-circle-outline"
  },
  cancelled: {
    label: "Đã hủy",
    color: "#E74C3C",
    bgColor: "#FDEDEC",
    icon: "close-circle-outline"
  },
};

export default function OrderTrackingScreen({ navigation }: any) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<OrderStatus | "all">("all");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedFilter]);

  const loadOrders = async () => {
    try {
      const data = await getOrders("user123");
      setOrders(data);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filterOrders = () => {
    let filtered = orders;

    if (searchQuery) {
      filtered = filtered.filter(order =>
        order.foodName.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter(order => order.status === selectedFilter);
    }

    setFilteredOrders(filtered);
  };

  const handleCancel = async (id: string, foodName: string) => {
    Alert.alert(
      "Xác nhận hủy đơn",
      `Bạn có chắc chắn muốn hủy đơn hàng "${foodName}"?`,
      [
        { text: "Không", style: "cancel" },
        {
          text: "Hủy đơn",
          style: "destructive",
          onPress: async () => {
            setCancellingId(id);
            try {
              await cancelOrder(id);
              setOrders((prev) =>
                prev.map((order) =>
                  order.id === id
                    ? { ...order, status: "cancelled", canEdit: false }
                    : order
                )
              );
              Alert.alert("Thành công", "Đơn hàng đã được hủy");
            } catch (error) {
              Alert.alert("Lỗi", "Không thể hủy đơn hàng");
            } finally {
              setCancellingId(null);
            }
          }
        }
      ]
    );
  };

  const getProgressSteps = (status: OrderStatus) => {
    const steps = ["preparing", "delivering", "delivered"];
    const currentIndex = steps.indexOf(status);
    return steps.map((step, index) => ({
      step,
      completed: index <= currentIndex,
      active: index === currentIndex
    }));
  };

  const renderFilterButton = (filter: OrderStatus | "all", label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderProgressBar = (status: OrderStatus) => {
    if (status === "cancelled") return null;
    
    const steps = getProgressSteps(status);
    
    return (
      <View style={styles.progressContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.step}>
            <View style={styles.progressStep}>
              <View
                style={[
                  styles.progressDot,
                  step.completed && styles.progressDotCompleted,
                  step.active && styles.progressDotActive
                ]}
              >
                {step.completed && (
                  <Ionicons name="checkmark" size={12} color="#fff" />
                )}
              </View>
              <Text style={[
                styles.progressLabel,
                step.completed && styles.progressLabelCompleted
              ]}>
                {statusConfig[step.step as OrderStatus].label}
              </Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.progressLine,
                step.completed && styles.progressLineCompleted
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>
    );
  };

  const renderOrderCard = ({ item }: { item: Order }) => {
    const config = statusConfig[item.status];
    
    return (
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.foodName}>{item.foodName}</Text>
            <Text style={styles.orderId}>#{item.id.slice(-6).toUpperCase()}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: config.bgColor }]}>
            <Ionicons name={config.icon as any} size={16} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.cardBody}>
          <View style={styles.priceContainer}>
            <Text style={styles.priceLabel}>Tổng tiền:</Text>
            <Text style={styles.price}>{item.total.toLocaleString()}đ</Text>
          </View>
          
          {item.orderTime && (
            <View style={styles.timeContainer}>
              <Ionicons name="time-outline" size={16} color="#7f8c8d" />
              <Text style={styles.timeText}>
                {new Date(item.orderTime).toLocaleString("vi-VN")}
              </Text>
            </View>
          )}

          {renderProgressBar(item.status)}
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() =>
              navigation.navigate("OrderDetail", { orderId: item.id })
            }
          >
            <Ionicons name="eye-outline" size={18} color="#667eea" />
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>

          {item.canEdit && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                cancellingId === item.id && styles.cancelButtonDisabled
              ]}
              onPress={() => handleCancel(item.id, item.foodName)}
              disabled={cancellingId === item.id}
            >
              {cancellingId === item.id ? (
                <ActivityIndicator size="small" color="#E74C3C" />
              ) : (
                <Ionicons name="close-outline" size={18} color="#E74C3C" />
              )}
              <Text
                style={[
                  styles.cancelButtonText,
                  cancellingId === item.id && styles.cancelButtonTextDisabled
                ]}
              >
                {cancellingId === item.id ? "Đang hủy..." : "Hủy đơn"}
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <Ionicons name="receipt-outline" size={80} color="#bdc3c7" />
      <Text style={styles.emptyStateTitle}>Chưa có đơn hàng nào</Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedFilter !== "all"
          ? "Không tìm thấy đơn hàng phù hợp"
          : "Hãy đặt món ăn yêu thích của bạn!"}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Đơn hàng của bạn</Text>
        <Text style={styles.subtitle}>Căng tin Đại học</Text>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={20} color="#7f8c8d" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm món ăn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#bdc3c7"
        />
      </View>

      <View style={styles.filterContainer}>
        {renderFilterButton("all", "Tất cả")}
        {renderFilterButton("preparing", "Đang chuẩn bị")}
        {renderFilterButton("delivering", "Đang giao")}
        {renderFilterButton("delivered", "Đã giao")}
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#667eea"]}
            tintColor="#667eea"
          />
        }
        ListEmptyComponent={renderEmptyState}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    marginHorizontal: 16,
    marginTop: 16,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchIcon: {
    marginRight: 12,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2c3e50",
  },
  filterContainer: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#ecf0f1",
    marginRight: 8,
  },
  filterButtonActive: {
    backgroundColor: "#667eea",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    padding: 16,
    paddingBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  orderId: {
    fontSize: 14,
    color: "#7f8c8d",
    fontFamily: "monospace",
  },
  statusBadge: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 4,
  },
  cardBody: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  priceContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 12,
  },
  priceLabel: {
    fontSize: 16,
    color: "#7f8c8d",
  },
  price: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667eea",
  },
  timeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  timeText: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 6,
  },
  progressContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 8,
  },
  progressStep: {
    alignItems: "center",
    flex: 1,
  },
  progressDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#ecf0f1",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 6,
  },
  progressDotCompleted: {
    backgroundColor: "#27AE60",
  },
  progressDotActive: {
    backgroundColor: "#3498DB",
  },
  progressLabel: {
    fontSize: 12,
    color: "#bdc3c7",
    textAlign: "center",
  },
  progressLabelCompleted: {
    color: "#27AE60",
    fontWeight: "600",
  },
  progressLine: {
    height: 2,
    backgroundColor: "#ecf0f1",
    flex: 1,
    marginHorizontal: 8,
    marginTop: -12,
  },
  progressLineCompleted: {
    backgroundColor: "#27AE60",
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#ecf0f1",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  detailButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 8,
  },
  detailButtonText: {
    color: "#667eea",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  cancelButton: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    justifyContent: "center",
    paddingVertical: 8,
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: "#E74C3C",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  cancelButtonTextDisabled: {
    color: "#aaa",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: "#7f8c8d",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#7f8c8d",
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#bdc3c7",
    textAlign: "center",
    paddingHorizontal: 40,
  },
});