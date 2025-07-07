import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  RefreshControl,
  Modal,
  ScrollView,
  Animated,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

// Dữ liệu mẫu với thêm thông tin
type OrderItem = { name: string; quantity: number; price: number };
type Order = {
  id: string;
  name: string;
  date: string;
  time: string;
  total: number;
  status: string;
  items: OrderItem[];
  location: string;
};

const orders: Order[] = [
  {
    id: "1",
    name: "Cơm sườn nướng mật ong",
    date: "2024-05-01",
    time: "12:30",
    total: 35000,
    status: "completed",
    items: [
      { name: "Cơm sườn nướng mật ong", quantity: 1, price: 30000 },
      { name: "Nước ngọt", quantity: 1, price: 5000 },
    ],
    location: "Căng tin A - Tầng 1",
  },
  {
    id: "2",
    name: "Bún chay đặc biệt",
    date: "2024-04-28",
    time: "11:45",
    total: 30000,
    status: "completed",
    items: [
      { name: "Bún chay đặc biệt", quantity: 1, price: 25000 },
      { name: "Trà đá", quantity: 1, price: 5000 },
    ],
    location: "Căng tin B - Tầng 2",
  },
  {
    id: "3",
    name: "Mì xào bò đặc biệt",
    date: "2024-04-25",
    time: "13:15",
    total: 40000,
    status: "cancelled",
    items: [
      { name: "Mì xào bò đặc biệt", quantity: 1, price: 35000 },
      { name: "Nước suối", quantity: 1, price: 5000 },
    ],
    location: "Căng tin A - Tầng 1",
  },
];

// Component chọn số sao
const StarRating = ({
  rating,
  setRating,
}: {
  rating: number;
  setRating: (n: number) => void;
}) => (
  <View
    style={{
      flexDirection: "row",
      justifyContent: "center",
      marginVertical: 12,
    }}
  >
    {[1, 2, 3, 4, 5].map((star) => (
      <TouchableOpacity key={star} onPress={() => setRating(star)}>
        <Ionicons
          name={star <= rating ? "star" : "star-outline"}
          size={32}
          color={star <= rating ? "#FFD700" : "#ccc"}
          style={{ marginHorizontal: 2 }}
        />
      </TouchableOpacity>
    ))}
  </View>
);

