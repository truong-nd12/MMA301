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
  ScrollView,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { userOrderApi } from "../api/userOrderApi";

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
    estimatedTime: "15 phút",
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
    estimatedTime: "Sẵn sàng",
  },
  {
    _id: "3",
    orderNumber: "ORDER-003",
    items: [
      {
        product: {
          name: "Phở bò đặc biệt",
          price: 45000,
        },
        quantity: 1,
        price: 45000,
        total: 45000,
      },
    ],
    status: "delivered",
    totalAmount: 45000,
    finalAmount: 45000,
    paymentMethod: "momo",
    deliveryMethod: "delivery",
    createdAt: "2024-01-15T08:30:00Z",
    estimatedTime: "Đã giao",
  },
];

const statusConfig = {
  pending: {
    label: "Chờ xác nhận",
    color: "#FF9500",
    bgColor: "#FFF3E0",
    icon: "time-outline",
    gradient: ["#FFB74D", "#FF9500"],
    step: 1,
  },
  confirmed: {
    label: "Đã xác nhận",
    color: "#2196F3",
    bgColor: "#E3F2FD",
    icon: "checkmark-circle-outline",
    gradient: ["#64B5F6", "#2196F3"],
    step: 2,
  },
  preparing: {
    label: "Đang chuẩn bị",
    color: "#FF6B6B",
    bgColor: "#FFEBEE",
    icon: "restaurant-outline",
    gradient: ["#FF8A80", "#FF6B6B"],
    step: 3,
  },
  ready: {
    label: "Sẵn sàng",
    color: "#4CAF50",
    bgColor: "#E8F5E8",
    icon: "checkmark-circle",
    gradient: ["#81C784", "#4CAF50"],
    step: 4,
  },
  delivered: {
    label: "Đã giao",
    color: "#4CAF50",
    bgColor: "#E8F5E8",
    icon: "checkmark-circle",
    gradient: ["#81C784", "#4CAF50"],
    step: 5,
  },
  cancelled: {
    label: "Đã hủy",
    color: "#F44336",
    bgColor: "#FFEBEE",
    icon: "close-circle-outline",
    gradient: ["#E57373", "#F44336"],
    step: 0,
  },
};

const TimelineStep = ({
  status,
  isActive,
  isCompleted,
  isLast,
  currentStatus,
}: {
  status: keyof typeof statusConfig;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
  currentStatus: string;
}) => {
  const config = statusConfig[status];

  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineContent}>
        <Animatable.View
          animation={isActive ? "pulse" : undefined}
          iterationCount="infinite"
          style={[
            styles.timelineIcon,
            {
              backgroundColor:
                isCompleted || isActive ? config.color : "#E0E0E0",
              borderColor: isCompleted || isActive ? config.color : "#E0E0E0",
            },
          ]}
        >
          <Ionicons
            name={config.icon as any}
            size={16}
            color={isCompleted || isActive ? "#fff" : "#999"}
          />
        </Animatable.View>
        <Text
          style={[
            styles.timelineLabel,
            {
              color: isCompleted || isActive ? config.color : "#999",
              fontWeight: isActive ? "600" : "500",
            },
          ]}
        >
          {config.label}
        </Text>
      </View>
      {!isLast && (
        <View
          style={[
            styles.timelineLine,
            {
              backgroundColor: isCompleted ? config.color : "#E0E0E0",
            },
          ]}
        />
      )}
    </View>
  );
};

