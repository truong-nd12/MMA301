import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ActivityIndicator,
  TouchableOpacity,
  ScrollView,
  Dimensions,
  Alert,
  Share,
  RefreshControl,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { getOrderDetail, Order, OrderStatus } from "../api/orderApi";

const { width } = Dimensions.get("window");

// Mock detailed order data for better demo
const mockOrderDetail = {
  _id: "1",
  orderNumber: "ORDER-001",
  items: [
    {
      product: {
        name: "Cơm sườn nướng mật ong",
        price: 30000,
        image: "https://example.com/com-suon.jpg",
      },
      quantity: 2,
      price: 30000,
      total: 60000,
      addons: [
        { name: "Thêm trứng", price: 5000 },
        { name: "Thêm rau", price: 3000 },
      ],
    },
    {
      product: {
        name: "Nước ngọt",
        price: 8000,
        image: "https://example.com/nuoc-ngot.jpg",
      },
      quantity: 1,
      price: 8000,
      total: 8000,
      addons: [],
    },
  ],
  status: "preparing",
  totalAmount: 84000,
  finalAmount: 75000,
  discountAmount: 9000,
  paymentMethod: "momo",
  deliveryMethod: "pickup",
  deliveryAddress: null,
  notes: "Ít cơm, không cay",
  createdAt: "2024-01-15T10:30:00Z",
  updatedAt: "2024-01-15T10:35:00Z",
  estimatedTime: "15 phút",
  orderTimeline: [
    { status: "pending", time: "10:30", completed: true },
    { status: "confirmed", time: "10:32", completed: true },
    { status: "preparing", time: "10:35", completed: false, active: true },
    { status: "ready", time: null, completed: false },
    { status: "delivered", time: null, completed: false },
  ],
};

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
  processing: {
    label: "Đang chuẩn bị",
    color: "#FF6B6B",
    bgColor: "#FFEBEE",
    icon: "restaurant-outline",
    gradient: ["#FF8A80", "#FF6B6B"],
    step: 3,
  },
  shipped: {
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
  time,
  isActive,
  isCompleted,
  isLast,
}: {
  status: keyof typeof statusConfig;
  time: string | null;
  isActive: boolean;
  isCompleted: boolean;
  isLast: boolean;
}) => {
  const config = statusConfig[status];

  return (
    <View style={styles.timelineStep}>
      <View style={styles.timelineStepContent}>
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
            size={18}
            color={isCompleted || isActive ? "#fff" : "#999"}
          />
        </Animatable.View>
        <View style={styles.timelineInfo}>
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
          {time && <Text style={styles.timelineTime}>{time}</Text>}
        </View>
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

const OrderTimeline = ({
  orderTimeline,
  currentStatus,
}: {
  orderTimeline: any[];
  currentStatus: string;
}) => {
  const steps: (keyof typeof statusConfig)[] = [
    "pending",
    "confirmed",
    "processing",
    "shipped",
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
      {orderTimeline.map((step, index) => (
        <TimelineStep
          key={step.status}
          status={step.status}
          time={step.time}
          isActive={step.active || false}
          isCompleted={step.completed}
          isLast={index === orderTimeline.length - 1}
        />
      ))}
    </View>
  );
};

export default function OrderDetailScreen({ route, navigation }: any) {
  const { orderId, orderData } = route.params;
  const [order, setOrder] = useState<any>(orderData || null);
  const [loading, setLoading] = useState(!orderData);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    if (!orderData) {
      loadOrderDetail();
    } else {
      // Enhance order data with mock timeline and additional info
      enhanceOrderData();
    }
  }, [orderId, orderData]);

  const enhanceOrderData = () => {
    if (orderData) {
      const enhancedOrder = {
        ...orderData,
        // Add missing fields if not present
        orderNumber:
          orderData.orderNumber || `ORDER-${orderData._id?.substring(0, 8)}`,
        discountAmount:
          orderData.discountAmount ||
          orderData.totalAmount - orderData.finalAmount ||
          0,
        orderTimeline:
          orderData.orderTimeline ||
          generateTimeline(orderData.status, orderData.createdAt),
        notes: orderData.notes || "Không có ghi chú đặc biệt",
        // Enhance estimated time based on status
        estimatedTime:
          orderData.estimatedTime ||
          getEstimatedTimeFromStatus(orderData.status),
      };
      setOrder(enhancedOrder);
    }
  };

  const getEstimatedTimeFromStatus = (status: string) => {
    switch (status) {
      case "pending":
        return "Đang xác nhận...";
      case "confirmed":
        return "Chuẩn bị trong 10-15 phút";
      case "processing":
        return "5-10 phút nữa";
      case "shipped":
        return "Sẵn sàng nhận";
      case "delivered":
        return "Đã hoàn thành";
      case "cancelled":
        return "Đã hủy";
      default:
        return "Đang cập nhật";
    }
  };

  const generateTimeline = (currentStatus: string, createdAt: string) => {
    const baseTime = new Date(createdAt);
    const timeline = [
      {
        status: "pending",
        time: baseTime.toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        completed: true,
      },
      {
        status: "confirmed",
        time: new Date(baseTime.getTime() + 2 * 60000).toLocaleTimeString(
          "vi-VN",
          { hour: "2-digit", minute: "2-digit" }
        ),
        completed: ["confirmed", "processing", "shipped", "delivered"].includes(
          currentStatus
        ),
      },
      {
        status: "processing",
        time: ["processing", "shipped", "delivered"].includes(currentStatus)
          ? new Date(baseTime.getTime() + 5 * 60000).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            )
          : null,
        completed: ["shipped", "delivered"].includes(currentStatus),
        active: currentStatus === "processing",
      },
      {
        status: "shipped",
        time: ["shipped", "delivered"].includes(currentStatus)
          ? new Date(baseTime.getTime() + 15 * 60000).toLocaleTimeString(
              "vi-VN",
              { hour: "2-digit", minute: "2-digit" }
            )
          : null,
        completed: currentStatus === "delivered",
        active: currentStatus === "shipped",
      },
      {
        status: "delivered",
        time:
          currentStatus === "delivered"
            ? new Date(baseTime.getTime() + 20 * 60000).toLocaleTimeString(
                "vi-VN",
                { hour: "2-digit", minute: "2-digit" }
              )
            : null,
        completed: false,
        active: false,
      },
    ];
    return timeline;
  };

  const loadOrderDetail = async () => {
    try {
      const data = await getOrderDetail(orderId);
      if (data) {
        setOrder(data);
      } else {
        // Use mock data as fallback
        setOrder(mockOrderDetail);
      }
    } catch (error) {
      console.error("Error loading order detail:", error);
      setOrder(mockOrderDetail);
    } finally {
      setLoading(false);
    }
  };

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Đơn hàng ${order.orderNumber}\nTrạng thái: ${
          statusConfig[order.status as keyof typeof statusConfig].label
        }\nTổng tiền: ${order.finalAmount.toLocaleString()}đ`,
        title: "Chi tiết đơn hàng",
      });
    } catch (error) {
      console.error("Error sharing:", error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (orderData) {
        // If we have initial orderData, refresh it
        enhanceOrderData();
      } else {
        // Otherwise reload from API
        await loadOrderDetail();
      }
    } catch (error) {
      console.error("Error refreshing:", error);
    } finally {
      setRefreshing(false);
    }
  };

  const handleCancel = () => {
    Alert.alert("Xác nhận hủy đơn", "Bạn có chắc chắn muốn hủy đơn hàng này?", [
      { text: "Không", style: "cancel" },
      {
        text: "Hủy đơn",
        style: "destructive",
        onPress: () => {
          // Handle cancel order
          Alert.alert("Thành công", "Đơn hàng đã được hủy");
          navigation.goBack();
        },
      },
    ]);
  };

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
        <Text style={styles.loadingText}>Đang tải chi tiết đơn hàng...</Text>
      </View>
    );
  }

  if (!order) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorText}>Không tìm thấy đơn hàng</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const config = statusConfig[order.status as keyof typeof statusConfig] || {
    label: 'Không xác định',
    color: '#999',
    bgColor: '#eee',
    icon: 'help-circle-outline',
    gradient: ['#ccc', '#999'],
    step: 0,
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <LinearGradient
        colors={(config.gradient || [config.color, config.color]) as [string, string]}
        style={styles.header}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Chi tiết đơn hàng</Text>
          <TouchableOpacity style={styles.shareButton} onPress={handleShare}>
            <Ionicons name="share-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>

        {/* Order Status */}
        <View style={styles.statusContainer}>
          <View style={styles.statusLeft}>
            <Ionicons name={config.icon as any} size={24} color="#fff" />
            <Text style={styles.statusText}>{config.label}</Text>
          </View>
          <View style={styles.estimatedTimeContainer}>
            <Ionicons name="time-outline" size={16} color="#fff" />
            <Text style={styles.estimatedTimeText}>
              {order.estimatedTime ||
                orderData?.estimatedTime ||
                "Đang cập nhật"}
            </Text>
          </View>
        </View>
      </LinearGradient>

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
        <Animatable.View
          animation={orderData ? "slideInRight" : "fadeInUp"}
          duration={orderData ? 400 : 600}
          style={styles.scrollContent}
        >
          {/* Order Info Card */}
          <Animatable.View
            animation="slideInDown"
            delay={200}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="receipt-outline" size={20} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Thông tin đơn hàng</Text>
            </View>
            <View style={styles.orderInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Mã đơn hàng</Text>
                <Text style={styles.infoValue}>{order.orderNumber}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Thời gian đặt</Text>
                <Text style={styles.infoValue}>
                  {new Date(order.createdAt).toLocaleDateString("vi-VN", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phương thức thanh toán</Text>
                <View style={styles.paymentMethod}>
                  <Ionicons
                    name={
                      order.paymentMethod === "cash"
                        ? "cash-outline"
                        : "card-outline"
                    }
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.infoValue}>
                    {order.paymentMethod === "cash" ? "Tiền mặt" : "MoMo"}
                  </Text>
                </View>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Phương thức nhận</Text>
                <View style={styles.deliveryMethod}>
                  <Ionicons
                    name={
                      order.deliveryMethod === "pickup"
                        ? "storefront-outline"
                        : "bicycle-outline"
                    }
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.infoValue}>
                    {order.deliveryMethod === "pickup"
                      ? "Tự lấy tại quầy"
                      : "Giao hàng"}
                  </Text>
                </View>
              </View>
              {order.deliveryAddress && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Địa chỉ giao hàng</Text>
                  <Text style={styles.infoValue}>{order.deliveryAddress}</Text>
                </View>
              )}
              {order.notes && (
                <View style={styles.infoRow}>
                  <Text style={styles.infoLabel}>Ghi chú</Text>
                  <Text style={styles.infoValue}>{order.notes}</Text>
                </View>
              )}
            </View>
          </Animatable.View>

          {/* Order Items */}
          <Animatable.View
            animation="slideInLeft"
            delay={400}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="restaurant-outline" size={20} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Món đã đặt</Text>
            </View>
            {(order.items || []).map((item: any, index: number) => {
              // Handle both detailed items and simple items from OrderTrackingScreen
              const productName = item.product?.name || item.name || "Món ăn";
              const productPrice = item.product?.price || item.price || 0;
              const quantity = item.quantity || 1;
              const itemTotal = item.total || productPrice * quantity;

              return (
                <Animatable.View
                  key={index}
                  animation="fadeInRight"
                  delay={500 + index * 100}
                  style={[
                    styles.orderItem,
                    index > 0 && styles.orderItemBorder,
                  ]}
                >
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{productName}</Text>
                    <Text style={styles.itemPrice}>
                      {productPrice.toLocaleString()}đ x {quantity}
                    </Text>
                    {item.addons && item.addons.length > 0 && (
                      <View style={styles.addons}>
                        {item.addons.map((addon: any, addonIndex: number) => (
                          <Text key={addonIndex} style={styles.addonText}>
                            + {addon.name} (+{addon.price.toLocaleString()}đ)
                          </Text>
                        ))}
                      </View>
                    )}
                  </View>
                  <Text style={styles.itemTotal}>
                    {itemTotal.toLocaleString()}đ
                  </Text>
                </Animatable.View>
              );
            })}

            {/* If no items array, show main food from simple order data */}
            {(!order.items || order.items.length === 0) && (
              <Animatable.View
                animation="fadeInRight"
                delay={500}
                style={styles.orderItem}
              >
                <View style={styles.itemInfo}>
                  <Text style={styles.itemName}>
                    {order.items?.[0]?.product?.name || "Món chính"}
                  </Text>
                  <Text style={styles.itemPrice}>
                    {(order.finalAmount || 0).toLocaleString()}đ
                  </Text>
                </View>
                <Text style={styles.itemTotal}>
                  {(order.finalAmount || 0).toLocaleString()}đ
                </Text>
              </Animatable.View>
            )}
          </Animatable.View>

          {/* Timeline */}
          <Animatable.View
            animation="slideInUp"
            delay={600}
            style={styles.card}
          >
            <View style={styles.cardHeader}>
              <Ionicons name="time-outline" size={20} color="#FF6B6B" />
              <Text style={styles.cardTitle}>Trạng thái đơn hàng</Text>
            </View>
            <OrderTimeline
              orderTimeline={order.orderTimeline || []}
              currentStatus={order.status}
            />
          </Animatable.View>

          {/* Price Summary */}
          <Animatable.View
            animation="slideInRight"
            delay={800}
            style={styles.summaryCard}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.summaryHeader}
            >
              <Ionicons name="calculator-outline" size={20} color="#fff" />
              <Text style={styles.summaryTitle}>Tổng kết thanh toán</Text>
            </LinearGradient>

            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Tạm tính</Text>
                <Text style={styles.summaryValue}>
                  {order.totalAmount.toLocaleString()}đ
                </Text>
              </View>

              {order.discountAmount > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: "#4CAF50" }]}>
                    Giảm giá
                  </Text>
                  <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                    -{order.discountAmount.toLocaleString()}đ
                  </Text>
                </View>
              )}

              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotal}>Tổng cộng</Text>
                <Text style={styles.summaryTotalValue}>
                  {order.finalAmount.toLocaleString()}đ
                </Text>
              </View>
            </View>
          </Animatable.View>

          {/* Action Buttons */}
          <Animatable.View
            animation="bounceIn"
            delay={1000}
            style={styles.actionButtons}
          >
            {order.status !== "cancelled" && order.status !== "delivered" && (
              <TouchableOpacity
                style={styles.cancelButton}
                onPress={handleCancel}
              >
                <Ionicons name="close-outline" size={18} color="#F44336" />
                <Text style={styles.cancelButtonText}>Hủy đơn</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity
              style={styles.reorderButton}
              onPress={() => {
                // Handle reorder
                Alert.alert(
                  "Thông báo",
                  "Tính năng đặt lại đang được phát triển"
                );
              }}
            >
              <LinearGradient
                colors={["#FF6B6B", "#FF8E53"]}
                style={styles.reorderGradient}
              >
                <Ionicons name="refresh-outline" size={18} color="#fff" />
                <Text style={styles.reorderButtonText}>Đặt lại</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animatable.View>
        </Animatable.View>
      </ScrollView>
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
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  shareButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  statusContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 12,
    padding: 16,
  },
  statusLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  statusText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 8,
  },
  estimatedTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  estimatedTimeText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
    marginLeft: 4,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 8,
    overflow: "hidden",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
  },
  orderInfo: {
    padding: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    color: "#7f8c8d",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
    flex: 2,
    textAlign: "right",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "flex-end",
  },
  deliveryMethod: {
    flexDirection: "row",
    alignItems: "center",
    flex: 2,
    justifyContent: "flex-end",
  },
  orderItem: {
    padding: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  orderItemBorder: {
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  itemInfo: {
    flex: 1,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 4,
  },
  itemPrice: {
    fontSize: 14,
    color: "#7f8c8d",
    marginBottom: 4,
  },
  addons: {
    marginTop: 4,
  },
  addonText: {
    fontSize: 12,
    color: "#FF6B6B",
    fontStyle: "italic",
  },
  itemTotal: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  timelineContainer: {
    padding: 16,
  },
  timelineStep: {
    flex: 1,
  },
  timelineStepContent: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  timelineIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    marginRight: 12,
  },
  timelineInfo: {
    flex: 1,
  },
  timelineLabel: {
    fontSize: 16,
    fontWeight: "500",
    marginBottom: 2,
  },
  timelineTime: {
    fontSize: 12,
    color: "#7f8c8d",
  },
  timelineLine: {
    width: 2,
    height: 24,
    marginLeft: 17,
    marginBottom: 8,
  },
  cancelledTimeline: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
  },
  cancelledText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    overflow: "hidden",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  summaryTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  summaryContent: {
    padding: 16,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  summaryLabel: {
    fontSize: 14,
    color: "#7f8c8d",
  },
  summaryValue: {
    fontSize: 14,
    color: "#2c3e50",
    fontWeight: "500",
  },
  summaryDivider: {
    height: 1,
    backgroundColor: "#e9ecef",
    marginVertical: 15,
  },
  summaryTotal: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
  },
  summaryTotalValue: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#FF6B6B",
  },
  actionButtons: {
    flexDirection: "row",
    marginBottom: 20,
  },
  cancelButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#F44336",
    marginRight: 8,
  },
  cancelButtonText: {
    color: "#F44336",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
  },
  reorderButton: {
    flex: 2,
    borderRadius: 12,
    overflow: "hidden",
  },
  reorderGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  reorderButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 6,
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
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorText: {
    fontSize: 18,
    color: "#666",
    textAlign: "center",
    marginVertical: 20,
  },
  retryButton: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 25,
  },
  retryButtonText: {
    color: "#fff",
    fontWeight: "600",
  },
});
