import { Ionicons } from "@expo/vector-icons";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Dimensions,
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { userOrderApi } from '../api/userOrderApi';

const { width } = Dimensions.get("window");

// Mock data for demo
const mockOrders = [
  {
    _id: "1",
    orderNumber: "ORDER-001",
    items: [
      {
        product: {
          name: "Cơm sườn nướng mật ong",
          price: 30000,
        },
        quantity: 2,
        price: 30000,
        total: 60000,
      },
    ],
    status: "preparing",
    totalAmount: 60000,
    finalAmount: 51000,
    paymentMethod: "cash",
    deliveryMethod: "pickup",
    createdAt: "2024-01-15T10:30:00Z",
  },
  {
    _id: "2",
    orderNumber: "ORDER-002",
    items: [
      {
        product: {
          name: "Bún chay đặc biệt",
          price: 30000,
        },
        quantity: 1,
        price: 30000,
        total: 30000,
      },
    ],
    status: "ready",
    totalAmount: 30000,
    finalAmount: 27000,
    paymentMethod: "momo",
    deliveryMethod: "delivery",
    createdAt: "2024-01-15T09:15:00Z",
  },
];

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    color: "#F39C12",
    bgColor: "#FEF9E7",
    icon: "time-outline",
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "#3498DB",
    bgColor: "#EBF5FB",
    icon: "checkmark-circle-outline",
  },
  preparing: {
    label: "Đang chuẩn bị",
    color: "#F39C12",
    bgColor: "#FEF9E7",
    icon: "restaurant-outline",
  },
  ready: {
    label: "Sẵn sàng",
    color: "#27AE60",
    bgColor: "#E8F8F5",
    icon: "checkmark-circle-outline",
  },
  delivered: {
    label: "Đã giao",
    color: "#27AE60",
    bgColor: "#E8F8F5",
    icon: "checkmark-circle-outline",
  },
  cancelled: {
    label: "Đã hủy",
    color: "#E74C3C",
    bgColor: "#FDEDEC",
    icon: "close-circle-outline",
  },
};

export default function OrderTrackingScreen({ navigation }: any) {
  const [orders, setOrders] = useState(mockOrders);
  const [filteredOrders, setFilteredOrders] = useState(mockOrders);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [cancellingId, setCancellingId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedFilter, setSelectedFilter] = useState<string>("all");

  useEffect(() => {
    loadOrders();
  }, []);

  useEffect(() => {
    filterOrders();
  }, [orders, searchQuery, selectedFilter]);

  const loadOrders = async () => {
    setLoading(true);
    try {
      console.log('🔄 Loading user orders...');
      const response = await userOrderApi.getUserOrders();
      console.log('📥 Orders response:', response);
      
      if (response.success && response.orders) {
        setOrders(response.orders);
        console.log('✅ Loaded orders:', response.orders.length);
      } else {
        console.log('⚠️ Using mock data as fallback');
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      setOrders(mockOrders);
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
      filtered = filtered.filter((order) =>
        order.items[0]?.product?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        order.orderNumber?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (selectedFilter !== "all") {
      filtered = filtered.filter((order) => order.status === selectedFilter);
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
              console.log('🔄 Cancelling order:', id);
              const response = await userOrderApi.cancelOrder(id);
              
              if (response.success) {
                // Update local state
                setOrders((prev) =>
                  prev.map((order) =>
                    order._id === id
                      ? { ...order, status: "cancelled" }
                      : order
                  )
                );
                Alert.alert("Thành công", "Đơn hàng đã được hủy");
              } else {
                throw new Error('Cancel failed');
              }
            } catch (error) {
              console.error('❌ Cancel order error:', error);
              Alert.alert("Lỗi", "Không thể hủy đơn hàng");
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const renderFilterButton = (filter: string, label: string) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        selectedFilter === filter && styles.filterButtonActive,
      ]}
      onPress={() => setSelectedFilter(filter)}
    >
      <Text
        style={[
          styles.filterButtonText,
          selectedFilter === filter && styles.filterButtonTextActive,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOrderCard = ({ item }: { item: any }) => {
    const config = statusConfig[item.status as keyof typeof statusConfig];

    return (
      <View style={styles.orderCard}>
        <View style={styles.orderHeader}>
          <View style={styles.orderInfo}>
            <Text style={styles.orderNumber}>{item.orderNumber}</Text>
            <Text style={styles.orderDate}>
              {new Date(item.createdAt).toLocaleDateString("vi-VN")}
            </Text>
          </View>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: config.bgColor },
            ]}
          >
            <Ionicons name={config.icon as any} size={16} color={config.color} />
            <Text style={[styles.statusText, { color: config.color }]}>
              {config.label}
            </Text>
          </View>
        </View>

        <View style={styles.orderDetails}>
          <Text style={styles.foodName}>
            {item.items[0]?.product?.name || "Món ăn"}
          </Text>
          <Text style={styles.quantity}>
            Số lượng: {item.items[0]?.quantity || 1}
          </Text>
          <Text style={styles.total}>
            Tổng: {item.finalAmount?.toLocaleString()}đ
          </Text>
        </View>

        <View style={styles.cardActions}>
          <TouchableOpacity
            style={styles.detailButton}
            onPress={() =>
              navigation.navigate("OrderDetail", { orderId: item._id })
            }
          >
            <Ionicons name="eye-outline" size={18} color="#667eea" />
            <Text style={styles.detailButtonText}>Xem chi tiết</Text>
          </TouchableOpacity>

          {item.status !== "cancelled" && item.status !== "delivered" && (
            <TouchableOpacity
              style={[
                styles.cancelButton,
                cancellingId === item._id && styles.cancelButtonDisabled,
              ]}
              onPress={() => handleCancel(item._id, item.items[0]?.product?.name || "Món ăn")}
              disabled={cancellingId === item._id}
            >
              {cancellingId === item._id ? (
                <ActivityIndicator size="small" color="#E74C3C" />
              ) : (
                <Ionicons name="close-outline" size={18} color="#E74C3C" />
              )}
              <Text
                style={[
                  styles.cancelButtonText,
                  cancellingId === item._id && styles.cancelButtonTextDisabled,
                ]}
              >
                {cancellingId === item._id ? "Đang hủy..." : "Hủy đơn"}
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
          disabled={refreshing}
        >
          <Ionicons
            name="refresh"
            size={24}
            color={refreshing ? "#bdc3c7" : "#667eea"}
          />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm đơn hàng..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        {renderFilterButton("all", "Tất cả")}
        {renderFilterButton("preparing", "Đang chuẩn bị")}
        {renderFilterButton("ready", "Sẵn sàng")}
        {renderFilterButton("delivered", "Đã giao")}
      </View>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
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
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 16,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ecf0f1",
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: "#2c3e50",
  },
  refreshButton: {
    padding: 8,
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
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
    overflow: "hidden",
  },
  orderHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 16,
    paddingBottom: 12,
  },
  orderInfo: {
    flex: 1,
  },
  orderNumber: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  orderDate: {
    fontSize: 14,
    color: "#7f8c8d",
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
  orderDetails: {
    paddingHorizontal: 16,
    paddingBottom: 16,
  },
  foodName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  quantity: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  total: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#667eea",
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