const OrderTimeline = ({ currentStatus }: { currentStatus: string }) => {
  const steps: (keyof typeof statusConfig)[] = [
    "pending",
    "confirmed",
    "preparing",
    "ready",
    "delivered",
  ];
  const currentStep =
    statusConfig[currentStatus as keyof typeof statusConfig]?.step || 0;

  if (currentStatus === "cancelled") {
    return (
      <View style={styles.timelineContainer}>
        <LinearGradient
          colors={["#F44336", "#E57373"]}
          style={styles.cancelledTimeline}
        >
          <Ionicons name="close-circle" size={24} color="#fff" />
          <Text style={styles.cancelledText}>Đơn hàng đã bị hủy</Text>
        </LinearGradient>
      </View>
    );
  }

  return (
    <View style={styles.timelineContainer}>
      {steps.map((step, index) => (
        <TimelineStep
          key={step}
          status={step}
          isActive={currentStep === statusConfig[step].step}
          isCompleted={currentStep > statusConfig[step].step}
          isLast={index === steps.length - 1}
          currentStatus={currentStatus}
        />
      ))}
    </View>
  );
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
      console.log("🔄 Loading user orders...");
      const response = await userOrderApi.getUserOrders();
      console.log("📥 Orders response:", response);

      if (response.success && response.orders) {
        setOrders(response.orders);
        console.log("✅ Loaded orders:", response.orders.length);
      } else {
        console.log("⚠️ Using mock data as fallback");
        setOrders(mockOrders);
      }
    } catch (error) {
      console.error("❌ Error loading orders:", error);
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
      filtered = filtered.filter(
        (order) =>
          order.items[0]?.product?.name
            ?.toLowerCase()
            .includes(searchQuery.toLowerCase()) ||
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
              console.log("🔄 Cancelling order:", id);
              const response = await userOrderApi.cancelOrder(id);

              if (response.success) {
                // Update local state
                setOrders((prev) =>
                  prev.map((order) =>
                    order._id === id ? { ...order, status: "cancelled" } : order
                  )
                );
                Alert.alert("Thành công", "Đơn hàng đã được hủy");
              } else {
                throw new Error("Cancel failed");
              }
            } catch (error) {
              console.error("❌ Cancel order error:", error);
              Alert.alert("Lỗi", "Không thể hủy đơn hàng");
            } finally {
              setCancellingId(null);
            }
          },
        },
      ]
    );
  };

  const getFilterCount = (filter: string) => {
    if (filter === "all") return orders.length;
    return orders.filter((order) => order.status === filter).length;
  };

  const renderFilterButton = (filter: string, label: string, icon: string) => {
    const count = getFilterCount(filter);
    return (
      <TouchableOpacity
        style={[
          styles.filterButton,
          selectedFilter === filter && styles.filterButtonActive,
        ]}
        onPress={() => setSelectedFilter(filter)}
      >
        <View style={styles.filterContent}>
          <Ionicons
            name={icon as any}
            size={16}
            color={selectedFilter === filter ? "#fff" : "#FF6B6B"}
          />
          <Text
            style={[
              styles.filterButtonText,
              selectedFilter === filter && styles.filterButtonTextActive,
            ]}
          >
            {label}
          </Text>
          {count > 0 && (
            <View
              style={[
                styles.filterBadge,
                {
                  backgroundColor:
                    selectedFilter === filter ? "#fff" : "#FF6B6B",
                },
              ]}
            >
              <Text
                style={[
                  styles.filterBadgeText,
                  { color: selectedFilter === filter ? "#FF6B6B" : "#fff" },
                ]}
              >
                {count}
              </Text>
            </View>
          )}
        </View>
      </TouchableOpacity>
    );
  };

  const renderOrderCard = ({ item, index }: { item: any; index: number }) => {
    const config = statusConfig[item.status as keyof typeof statusConfig];

    return (
      <Animatable.View
        animation="fadeInUp"
        delay={index * 100}
        style={styles.orderCard}
      >
        {/* Status Header */}
        <LinearGradient
          colors={config.gradient || [config.color, config.color]}
          style={styles.orderStatusHeader}
        >
          <View style={styles.statusHeaderLeft}>
            <Ionicons name={config.icon as any} size={20} color="#fff" />
            <Text style={styles.statusHeaderText}>{config.label}</Text>
          </View>
          <View style={styles.estimatedTimeContainer}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.estimatedTimeText}>
              {item.estimatedTime || "Đang cập nhật"}
            </Text>
          </View>
        </LinearGradient>

        {/* Order Info */}
        <View style={styles.orderContent}>
          <View style={styles.orderHeader}>
            <View style={styles.orderInfo}>
              <Text style={styles.orderNumber}>{item.orderNumber}</Text>
              <Text style={styles.orderDate}>
                {new Date(item.createdAt).toLocaleDateString("vi-VN", {
                  weekday: "short",
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </Text>
            </View>
          </View>

          <View style={styles.orderDetails}>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>
                {item.items[0]?.product?.name || "Món ăn"}
              </Text>
              <View style={styles.orderMeta}>
                <View style={styles.metaItem}>
                  <Ionicons name="restaurant-outline" size={14} color="#666" />
                  <Text style={styles.metaText}>
                    {item.items[0]?.quantity || 1} món
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons
                    name={
                      item.paymentMethod === "cash"
                        ? "cash-outline"
                        : "card-outline"
                    }
                    size={14}
                    color="#666"
                  />
                  <Text style={styles.metaText}>
                    {item.paymentMethod === "cash" ? "Tiền mặt" : "MoMo"}
                  </Text>
                </View>
                <View style={styles.metaItem}>
                  <Ionicons
                    name={
                      item.deliveryMethod === "pickup"
                        ? "storefront-outline"
                        : "bicycle-outline"
                    }
                    size={14}
                    color="#666"
                  />
                  <Text style={styles.metaText}>
                    {item.deliveryMethod === "pickup" ? "Tự lấy" : "Giao hàng"}
                  </Text>
                </View>
              </View>
            </View>
            <View style={styles.priceContainer}>
              <Text style={styles.totalAmount}>
                {item.finalAmount?.toLocaleString()}đ
              </Text>
            </View>
          </View>

          {/* Timeline */}
          <OrderTimeline currentStatus={item.status} />

          {/* Actions */}
          <View style={styles.cardActions}>
            <TouchableOpacity
              style={styles.detailButton}
              onPress={() =>
                navigation.navigate("OrderDetail", {
                  orderId: item._id,
                  orderData: item,
                })
              }
            >
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
                style={styles.detailButtonGradient}
              >
                <Ionicons name="eye-outline" size={18} color="#fff" />
                <Text style={styles.detailButtonText}>Chi tiết</Text>
              </LinearGradient>
            </TouchableOpacity>

            {item.status !== "cancelled" && item.status !== "delivered" && (
              <TouchableOpacity
                style={[
                  styles.cancelButton,
                  cancellingId === item._id && styles.cancelButtonDisabled,
                ]}
                onPress={() =>
                  handleCancel(
                    item._id,
                    item.items[0]?.product?.name || "Món ăn"
                  )
                }
                disabled={cancellingId === item._id}
              >
                {cancellingId === item._id ? (
                  <ActivityIndicator size="small" color="#F44336" />
                ) : (
                  <Ionicons name="close-outline" size={18} color="#F44336" />
                )}
                <Text
                  style={[
                    styles.cancelButtonText,
                    cancellingId === item._id &&
                      styles.cancelButtonTextDisabled,
                  ]}
                >
                  {cancellingId === item._id ? "Đang hủy..." : "Hủy đơn"}
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Animatable.View>
    );
  };

  const renderEmptyState = () => (
    <Animatable.View animation="fadeInUp" style={styles.emptyState}>
      <LinearGradient
        colors={["#FF6B6B20", "#FF8E5320"]}
        style={styles.emptyIconContainer}
      >
        <Ionicons name="receipt-outline" size={64} color="#FF6B6B" />
      </LinearGradient>
      <Text style={styles.emptyStateTitle}>
        {searchQuery || selectedFilter !== "all"
          ? "Không tìm thấy đơn hàng"
          : "Chưa có đơn hàng nào"}
      </Text>
      <Text style={styles.emptyStateText}>
        {searchQuery || selectedFilter !== "all"
          ? "Thử tìm kiếm với từ khóa khác hoặc thay đổi bộ lọc"
          : "Hãy đặt món ăn yêu thích của bạn ngay bây giờ!"}
      </Text>
      {!searchQuery && selectedFilter === "all" && (
        <TouchableOpacity
          style={styles.orderNowButton}
          onPress={() => navigation.navigate("Menu")}
        >
          <LinearGradient
            colors={["#FF6B6B", "#FF8E53"]}
            style={styles.orderNowGradient}
          >
            <Ionicons name="restaurant-outline" size={18} color="#fff" />
            <Text style={styles.orderNowText}>Đặt món ngay</Text>
          </LinearGradient>
        </TouchableOpacity>
      )}
    </Animatable.View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Animatable.View animation="pulse" iterationCount="infinite">
          <LinearGradient
            colors={["#FF6B6B20", "#FF8E5320"]}
            style={styles.loadingIconContainer}
          >
            <Ionicons name="receipt-outline" size={64} color="#FF6B6B" />
          </LinearGradient>
        </Animatable.View>
        <Text style={styles.loadingText}>Đang tải đơn hàng...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.header}>
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Theo dõi đơn hàng</Text>
          <TouchableOpacity
            style={styles.refreshButton}
            onPress={onRefresh}
            disabled={refreshing}
          >
            <Animatable.View
              animation={refreshing ? "rotate" : undefined}
              iterationCount="infinite"
            >
              <Ionicons name="refresh" size={24} color="#fff" />
            </Animatable.View>
          </TouchableOpacity>
        </View>

        {/* Stats */}
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{orders.length}</Text>
            <Text style={styles.statLabel}>Tổng đơn</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {
                orders.filter(
                  (o) => o.status === "preparing" || o.status === "ready"
                ).length
              }
            </Text>
            <Text style={styles.statLabel}>Đang xử lý</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {orders.filter((o) => o.status === "delivered").length}
            </Text>
            <Text style={styles.statLabel}>Hoàn thành</Text>
          </View>
        </View>
      </LinearGradient>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Ionicons
          name="search"
          size={20}
          color="#FF6B6B"
          style={styles.searchIcon}
        />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm theo tên món hoặc mã đơn..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.clearButton}
            onPress={() => setSearchQuery("")}
          >
            <Ionicons name="close-circle" size={20} color="#999" />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Buttons */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterContainer}
        contentContainerStyle={styles.filterContent}
      >
        {renderFilterButton("all", "Tất cả", "list-outline")}
        {renderFilterButton("preparing", "Chuẩn bị", "restaurant-outline")}
        {renderFilterButton("ready", "Sẵn sàng", "checkmark-circle-outline")}
        {renderFilterButton("delivered", "Đã giao", "checkmark-circle")}
        {renderFilterButton("cancelled", "Đã hủy", "close-circle-outline")}
      </ScrollView>

      {/* Orders List */}
      <FlatList
        data={filteredOrders}
        renderItem={renderOrderCard}
        keyExtractor={(item) => item._id}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#FF6B6B"]}
            tintColor="#FF6B6B"
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
    paddingTop: 50,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  refreshButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statsContainer: {
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
  },
  statItem: {
    flex: 1,
    alignItems: "center",
  },
  statNumber: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500",
  },
  statDivider: {
    width: 1,
    backgroundColor: "rgba(255,255,255,0.3)",
    marginHorizontal: 16,
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
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
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
  clearButton: {
    padding: 4,
  },
  filterContainer: {
    marginTop: 16,
  },
  filterContent: {
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  filterButton: {
    marginRight: 12,
    borderRadius: 20,
    backgroundColor: "#fff",
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  filterButtonActive: {
    backgroundColor: "#FF6B6B",
  },
  filterContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  filterButtonText: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
    marginLeft: 6,
  },
  filterButtonTextActive: {
    color: "#fff",
  },
  filterBadge: {
    marginLeft: 6,
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  filterBadgeText: {
    fontSize: 11,
    fontWeight: "bold",
  },
  listContainer: {
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 20,
  },
  orderCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    overflow: "hidden",
  },
  orderStatusHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  statusHeaderLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusHeaderText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  estimatedTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  estimatedTimeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "500",
    marginLeft: 4,
  },
  orderContent: {
    padding: 16,
  },
  orderHeader: {
    marginBottom: 12,
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
  orderDetails: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  foodInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
  },
  orderMeta: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  metaItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 16,
    marginBottom: 4,
  },
  metaText: {
    fontSize: 12,
    color: "#666",
    marginLeft: 4,
  },
  priceContainer: {
    alignItems: "flex-end",
  },
  totalAmount: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  timelineContainer: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  timelineStep: {
    flex: 1,
  },
  timelineContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  timelineIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginRight: 12,
  },
  timelineLabel: {
    fontSize: 14,
    fontWeight: "500",
  },
  timelineLine: {
    width: 2,
    height: 20,
    marginLeft: 15,
    marginBottom: 8,
  },
  cancelledTimeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
  },
  cancelledText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  cardActions: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
    paddingTop: 12,
  },
  detailButton: {
    flex: 1,
    marginRight: 8,
    borderRadius: 8,
    overflow: "hidden",
  },
  detailButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
  },
  detailButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#F44336",
  },
  cancelButtonDisabled: {
    opacity: 0.6,
  },
  cancelButtonText: {
    color: "#F44336",
    fontSize: 14,
    fontWeight: "600",
    marginLeft: 6,
  },
  cancelButtonTextDisabled: {
    color: "#999",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
  },
  loadingIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  loadingText: {
    fontSize: 16,
    color: "#7f8c8d",
    fontWeight: "500",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 8,
    textAlign: "center",
  },
  emptyStateText: {
    fontSize: 16,
    color: "#7f8c8d",
    textAlign: "center",
    lineHeight: 22,
    marginBottom: 24,
  },
  orderNowButton: {
    borderRadius: 25,
    overflow: "hidden",
  },
  orderNowGradient: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    paddingVertical: 12,
  },
  orderNowText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
});