export default function OrderHistoryScreen() {
  const navigation = useNavigation() as any;
  const [searchText, setSearchText] = useState("");
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [filterStatus, setFilterStatus] = useState("all");

  const filteredOrders = orders.filter((order) => {
    const matchesSearch = order.name
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesFilter =
      filterStatus === "all" || order.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const totalSpent = orders
    .filter((order) => order.status === "completed")
    .reduce((sum, order) => sum + order.total, 0);

  const onRefresh = () => {
    setRefreshing(true);
    // Simulate API call
    setTimeout(() => setRefreshing(false), 1000);
  };

  const getStatusColor = (status: any) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "cancelled":
        return "#F44336";
      case "pending":
        return "#FF9800";
      default:
        return "#9E9E9E";
    }
  };

  const getStatusText = (status: any) => {
    switch (status) {
      case "completed":
        return "Hoàn thành";
      case "cancelled":
        return "Đã hủy";
      case "pending":
        return "Đang xử lý";
      default:
        return "Không xác định";
    }
  };

  const openOrderDetails = (order: Order) => {
    setSelectedOrder(order);
    setModalVisible(true);
  };

  const reorderItem = (order: any) => {
    // Logic để đặt lại món
    alert(`Đặt lại món: ${order.name}`);
  };

  const renderFilterButton = (status: any, label: any) => (
    <TouchableOpacity
      style={[
        styles.filterButton,
        filterStatus === status && styles.activeFilterButton,
      ]}
      onPress={() => setFilterStatus(status)}
    >
      <Text
        style={[
          styles.filterButtonText,
          filterStatus === status && styles.activeFilterButtonText,
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  const renderOrderItem = ({ item }: { item: Order }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => openOrderDetails(item)}
      activeOpacity={0.7}
    >
      <View style={styles.cardHeader}>
        <View style={styles.iconContainer}>
          <Ionicons name="fast-food-outline" size={24} color="#667eea" />
        </View>
        <View style={styles.orderInfo}>
          <Text style={styles.foodName} numberOfLines={1}>
            {item.name}
          </Text>
          <Text style={styles.location}>{item.location}</Text>
          <Text style={styles.dateTime}>
            {item.date} • {item.time}
          </Text>
        </View>
        <View style={styles.orderMeta}>
          <Text style={styles.total}>{item.total.toLocaleString()}đ</Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(item.status) },
            ]}
          >
            <Text style={styles.statusText}>{getStatusText(item.status)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.cardActions}>
        <TouchableOpacity
          style={styles.actionButton}
          onPress={() => openOrderDetails(item)}
        >
          <Ionicons name="eye-outline" size={16} color="#667eea" />
          <Text style={styles.actionButtonText}>Chi tiết</Text>
        </TouchableOpacity>

        {item.status === "completed" && (
          <>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => reorderItem(item)}
            >
              <Ionicons name="refresh-outline" size={16} color="#4CAF50" />
              <Text style={[styles.actionButtonText, { color: "#4CAF50" }]}>
                Đặt lại
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() =>
                navigation.navigate("OrderReview", { order: item })
              }
            >
              <Ionicons name="star-outline" size={16} color="#FFD700" />
              <Text style={[styles.actionButtonText, { color: "#FFD700" }]}>
                Đánh giá
              </Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <Text style={styles.headerTitle}>Lịch sử đặt món</Text>
        <Text style={styles.headerSubtitle}>
          Tổng chi tiêu: {totalSpent.toLocaleString()}đ
        </Text>
      </LinearGradient>

      <View style={styles.searchContainer}>
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={20} color="#999" />
          <TextInput
            style={styles.searchInput}
            placeholder="Tìm kiếm món ăn..."
            value={searchText}
            onChangeText={setSearchText}
          />
        </View>
      </View>

      <View style={styles.filterContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          {renderFilterButton("all", "Tất cả")}
          {renderFilterButton("completed", "Hoàn thành")}
          {renderFilterButton("pending", "Đang xử lý")}
          {renderFilterButton("cancelled", "Đã hủy")}
        </ScrollView>
      </View>

      <FlatList
        data={filteredOrders}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        renderItem={renderOrderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="receipt-outline" size={64} color="#ddd" />
            <Text style={styles.emptyTitle}>Không có đơn hàng nào</Text>
            <Text style={styles.emptySubtitle}>
              {searchText
                ? "Không tìm thấy kết quả phù hợp"
                : "Hãy đặt món đầu tiên của bạn!"}
            </Text>
          </View>
        }
        showsVerticalScrollIndicator={false}
      />

      {/* Modal chi tiết đơn hàng */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi tiết đơn hàng</Text>
              <TouchableOpacity
                onPress={() => setModalVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView style={styles.modalBody}>
                <View style={styles.orderDetailSection}>
                  <Text style={styles.sectionTitle}>Thông tin đơn hàng</Text>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Mã đơn:</Text>
                    <Text style={styles.detailValue}>#{selectedOrder.id}</Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Thời gian:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.date} • {selectedOrder.time}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Địa điểm:</Text>
                    <Text style={styles.detailValue}>
                      {selectedOrder.location}
                    </Text>
                  </View>
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Trạng thái:</Text>
                    <View
                      style={[
                        styles.statusBadge,
                        {
                          backgroundColor: getStatusColor(selectedOrder.status),
                        },
                      ]}
                    >
                      <Text style={styles.statusText}>
                        {getStatusText(selectedOrder.status)}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.orderDetailSection}>
                  <Text style={styles.sectionTitle}>Chi tiết món ăn</Text>
                  {selectedOrder.items.map((item, index) => (
                    <View key={index} style={styles.itemRow}>
                      <Text style={styles.itemName}>{item.name}</Text>
                      <Text style={styles.itemQuantity}>x{item.quantity}</Text>
                      <Text style={styles.itemPrice}>
                        {item.price.toLocaleString()}đ
                      </Text>
                    </View>
                  ))}
                  <View style={styles.totalRow}>
                    <Text style={styles.totalLabel}>Tổng cộng:</Text>
                    <Text style={styles.totalAmount}>
                      {selectedOrder.total.toLocaleString()}đ
                    </Text>
                  </View>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
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
    paddingBottom: 30,
    paddingHorizontal: 20,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#fff",
    opacity: 0.9,
    marginTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  searchInput: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
    color: "#333",
  },
  filterContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  filterButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: "#fff",
    marginRight: 10,
    borderWidth: 1,
    borderColor: "#e0e0e0",
  },
  activeFilterButton: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  filterButtonText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeFilterButtonText: {
    color: "#fff",
  },
  list: {
    padding: 20,
    paddingTop: 0,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f0f4ff",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  orderInfo: {
    flex: 1,
  },
  foodName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  location: {
    fontSize: 13,
    color: "#666",
    marginBottom: 2,
  },
  dateTime: {
    fontSize: 12,
    color: "#999",
  },
  orderMeta: {
    alignItems: "flex-end",
  },
  total: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 6,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 11,
    color: "#fff",
    fontWeight: "600",
  },
  cardActions: {
    flexDirection: "row",
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  actionButtonText: {
    fontSize: 14,
    color: "#667eea",
    marginLeft: 4,
    fontWeight: "500",
  },
  emptyContainer: {
    alignItems: "center",
    paddingVertical: 60,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: "#666",
    textAlign: "center",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: "80%",
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
  },
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  orderDetailSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
  },
  detailValue: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
  },
  itemName: {
    flex: 1,
    fontSize: 14,
    color: "#333",
  },
  itemQuantity: {
    fontSize: 14,
    color: "#666",
    marginHorizontal: 12,
  },
  itemPrice: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
  },
  totalRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingTop: 12,
    marginTop: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  totalAmount: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#667eea",
  },
});
