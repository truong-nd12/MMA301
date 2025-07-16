import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  TextInput,
  Platform,
  KeyboardAvoidingView,
  ScrollView,
  Switch,
  ActivityIndicator,
  Alert,
  Dimensions,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { userOrderApi } from "../api/userOrderApi";

const { width } = Dimensions.get("window");

// Mock data for add-ons
const addOns = [
  { id: "1", name: "Thêm trứng", price: 5000, icon: "egg" },
  { id: "2", name: "Thêm thịt", price: 10000, icon: "nutrition" },
  { id: "3", name: "Thêm rau", price: 3000, icon: "leaf" },
  { id: "4", name: "Nước ngọt", price: 8000, icon: "wine" },
  { id: "5", name: "Cơm thêm", price: 5000, icon: "restaurant" },
];

const OrderScreen = ({ route, navigation }: any) => {
  const { food } = route.params || {};
  const [quantity, setQuantity] = useState(1);
  const [note, setNote] = useState("");
  const [time, setTime] = useState("11:30");
  const [deliveryMethod, setDeliveryMethod] = useState<
    "pickup" | "delivery" | "ship"
  >("pickup");
  const [selectedLocation, setSelectedLocation] = useState<
    "phonghoc" | "ktx" | "khac"
  >("phonghoc");
  const [customLocation, setCustomLocation] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [useStudentDiscount, setUseStudentDiscount] = useState(false);
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!food) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={64} color="#FF6B6B" />
        <Text style={styles.errorMessage}>Không có dữ liệu món ăn.</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.retryButtonText}>Quay lại</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const increase = () => setQuantity((q: number) => q + 1);
  const decrease = () => setQuantity((q: number) => (q > 1 ? q - 1 : 1));

  let estimatedTime = "10-15 phút";
  if (deliveryMethod === "delivery") estimatedTime = "20-30 phút";
  if (deliveryMethod === "ship") estimatedTime = "15-25 phút";

  const getShipFee = () => {
    if (deliveryMethod !== "ship") return 0;
    if (selectedLocation === "phonghoc") return 15000;
    if (selectedLocation === "ktx") return 10000;
    return 20000;
  };

  const shipLocationLabel = {
    phonghoc: "Phòng học",
    ktx: "Ký túc xá",
    khac: "Khác",
  };

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev) =>
      prev.includes(addOnId)
        ? prev.filter((id) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

  const getAddOnTotal = () => {
    return selectedAddOns.reduce((total, addOnId) => {
      const addOn = addOns.find((item) => item.id === addOnId);
      return total + (addOn ? addOn.price : 0);
    }, 0);
  };

  const calculateTotal = () => {
    const basePrice = food.price * quantity;
    const addOnPrice = getAddOnTotal() * quantity;
    const discount = useStudentDiscount ? (basePrice + addOnPrice) * 0.1 : 0;
    const shipFee = getShipFee();
    return basePrice + addOnPrice - discount + shipFee;
  };

  const handleOrder = async () => {
    // Hiển thị notification ngay khi bấm đặt món
    Alert.alert(
      "Xác nhận đặt món",
      `Bạn có muốn đặt "${
        food.name
      }" với tổng tiền ${calculateTotal().toLocaleString()}đ?`,
      [
        {
          text: "Hủy",
          style: "cancel",
        },
        {
          text: "Đặt món",
          onPress: async () => {
            setLoading(true);
            setError(null);

            try {
              console.log("🔄 Creating order...");
              console.log("📤 Food data:", food);

              // Validate food data
              if (!food) {
                throw new Error("Không có dữ liệu món ăn");
              }

              // Get product ID with fallback - try all possible ID fields
              const productId =
                food.id ||
                food._id ||
                food.productId ||
                food.product_id ||
                "demo-product-1";
              const productPrice = food.price || food.cost || food.amount || 0;

              // Log all possible ID fields for debugging
              console.log("🔍 All possible ID fields:", {
                id: food.id,
                _id: food._id,
                productId: food.productId,
                product_id: food.product_id,
              });

              console.log("🔍 Product ID:", productId);
              console.log("💰 Product Price:", productPrice);

              // Prepare order items with proper format for backend
              const orderItems = [
                {
                  product: productId, // Backend expects 'product' field, not 'productId'
                  quantity: quantity,
                  price: productPrice,
                },
              ];

              // Add add-ons to order items
              selectedAddOns.forEach((addOnId) => {
                const addOn = addOns.find((item) => item.id === addOnId);
                if (addOn) {
                  orderItems.push({
                    product: `addon-${addOn.id}`,
                    quantity: quantity,
                    price: addOn.price,
                  });
                }
              });

              const orderData = {
                items: orderItems,
                paymentMethod: paymentMethod,
                deliveryMethod:
                  deliveryMethod === "ship" ? "delivery" : deliveryMethod,
                deliveryAddress:
                  deliveryMethod === "pickup"
                    ? undefined
                    : customLocation || "Căng tin A",
                notes: note,
                orderNumber: `ORDER-${Date.now()}`, // Add orderNumber to avoid validation error
              };

              console.log("📤 Order data:", orderData);

              const response = await userOrderApi.createOrder(orderData);
              console.log("📥 Order response:", response);

              setLoading(false);

              if (response.success) {
                // Hiển thị notification thành công với options
                Alert.alert(
                  "Đặt món thành công! 🎉",
                  "Đơn hàng của bạn đã được tạo. Bạn muốn làm gì tiếp theo?",
                  [
                    {
                      text: "Theo dõi đơn hàng",
                      onPress: () => navigation.navigate("OrderTracking"),
                    },
                    {
                      text: "Tiếp tục mua",
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              } else {
                throw new Error("Order creation failed");
              }
            } catch (err: any) {
              setLoading(false);
              console.error("❌ Order error:", err);
              setError("Đặt món thất bại. Vui lòng thử lại!");

              // Show fallback success for demo
              Alert.alert(
                "Đặt món thành công! (Demo) 🎉",
                "Đơn hàng của bạn đã được tạo. Bạn muốn làm gì tiếp theo?",
                [
                  {
                    text: "Theo dõi đơn hàng",
                    onPress: () => navigation.navigate("OrderTracking"),
                  },
                  {
                    text: "Tiếp tục mua",
                    onPress: () => navigation.goBack(),
                  },
                ]
              );
            }
          },
        },
      ]
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <LinearGradient colors={["#FF6B6B", "#FF8E53"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt món</Text>
        <View style={styles.headerRight}>
          <TouchableOpacity style={styles.favoriteButton}>
            <Ionicons name="heart-outline" size={22} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        <Animatable.View
          animation="fadeInUp"
          duration={700}
          style={styles.container}
        >
          {/* Food Card */}
          <Animatable.View
            animation="slideInDown"
            delay={200}
            style={styles.foodCard}
          >
            <View style={styles.imageContainer}>
              <Image
                source={{ uri: food.image || food.images }}
                style={styles.image}
              />
              <LinearGradient
                colors={["transparent", "rgba(0,0,0,0.8)"]}
                style={styles.imageOverlay}
              >
                <View style={styles.priceTag}>
                  <Text style={styles.priceTagText}>
                    {(food.price || 0).toLocaleString()}đ
                  </Text>
                </View>
              </LinearGradient>
            </View>
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodDesc}>
                {food.desc || food.description}
              </Text>
              <View style={styles.ratingContainer}>
                <View style={styles.stars}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Ionicons
                      key={star}
                      name="star"
                      size={16}
                      color="#FFD700"
                    />
                  ))}
                </View>
                <Text style={styles.rating}>4.8 (142 đánh giá)</Text>
              </View>
            </View>
          </Animatable.View>

          {/* Quantity Section */}
          <Animatable.View
            animation="slideInLeft"
            delay={400}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="layers-outline" size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Số lượng</Text>
            </View>
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={decrease}>
                <Ionicons name="remove" size={20} color="#FF6B6B" />
              </TouchableOpacity>
              <Animatable.Text
                animation="pulse"
                style={styles.qtyText}
                key={quantity}
              >
                {quantity}
              </Animatable.Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={increase}>
                <Ionicons name="add" size={20} color="#FF6B6B" />
              </TouchableOpacity>
            </View>
          </Animatable.View>

          {/* Add-ons Section */}
          <Animatable.View
            animation="slideInRight"
            delay={600}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="add-circle-outline" size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Thêm topping</Text>
              <Text style={styles.sectionSubtitle}>(tùy chọn)</Text>
            </View>
            <View style={styles.addOnsContainer}>
              {addOns.map((addOn, index) => (
                <Animatable.View
                  key={addOn.id}
                  animation="fadeInUp"
                  delay={700 + index * 100}
                >
                  <TouchableOpacity
                    style={[
                      styles.addOnItem,
                      selectedAddOns.includes(addOn.id) &&
                        styles.addOnItemSelected,
                    ]}
                    onPress={() => toggleAddOn(addOn.id)}
                  >
                    <View style={styles.addOnLeft}>
                      <View
                        style={[
                          styles.addOnIcon,
                          selectedAddOns.includes(addOn.id) &&
                            styles.addOnIconSelected,
                        ]}
                      >
                        <Ionicons
                          name={addOn.icon as any}
                          size={18}
                          color={
                            selectedAddOns.includes(addOn.id)
                              ? "#fff"
                              : "#FF6B6B"
                          }
                        />
                      </View>
                      <View style={styles.addOnInfo}>
                        <Text
                          style={[
                            styles.addOnName,
                            selectedAddOns.includes(addOn.id) &&
                              styles.addOnNameSelected,
                          ]}
                        >
                          {addOn.name}
                        </Text>
                        <Text style={styles.addOnPrice}>
                          +{addOn.price.toLocaleString()}đ
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.checkbox,
                        selectedAddOns.includes(addOn.id) &&
                          styles.checkboxSelected,
                      ]}
                    >
                      {selectedAddOns.includes(addOn.id) && (
                        <Ionicons name="checkmark" size={16} color="#fff" />
                      )}
                    </View>
                  </TouchableOpacity>
                </Animatable.View>
              ))}
            </View>
          </Animatable.View>

          {/* Delivery/Pickup Section */}
          <Animatable.View
            animation="slideInLeft"
            delay={800}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="car-outline" size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Phương thức nhận món</Text>
            </View>
            <View style={styles.deliveryOptions}>
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryMethod === "pickup" && styles.deliveryOptionActive,
                ]}
                onPress={() => setDeliveryMethod("pickup")}
              >
                <Ionicons
                  name="storefront-outline"
                  size={20}
                  color={deliveryMethod === "pickup" ? "#fff" : "#FF6B6B"}
                />
                <Text
                  style={[
                    styles.deliveryOptionText,
                    deliveryMethod === "pickup" &&
                      styles.deliveryOptionTextActive,
                  ]}
                >
                  Tự đến lấy
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.deliveryOption,
                  deliveryMethod === "ship" && styles.deliveryOptionActive,
                ]}
                onPress={() => setDeliveryMethod("ship")}
              >
                <Ionicons
                  name="bicycle-outline"
                  size={20}
                  color={deliveryMethod === "ship" ? "#fff" : "#FF6B6B"}
                />
                <Text
                  style={[
                    styles.deliveryOptionText,
                    deliveryMethod === "ship" &&
                      styles.deliveryOptionTextActive,
                  ]}
                >
                  Giao hàng
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.timeInfo}>
              <Ionicons name="time-outline" size={16} color="#7f8c8d" />
              <Text style={styles.estimatedTime}>
                Thời gian dự kiến: {estimatedTime}
              </Text>
            </View>

            {deliveryMethod === "ship" && (
              <Animatable.View
                animation="slideInDown"
                style={styles.shipContainer}
              >
                <Text style={styles.shipTitle}>Chọn địa điểm nhận món</Text>
                <View style={styles.locationOptions}>
                  {[
                    {
                      id: "phonghoc",
                      label: "Phòng học",
                      icon: "school-outline",
                    },
                    { id: "ktx", label: "Ký túc xá", icon: "home-outline" },
                    { id: "khac", label: "Khác", icon: "location-outline" },
                  ].map((location) => (
                    <TouchableOpacity
                      key={location.id}
                      style={[
                        styles.locationOption,
                        selectedLocation === location.id &&
                          styles.locationOptionActive,
                      ]}
                      onPress={() => setSelectedLocation(location.id as any)}
                    >
                      <Ionicons
                        name={location.icon as any}
                        size={18}
                        color={
                          selectedLocation === location.id ? "#fff" : "#FF6B6B"
                        }
                      />
                      <Text
                        style={[
                          styles.locationOptionText,
                          selectedLocation === location.id &&
                            styles.locationOptionTextActive,
                        ]}
                      >
                        {location.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {selectedLocation === "khac" && (
                  <Animatable.View animation="fadeInDown">
                    <TextInput
                      style={styles.customLocationInput}
                      placeholder="Nhập địa chỉ cụ thể..."
                      value={customLocation}
                      onChangeText={setCustomLocation}
                      placeholderTextColor="#999"
                    />
                  </Animatable.View>
                )}

                <View style={styles.shipFeeContainer}>
                  <View style={styles.shipFeeIcon}>
                    <Ionicons name="cash-outline" size={18} color="#FF6B6B" />
                  </View>
                  <Text style={styles.shipFeeText}>
                    Phí ship:{" "}
                    <Text style={styles.shipFeeAmount}>
                      {getShipFee().toLocaleString()}đ
                    </Text>
                  </Text>
                </View>
              </Animatable.View>
            )}
          </Animatable.View>

          {/* Time Section */}
          <Animatable.View
            animation="slideInRight"
            delay={900}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="time-outline" size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Thời gian nhận món</Text>
            </View>
            <TextInput
              style={styles.input}
              placeholder="VD: 11:30 hoặc Ngay bây giờ"
              value={time}
              onChangeText={setTime}
              placeholderTextColor="#999"
            />
          </Animatable.View>

          {/* Note Section */}
          <Animatable.View
            animation="slideInLeft"
            delay={1000}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="chatbubble-outline" size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Ghi chú</Text>
            </View>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Ví dụ: Ít cơm, thêm rau, không cay..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
              placeholderTextColor="#999"
            />
          </Animatable.View>

          {/* Student Discount Section */}
          <Animatable.View
            animation="slideInRight"
            delay={1100}
            style={styles.section}
          >
            <View style={styles.discountContainer}>
              <View style={styles.discountInfo}>
                <Ionicons name="school-outline" size={20} color="#4CAF50" />
                <Text style={styles.discountText}>
                  Giảm giá sinh viên (10%)
                </Text>
              </View>
              <Switch
                value={useStudentDiscount}
                onValueChange={setUseStudentDiscount}
                trackColor={{ false: "#ddd", true: "#4CAF50" }}
                thumbColor={useStudentDiscount ? "#fff" : "#fff"}
              />
            </View>
          </Animatable.View>

          {/* Payment Method */}
          <Animatable.View
            animation="slideInLeft"
            delay={1200}
            style={styles.section}
          >
            <View style={styles.sectionHeader}>
              <Ionicons name="card-outline" size={20} color="#FF6B6B" />
              <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            </View>
            <View style={styles.paymentMethods}>
              {[
                {
                  id: "cash",
                  name: "Tiền mặt",
                  icon: "cash-outline",
                  color: "#4CAF50",
                },
                {
                  id: "momo",
                  name: "MoMo",
                  icon: "phone-portrait-outline",
                  color: "#E91E63",
                },
              ].map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === method.id && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod(method.id)}
                >
                  <View
                    style={[
                      styles.paymentIcon,
                      { backgroundColor: method.color + "20" },
                    ]}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={
                        paymentMethod === method.id ? "#fff" : method.color
                      }
                    />
                  </View>
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === method.id &&
                        styles.paymentMethodTextActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                  {paymentMethod === method.id && (
                    <Ionicons
                      name="checkmark-circle"
                      size={20}
                      color="#4CAF50"
                    />
                  )}
                </TouchableOpacity>
              ))}
            </View>

            {/* Hiển thị mã QR nếu chọn MoMo */}
            {paymentMethod === "momo" && (
              <Animatable.View
                animation="fadeInDown"
                style={styles.qrContainer}
              >
                <Text style={styles.qrTitle}>
                  Quét mã QR để thanh toán MoMo
                </Text>
                <View style={styles.qrImageContainer}>
                  <Image
                    source={require("../assets/images/momo-qr.png")}
                    style={styles.qrImage}
                    resizeMode="contain"
                  />
                </View>
                <Text style={styles.qrNote}>
                  Vui lòng chuyển khoản đúng số tiền và ghi rõ nội dung đơn
                  hàng.
                </Text>
              </Animatable.View>
            )}
          </Animatable.View>

          {/* Order Summary */}
          <Animatable.View
            animation="slideInUp"
            delay={1300}
            style={styles.summaryCard}
          >
            <LinearGradient
              colors={["#667eea", "#764ba2"]}
              style={styles.summaryHeader}
            >
              <Ionicons name="receipt-outline" size={20} color="#fff" />
              <Text style={styles.summaryTitle}>Tổng kết đơn hàng</Text>
            </LinearGradient>

            <View style={styles.summaryContent}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Món chính ({quantity}x)</Text>
                <Text style={styles.summaryValue}>
                  {((food.price || 0) * quantity).toLocaleString()}đ
                </Text>
              </View>

              {selectedAddOns.length > 0 && (
                <View style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    Topping ({selectedAddOns.length} món)
                  </Text>
                  <Text style={styles.summaryValue}>
                    {(getAddOnTotal() * quantity).toLocaleString()}đ
                  </Text>
                </View>
              )}

              {useStudentDiscount && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: "#4CAF50" }]}>
                    Giảm giá sinh viên (10%)
                  </Text>
                  <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                    -
                    {(
                      ((food.price || 0) * quantity +
                        getAddOnTotal() * quantity) *
                      0.1
                    ).toLocaleString()}
                    đ
                  </Text>
                </View>
              )}

              {deliveryMethod === "ship" && (
                <View style={styles.summaryRow}>
                  <Text style={[styles.summaryLabel, { color: "#FF6B6B" }]}>
                    Phí ship (
                    {
                      shipLocationLabel[
                        selectedLocation as "phonghoc" | "ktx" | "khac"
                      ]
                    }
                    )
                  </Text>
                  <Text style={[styles.summaryValue, { color: "#FF6B6B" }]}>
                    {getShipFee().toLocaleString()}đ
                  </Text>
                </View>
              )}

              <View style={styles.summaryDivider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryTotal}>Tổng cộng</Text>
                <Text style={styles.summaryTotalValue}>
                  {calculateTotal().toLocaleString()}đ
                </Text>
              </View>
            </View>
          </Animatable.View>

          {/* Order Button */}
          <Animatable.View animation="bounceIn" delay={1400}>
            <TouchableOpacity
              style={styles.orderBtn}
              activeOpacity={0.8}
              onPress={handleOrder}
              disabled={loading}
            >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color="#fff" />
                  <Text style={styles.loadingText}>Đang xử lý...</Text>
                </View>
              ) : (
                <LinearGradient
                  colors={["#FF6B6B", "#FF8E53"]}
                  style={styles.orderBtnGradient}
                >
                  <Ionicons
                    name="checkmark-circle-outline"
                    size={22}
                    color="#fff"
                  />
                  <Text style={styles.orderBtnText}>
                    Xác nhận đặt món • {calculateTotal().toLocaleString()}đ
                  </Text>
                </LinearGradient>
              )}
            </TouchableOpacity>
          </Animatable.View>

          {error && (
            <Animatable.View animation="shake">
              <Text style={styles.errorText}>{error}</Text>
            </Animatable.View>
          )}
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 20,
    paddingHorizontal: 20,
    elevation: 8,
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
  headerRight: {
    width: 40,
  },
  favoriteButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "rgba(255,255,255,0.2)",
    alignItems: "center",
    justifyContent: "center",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    padding: 20,
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#f8f9fa",
  },
  errorMessage: {
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
  foodCard: {
    backgroundColor: "#fff",
    borderRadius: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    overflow: "hidden",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    height: 250,
    backgroundColor: "#eee",
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
    justifyContent: "flex-end",
    padding: 20,
  },
  priceTag: {
    alignSelf: "flex-start",
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  priceTagText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "bold",
  },
  foodInfo: {
    padding: 20,
  },
  foodName: {
    fontSize: 26,
    fontWeight: "700",
    color: "#2c3e50",
    marginBottom: 8,
    textAlign: "center",
  },
  foodDesc: {
    fontSize: 16,
    color: "#7f8c8d",
    marginBottom: 15,
    textAlign: "center",
    lineHeight: 22,
  },
  ratingContainer: {
    alignItems: "center",
  },
  stars: {
    flexDirection: "row",
    marginBottom: 5,
  },
  rating: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 5,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginLeft: 8,
    flex: 1,
  },
  sectionSubtitle: {
    fontSize: 14,
    color: "#999",
    fontStyle: "italic",
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingVertical: 10,
  },
  qtyBtn: {
    backgroundColor: "#fff",
    borderRadius: 25,
    width: 45,
    height: 45,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  qtyText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#2c3e50",
    marginHorizontal: 25,
  },
  addOnsContainer: {
    marginTop: 10,
  },
  addOnItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "transparent",
  },
  addOnItemSelected: {
    backgroundColor: "#FF6B6B10",
    borderColor: "#FF6B6B",
  },
  addOnLeft: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  addOnIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#FF6B6B20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  addOnIconSelected: {
    backgroundColor: "#FF6B6B",
  },
  addOnInfo: {
    flex: 1,
  },
  addOnName: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
    marginBottom: 2,
  },
  addOnNameSelected: {
    color: "#FF6B6B",
    fontWeight: "600",
  },
  addOnPrice: {
    fontSize: 14,
    color: "#FF6B6B",
    fontWeight: "600",
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#ddd",
    alignItems: "center",
    justifyContent: "center",
  },
  checkboxSelected: {
    backgroundColor: "#4CAF50",
    borderColor: "#4CAF50",
  },
  deliveryOptions: {
    flexDirection: "row",
    marginBottom: 15,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginRight: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "transparent",
  },
  deliveryOptionActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  deliveryOptionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "600",
    color: "#FF6B6B",
  },
  deliveryOptionTextActive: {
    color: "#fff",
  },
  timeInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderRadius: 8,
  },
  estimatedTime: {
    fontSize: 14,
    color: "#7f8c8d",
    marginLeft: 5,
    fontStyle: "italic",
  },
  shipContainer: {
    marginTop: 15,
    padding: 15,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  shipTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 10,
  },
  locationOptions: {
    flexDirection: "row",
    marginBottom: 15,
  },
  locationOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginRight: 5,
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  locationOptionActive: {
    backgroundColor: "#FF6B6B",
    borderColor: "#FF6B6B",
  },
  locationOptionText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: "500",
    color: "#FF6B6B",
  },
  locationOptionTextActive: {
    color: "#fff",
  },
  customLocationInput: {
    backgroundColor: "#fff",
    borderRadius: 8,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 14,
    color: "#2c3e50",
    borderWidth: 1,
    borderColor: "#e9ecef",
    marginBottom: 10,
  },
  shipFeeContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
  },
  shipFeeIcon: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: "#FF6B6B20",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
  },
  shipFeeText: {
    fontSize: 15,
    color: "#2c3e50",
  },
  shipFeeAmount: {
    color: "#FF6B6B",
    fontWeight: "bold",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#2c3e50",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  noteInput: {
    height: 80,
    textAlignVertical: "top",
  },
  discountContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  discountInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  discountText: {
    marginLeft: 8,
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  paymentMethods: {
    marginTop: 10,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: "#f8f9fa",
    borderWidth: 2,
    borderColor: "transparent",
  },
  paymentMethodActive: {
    backgroundColor: "#4CAF5010",
    borderColor: "#4CAF50",
  },
  paymentIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  paymentMethodText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#2c3e50",
    flex: 1,
  },
  paymentMethodTextActive: {
    color: "#4CAF50",
    fontWeight: "600",
  },
  qrContainer: {
    alignItems: "center",
    marginTop: 20,
    padding: 20,
    backgroundColor: "#f8f9fa",
    borderRadius: 12,
  },
  qrTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 15,
    color: "#2c3e50",
  },
  qrImageContainer: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 3,
  },
  qrImage: {
    width: 180,
    height: 180,
  },
  qrNote: {
    fontSize: 13,
    color: "#7f8c8d",
    marginTop: 10,
    textAlign: "center",
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 15,
    elevation: 8,
    overflow: "hidden",
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
    padding: 20,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 8,
  },
  summaryContent: {
    padding: 20,
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
  orderBtn: {
    borderRadius: 16,
    overflow: "hidden",
    marginBottom: 20,
    shadowColor: "#FF6B6B",
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  orderBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 24,
  },
  orderBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    backgroundColor: "#FF6B6B",
  },
  loadingText: {
    color: "#fff",
    marginLeft: 10,
    fontSize: 16,
    fontWeight: "500",
  },
  errorText: {
    color: "#FF6B6B",
    textAlign: "center",
    marginTop: 10,
    fontSize: 14,
    fontWeight: "500",
  },
});

export default OrderScreen;
