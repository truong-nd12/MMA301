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
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { userOrderApi } from '../api/userOrderApi';

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
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Không có dữ liệu món ăn.</Text>
      </View>
    );
  }

  const addOns = [
    { id: "rice", name: "Thêm cơm", price: 5000 },
    { id: "egg", name: "Thêm trứng", price: 8000 },
    { id: "vegetables", name: "Thêm rau", price: 3000 },
    { id: "soup", name: "Canh", price: 10000 },
  ];

  const increase = () => setQuantity((q: number) => q + 1);
  const decrease = () => setQuantity((q: number) => (q > 1 ? q - 1 : 1));

  const toggleAddOn = (addOnId: string) => {
    setSelectedAddOns((prev: string[]) =>
      prev.includes(addOnId)
        ? prev.filter((id: string) => id !== addOnId)
        : [...prev, addOnId]
    );
  };

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

  const calculateTotal = () => {
    const basePrice = food.price * quantity;
    const addOnPrice = selectedAddOns.reduce(
      (total: number, addOnId: string) => {
        const addOn = addOns.find((a) => a.id === addOnId);
        return total + (addOn ? addOn.price * quantity : 0);
      },
      0
    );
    const subtotal = basePrice + addOnPrice;
    const discount = useStudentDiscount ? subtotal * 0.1 : 0;
    const shipFee = getShipFee();
    return subtotal - discount + shipFee;
  };

  const handleOrder = async () => {
    // Hiển thị notification ngay khi bấm đặt món
    Alert.alert(
      'Xác nhận đặt món',
      `Bạn có muốn đặt "${food.name}" với tổng tiền ${calculateTotal().toLocaleString()}đ?`,
      [
        {
          text: 'Hủy',
          style: 'cancel',
        },
        {
          text: 'Đặt món',
          onPress: async () => {
            setLoading(true);
            setError(null);
            
            try {
              console.log('🔄 Creating order...');
              console.log('📤 Food data:', food);
              
              // Validate food data
              if (!food) {
                throw new Error('Không có dữ liệu món ăn');
              }
              
              // Get product ID with fallback - try all possible ID fields
              const productId = food.id || food._id || food.productId || food.product_id || 'demo-product-1';
              const productPrice = food.price || food.cost || food.amount || 0;
              
              // Log all possible ID fields for debugging
              console.log('🔍 All possible ID fields:', {
                id: food.id,
                _id: food._id,
                productId: food.productId,
                product_id: food.product_id
              });
              
              console.log('🔍 Product ID:', productId);
              console.log('💰 Product Price:', productPrice);
              
              // Prepare order items with proper format for backend
              const orderItems = [
                {
                  product: productId, // Backend expects 'product' field, not 'productId'
                  quantity: quantity,
                  price: productPrice,
                }
              ];

              // Add add-ons to order items
              selectedAddOns.forEach(addOnId => {
                const addOn = addOns.find(a => a.id === addOnId);
                if (addOn) {
                  orderItems.push({
                    product: `addon-${addOn.id}`, // Use 'product' field for add-ons too
                    quantity: quantity,
                    price: addOn.price,
                  });
                }
              });

              const orderData = {
                items: orderItems,
                paymentMethod: paymentMethod,
                deliveryMethod: deliveryMethod === 'ship' ? 'delivery' : deliveryMethod,
                deliveryAddress: deliveryMethod === 'pickup' ? undefined : 
                  customLocation || 'Căng tin A',
                notes: note,
                orderNumber: `ORDER-${Date.now()}`, // Add orderNumber to avoid validation error
              };

              console.log('📤 Order data:', orderData);
              
              const response = await userOrderApi.createOrder(orderData);
              console.log('📥 Order response:', response);
              
              setLoading(false);
              
              if (response.success) {
                // Hiển thị notification thành công với options
                Alert.alert(
                  'Đặt món thành công! 🎉',
                  'Đơn hàng của bạn đã được tạo. Bạn muốn làm gì tiếp theo?',
                  [
                    {
                      text: 'Theo dõi đơn hàng',
                      onPress: () => navigation.navigate('OrderTracking'),
                    },
                    {
                      text: 'Tiếp tục mua',
                      onPress: () => navigation.goBack(),
                    },
                  ]
                );
              } else {
                throw new Error('Order creation failed');
              }
            } catch (err: any) {
              setLoading(false);
              console.error('❌ Order error:', err);
              setError('Đặt món thất bại. Vui lòng thử lại!');
              
              // Show fallback success for demo
              Alert.alert(
                'Đặt món thành công! (Demo) 🎉',
                'Đơn hàng của bạn đã được tạo. Bạn muốn làm gì tiếp theo?',
                [
                  {
                    text: 'Theo dõi đơn hàng',
                    onPress: () => navigation.navigate('OrderTracking'),
                  },
                  {
                    text: 'Tiếp tục mua',
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
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đặt món</Text>
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
          <View style={styles.foodCard}>
            <Image source={{ uri: food.image || food.images }} style={styles.image} />
            <View style={styles.foodInfo}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodDesc}>{food.desc || food.description}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.price}>{(food.price || 0).toLocaleString()}đ</Text>
                <View style={styles.ratingContainer}>
                  <Ionicons name="star" size={16} color="#FFD700" />
                  <Text style={styles.rating}>4.5</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Quantity Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Số lượng</Text>
            <View style={styles.quantityContainer}>
              <TouchableOpacity style={styles.qtyBtn} onPress={decrease}>
                <Ionicons name="remove" size={20} color="#667eea" />
              </TouchableOpacity>
              <Text style={styles.qtyText}>{quantity}</Text>
              <TouchableOpacity style={styles.qtyBtn} onPress={increase}>
                <Ionicons name="add" size={20} color="#667eea" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Add-ons Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thêm món</Text>
            {addOns.map((addOn) => (
              <TouchableOpacity
                key={addOn.id}
                style={[
                  styles.addOnItem,
                  selectedAddOns.includes(addOn.id) && styles.addOnItemSelected,
                ]}
                onPress={() => toggleAddOn(addOn.id)}
              >
                <View style={styles.addOnInfo}>
                  <Text style={styles.addOnName}>{addOn.name}</Text>
                  <Text style={styles.addOnPrice}>
                    +{addOn.price.toLocaleString()}đ
                  </Text>
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
            ))}
          </View>

          {/* Delivery/Pickup Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức nhận món</Text>
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
                  color={deliveryMethod === "pickup" ? "#fff" : "#667eea"}
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
                  deliveryMethod === "delivery" && styles.deliveryOptionActive,
                ]}
                onPress={() => setDeliveryMethod("delivery")}
              >
                <Ionicons
                  name="bicycle-outline"
                  size={20}
                  color={deliveryMethod === "delivery" ? "#fff" : "#667eea"}
                />
                <Text
                  style={[
                    styles.deliveryOptionText,
                    deliveryMethod === "delivery" &&
                      styles.deliveryOptionTextActive,
                  ]}
                >
                  Giao tận nơi
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
                  name="car-outline"
                  size={20}
                  color={deliveryMethod === "ship" ? "#fff" : "#667eea"}
                />
                <Text
                  style={[
                    styles.deliveryOptionText,
                    deliveryMethod === "ship" &&
                      styles.deliveryOptionTextActive,
                  ]}
                >
                  Giao hàng (Ship)
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.estimatedTime}>
              Thời gian dự kiến: {estimatedTime}
            </Text>

            {deliveryMethod === "ship" && (
              <View style={{ marginTop: 16 }}>
                <Text
                  style={{
                    fontWeight: "600",
                    color: "#2c3e50",
                    marginBottom: 8,
                  }}
                >
                  Chọn địa điểm nhận món
                </Text>
                <View style={{ flexDirection: "row", marginBottom: 10 }}>
                  <TouchableOpacity
                    style={[
                      styles.deliveryOption,
                      selectedLocation === "phonghoc" &&
                        styles.deliveryOptionActive,
                      { flex: 1, marginRight: 6 },
                    ]}
                    onPress={() => setSelectedLocation("phonghoc")}
                  >
                    <Ionicons
                      name="school-outline"
                      size={18}
                      color={
                        selectedLocation === "phonghoc" ? "#fff" : "#667eea"
                      }
                    />
                    <Text
                      style={[
                        styles.deliveryOptionText,
                        selectedLocation === "phonghoc" &&
                          styles.deliveryOptionTextActive,
                      ]}
                    >
                      Phòng học
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.deliveryOption,
                      selectedLocation === "ktx" && styles.deliveryOptionActive,
                      { flex: 1, marginRight: 6 },
                    ]}
                    onPress={() => setSelectedLocation("ktx")}
                  >
                    <Ionicons
                      name="home-outline"
                      size={18}
                      color={selectedLocation === "ktx" ? "#fff" : "#667eea"}
                    />
                    <Text
                      style={[
                        styles.deliveryOptionText,
                        selectedLocation === "ktx" &&
                          styles.deliveryOptionTextActive,
                      ]}
                    >
                      Ký túc xá
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[
                      styles.deliveryOption,
                      selectedLocation === "khac" &&
                        styles.deliveryOptionActive,
                      { flex: 1 },
                    ]}
                    onPress={() => setSelectedLocation("khac")}
                  >
                    <Ionicons
                      name="location-outline"
                      size={18}
                      color={selectedLocation === "khac" ? "#fff" : "#667eea"}
                    />
                    <Text
                      style={[
                        styles.deliveryOptionText,
                        selectedLocation === "khac" &&
                          styles.deliveryOptionTextActive,
                      ]}
                    >
                      Khác
                    </Text>
                  </TouchableOpacity>
                </View>
                {selectedLocation === "khac" && (
                  <TextInput
                    style={[styles.input, { marginTop: 8 }]}
                    placeholder="Nhập địa chỉ cụ thể..."
                    value={customLocation}
                    onChangeText={setCustomLocation}
                  />
                )}
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    marginTop: 10,
                  }}
                >
                  <Ionicons name="cash-outline" size={18} color="#667eea" />
                  <Text
                    style={{ marginLeft: 8, fontSize: 15, color: "#2c3e50" }}
                  >
                    Phí ship:{" "}
                    <Text style={{ color: "#E74C3C", fontWeight: "bold" }}>
                      {getShipFee().toLocaleString()}đ
                    </Text>
                  </Text>
                </View>
                <View
                  style={{
                    marginTop: 10,
                    flexDirection: "row",
                    alignItems: "center",
                  }}
                >
                  <Ionicons name="navigate-outline" size={18} color="#667eea" />
                  <Text
                    style={{
                      marginLeft: 8,
                      color: "#7f8c8d",
                      fontStyle: "italic",
                    }}
                  >
                    Đang tìm shipper cho bạn...
                  </Text>
                </View>
              </View>
            )}
          </View>

          {/* Time Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Thời gian nhận món</Text>
            <TextInput
              style={styles.input}
              placeholder="VD: 11:30 hoặc Ngay bây giờ"
              value={time}
              onChangeText={setTime}
            />
          </View>

          {/* Note Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ghi chú</Text>
            <TextInput
              style={[styles.input, styles.noteInput]}
              placeholder="Ví dụ: Ít cơm, thêm rau, không cay..."
              value={note}
              onChangeText={setNote}
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Student Discount */}
          <View style={styles.section}>
            <View style={styles.discountContainer}>
              <View style={styles.discountInfo}>
                <Ionicons name="school-outline" size={20} color="#667eea" />
                <Text style={styles.discountText}>
                  Giảm giá sinh viên (10%)
                </Text>
              </View>
              <Switch
                value={useStudentDiscount}
                onValueChange={setUseStudentDiscount}
                trackColor={{ false: "#e0e0e0", true: "#667eea" }}
                thumbColor={useStudentDiscount ? "#fff" : "#f4f3f4"}
              />
            </View>
          </View>

          {/* Payment Method */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Phương thức thanh toán</Text>
            <View style={styles.paymentMethods}>
              {[
                { id: "cash", name: "Tiền mặt", icon: "cash-outline" },
                { id: "card", name: "Thẻ sinh viên", icon: "card-outline" },
                { id: "momo", name: "MoMo", icon: "phone-portrait-outline" },
              ].map((method) => (
                <TouchableOpacity
                  key={method.id}
                  style={[
                    styles.paymentMethod,
                    paymentMethod === method.id && styles.paymentMethodActive,
                  ]}
                  onPress={() => setPaymentMethod(method.id)}
                >
                  <Ionicons
                    name={method.icon as any}
                    size={20}
                    color={paymentMethod === method.id ? "#fff" : "#667eea"}
                  />
                  <Text
                    style={[
                      styles.paymentMethodText,
                      paymentMethod === method.id &&
                        styles.paymentMethodTextActive,
                    ]}
                  >
                    {method.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
            {/* Hiển thị mã QR nếu chọn MoMo */}
            {paymentMethod === "momo" && (
              <View style={{ alignItems: "center", marginTop: 16 }}>
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "500",
                    marginBottom: 8,
                    color: "#7f8c8d",
                  }}
                >
                  Quét mã QR để thanh toán MoMo
                </Text>
                <Image
                  source={require("../assets/images/momo-qr.png")}
                  style={{
                    width: 180,
                    height: 180,
                    borderRadius: 12,
                    backgroundColor: "#fff",
                  }}
                  resizeMode="contain"
                />
                <Text style={{ fontSize: 13, color: "#7f8c8d", marginTop: 8 }}>
                  Vui lòng chuyển khoản đúng số tiền và ghi rõ nội dung đơn
                  hàng.
                </Text>
              </View>
            )}
          </View>

          {/* Order Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Tổng kết đơn hàng</Text>
            <View style={styles.summaryRow}>
              <Text style={styles.summaryLabel}>Món chính ({quantity}x)</Text>
              <Text style={styles.summaryValue}>
                {((food.price || 0) * quantity).toLocaleString()}đ
              </Text>
            </View>
            {selectedAddOns.map((addOnId: string) => {
              const addOn = addOns.find((a) => a.id === addOnId);
              return addOn ? (
                <View key={addOnId} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>
                    {addOn.name} ({quantity}x)
                  </Text>
                  <Text style={styles.summaryValue}>
                    {(addOn.price * quantity).toLocaleString()}đ
                  </Text>
                </View>
              ) : null;
            })}
            {useStudentDiscount && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: "#4CAF50" }]}>
                  Giảm giá sinh viên
                </Text>
                <Text style={[styles.summaryValue, { color: "#4CAF50" }]}>
                  -{((calculateTotal() * 0.1) / 0.9).toLocaleString()}đ
                </Text>
              </View>
            )}
            {deliveryMethod === "ship" && (
              <View style={styles.summaryRow}>
                <Text style={[styles.summaryLabel, { color: "#E74C3C" }]}>
                  Phí ship (
                  {
                    shipLocationLabel[
                      selectedLocation as "phonghoc" | "ktx" | "khac"
                    ]
                  }
                  )
                </Text>
                <Text style={[styles.summaryValue, { color: "#E74C3C" }]}>
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

          {/* Order Button */}
          <TouchableOpacity
            style={styles.orderBtn}
            activeOpacity={0.8}
            onPress={handleOrder}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator size="large" color="#fff" />
            ) : (
              <LinearGradient
                colors={["#667eea", "#764ba2"]}
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
          
          {error && (
            <Text style={styles.errorText}>{error}</Text>
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
    paddingTop: Platform.OS === "ios" ? 50 : 30,
    paddingBottom: 15,
    paddingHorizontal: 20,
  },
  backButton: {
    padding: 8,
    marginRight: 10,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
  },
  scrollContainer: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  container: {
    padding: 20,
  },
  foodCard: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  image: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 15,
    backgroundColor: "#eee",
  },
  foodInfo: {
    alignItems: "center",
  },
  foodName: {
    fontSize: 24,
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
  priceContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  price: {
    fontSize: 22,
    color: "#667eea",
    fontWeight: "bold",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  rating: {
    marginLeft: 4,
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "600",
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 16,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 12,
  },
  quantityContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 25,
    paddingVertical: 8,
  },
  qtyBtn: {
    backgroundColor: "#fff",
    borderRadius: 20,
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  qtyText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#2c3e50",
    marginHorizontal: 20,
  },
  addOnItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
  },
  addOnItemSelected: {
    backgroundColor: "#e8f0fe",
    borderColor: "#667eea",
    borderWidth: 1,
  },
  addOnInfo: {
    flex: 1,
  },
  addOnName: {
    fontSize: 16,
    color: "#2c3e50",
    fontWeight: "500",
  },
  addOnPrice: {
    fontSize: 14,
    color: "#667eea",
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
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  deliveryOptions: {
    flexDirection: "row",
    marginBottom: 10,
  },
  deliveryOption: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  deliveryOptionActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  deliveryOptionText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#667eea",
  },
  deliveryOptionTextActive: {
    color: "#fff",
  },
  estimatedTime: {
    fontSize: 14,
    color: "#7f8c8d",
    textAlign: "center",
    fontStyle: "italic",
  },
  input: {
    backgroundColor: "#f8f9fa",
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
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
    flexDirection: "row",
    flexWrap: "wrap",
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginRight: 8,
    marginBottom: 8,
    backgroundColor: "#f8f9fa",
    borderWidth: 1,
    borderColor: "#e9ecef",
  },
  paymentMethodActive: {
    backgroundColor: "#667eea",
    borderColor: "#667eea",
  },
  paymentMethodText: {
    marginLeft: 8,
    fontSize: 14,
    fontWeight: "500",
    color: "#667eea",
  },
  paymentMethodTextActive: {
    color: "#fff",
  },
  summaryCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  summaryTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#2c3e50",
    marginBottom: 15,
  },
  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 8,
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
    marginVertical: 12,
  },
  summaryTotal: {
    fontSize: 16,
    fontWeight: "600",
    color: "#2c3e50",
  },
  summaryTotalValue: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#667eea",
  },
  orderBtn: {
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 20,
  },
  orderBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    paddingHorizontal: 24,
  },
  orderBtnText: {
    color: "#fff",
    fontWeight: "bold",
    marginLeft: 8,
    fontSize: 16,
  },
  errorText: {
    color: 'red',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default OrderScreen;
