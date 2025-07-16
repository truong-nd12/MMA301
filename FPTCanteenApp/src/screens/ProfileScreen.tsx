import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { LinearGradient } from "expo-linear-gradient";
import * as Animatable from "react-native-animatable";
import * as Haptics from "expo-haptics";
import {
  Image,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Alert,
  RefreshControl,
  Dimensions,
} from "react-native";
import { useAuth } from "../context/AuthContext";
import { useState } from "react";

const { width } = Dimensions.get("window");

export default function ProfileScreen() {
  const navigation = useNavigation() as any;
  const { user, logout } = useAuth();
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for demo (sẽ được thay thế bằng data thật từ API sau)
  const mockData = {
    avatar: require("../assets/images/icon.png"),
    balance: 125000, // Số dư ví
    totalOrders: 47,
    favoriteCount: 12,
    points: 850, // Điểm tích lũy
    level: "VIP", // Cấp độ thành viên
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    // Simulate API call
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  const handleLogout = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    Alert.alert("Đăng xuất", "Bạn có chắc chắn muốn đăng xuất?", [
      {
        text: "Hủy",
        style: "cancel",
      },
      {
        text: "Đăng xuất",
        style: "destructive",
        onPress: async () => {
          try {
            await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
            await logout();
            // Navigation sẽ tự động chuyển về AuthStack
          } catch (error) {
            Alert.alert("Lỗi", "Có lỗi xảy ra khi đăng xuất");
          }
        },
      },
    ]);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const handleMenuPress = async (item: any) => {
    await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);

    switch (item.id) {
      case 1:
        navigation.navigate("OrderHistory");
        break;
      case 2:
        navigation.navigate("FavoriteFoods");
        break;
      case 3:
        navigation.navigate("Wallet");
        break;
      case 4:
        navigation.navigate("Notification");
        break;
      case 5:
        navigation.navigate("Settings");
        break;
      case 6:
        navigation.navigate("Support");
        break;
      case 7:
        navigation.navigate("Nutrition");
        break;
    }
  };

  const menuItems = [
    {
      id: 1,
      title: "Lịch sử đặt hàng",
      icon: "receipt-outline",
      color: "#FF6B6B",
      badge: mockData.totalOrders,
      description: "Xem tất cả đơn hàng",
    },
    {
      id: 2,
      title: "Món yêu thích",
      icon: "heart-outline",
      color: "#FF8E53",
      badge: user?.favorites?.length || mockData.favoriteCount,
      description: "Danh sách món ưa thích",
    },
    {
      id: 3,
      title: "Ví điện tử",
      icon: "wallet-outline",
      color: "#4ECDC4",
      subtitle: formatCurrency(mockData.balance),
      description: "Quản lý số dư",
    },
    {
      id: 4,
      title: "Thông báo",
      icon: "notifications-outline",
      color: "#45B7D1",
      description: "Cài đặt thông báo",
    },
    {
      id: 5,
      title: "Cài đặt",
      icon: "settings-outline",
      color: "#96CEB4",
      description: "Tùy chỉnh ứng dụng",
    },
    {
      id: 6,
      title: "Hỗ trợ",
      icon: "help-circle-outline",
      color: "#FFEAA7",
      description: "Liên hệ hỗ trợ",
    },
    {
      id: 7,
      title: "Theo dõi dinh dưỡng",
      icon: "nutrition-outline",
      color: "#DDA0DD",
      description: "Phân tích dinh dưỡng",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#FF6B6B" />

      {/* Header với gradient */}
      <Animatable.View animation="fadeIn" duration={1000}>
        <LinearGradient
          colors={["#FF6B6B", "#FF8E53"]}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        >
          <View style={styles.headerContent}>
            <Animatable.View
              animation="bounceIn"
              delay={300}
              style={styles.avatarContainer}
            >
              <Image
                source={user?.avatar ? { uri: user.avatar } : mockData.avatar}
                style={styles.avatar}
              />
              <View style={styles.onlineIndicator} />
              <View style={styles.levelBadge}>
                <Text style={styles.levelText}>{mockData.level}</Text>
              </View>
            </Animatable.View>

            <Animatable.Text
              animation="fadeInUp"
              delay={500}
              style={styles.name}
            >
              {user?.fullName || "Người dùng"}
            </Animatable.Text>
            <Animatable.Text
              animation="fadeInUp"
              delay={600}
              style={styles.studentId}
            >
              MSSV: {user?.studentCode || "N/A"}
            </Animatable.Text>
            <Animatable.Text
              animation="fadeInUp"
              delay={700}
              style={styles.email}
            >
              {user?.email || "N/A"}
            </Animatable.Text>

            {/* Enhanced Stats Cards */}
            <Animatable.View
              animation="fadeInUp"
              delay={800}
              style={styles.statsContainer}
            >
              <View style={styles.statCard}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="receipt-outline" size={24} color="#fff" />
                  <Text style={styles.statNumber}>{mockData.totalOrders}</Text>
                  <Text style={styles.statLabel}>Đơn hàng</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="heart-outline" size={24} color="#fff" />
                  <Text style={styles.statNumber}>
                    {user?.favorites?.length || mockData.favoriteCount}
                  </Text>
                  <Text style={styles.statLabel}>Yêu thích</Text>
                </LinearGradient>
              </View>

              <View style={styles.statCard}>
                <LinearGradient
                  colors={["rgba(255,255,255,0.2)", "rgba(255,255,255,0.1)"]}
                  style={styles.statCardGradient}
                >
                  <Ionicons name="star-outline" size={24} color="#fff" />
                  <Text style={styles.statNumber}>{mockData.points}</Text>
                  <Text style={styles.statLabel}>Điểm</Text>
                </LinearGradient>
              </View>
            </Animatable.View>
          </View>
        </LinearGradient>
      </Animatable.View>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
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
          animation="fadeInUp"
          delay={900}
          style={styles.menuSection}
        >
          <Text style={styles.sectionTitle}>💳 Tài khoản & Ví</Text>

          {menuItems.slice(0, 3).map((item, index) => (
            <Animatable.View
              key={item.id}
              animation="fadeInUp"
              delay={1000 + index * 100}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[`${item.color}20`, `${item.color}10`]}
                  style={styles.iconContainer}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={26}
                    color={item.color}
                  />
                </LinearGradient>

                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                  {item.subtitle && (
                    <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                  )}
                </View>

                {item.badge && (
                  <View style={[styles.badge, { backgroundColor: item.color }]}>
                    <Text style={styles.badgeText}>{item.badge}</Text>
                  </View>
                )}

                <View style={styles.chevronContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#C5C5C7" />
                </View>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </Animatable.View>

        <Animatable.View
          animation="fadeInUp"
          delay={1300}
          style={styles.menuSection}
        >
          <Text style={styles.sectionTitle}>⚙️ Tiện ích & Hỗ trợ</Text>

          {menuItems.slice(3).map((item, index) => (
            <Animatable.View
              key={item.id}
              animation="fadeInUp"
              delay={1400 + index * 100}
            >
              <TouchableOpacity
                style={styles.menuItem}
                onPress={() => handleMenuPress(item)}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={[`${item.color}20`, `${item.color}10`]}
                  style={styles.iconContainer}
                >
                  <Ionicons
                    name={item.icon as any}
                    size={26}
                    color={item.color}
                  />
                </LinearGradient>

                <View style={styles.menuContent}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>

                <View style={styles.chevronContainer}>
                  <Ionicons name="chevron-forward" size={20} color="#C5C5C7" />
                </View>
              </TouchableOpacity>
            </Animatable.View>
          ))}
        </Animatable.View>

        {/* Admin Mode Button - CHỈ HIỂN THỊ KHI USER LÀ ADMIN */}
        {user && user.role === "admin" && (
          <Animatable.View
            animation="fadeInUp"
            delay={1700}
            style={styles.menuSection}
          >
            <Text style={styles.sectionTitle}>👑 Quản trị viên</Text>
            <TouchableOpacity
              style={[styles.menuItem, styles.adminMenuItem]}
              onPress={async () => {
                await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                navigation.navigate("AdminSwitch");
              }}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={["#3498DB20", "#3498DB10"]}
                style={styles.iconContainer}
              >
                <Ionicons
                  name="shield-checkmark-outline"
                  size={26}
                  color="#3498DB"
                />
              </LinearGradient>

              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>Chế độ Admin</Text>
                <Text style={styles.menuDescription}>
                  Quản lý món ăn & thống kê
                </Text>
              </View>

              <View style={styles.adminBadge}>
                <Text style={styles.adminBadgeText}>ADMIN</Text>
              </View>

              <View style={styles.chevronContainer}>
                <Ionicons name="chevron-forward" size={20} color="#C5C5C7" />
              </View>
            </TouchableOpacity>
          </Animatable.View>
        )}

        {/* Action Buttons */}
        <Animatable.View
          animation="fadeInUp"
          delay={1800}
          style={styles.actionSection}
        >
          <TouchableOpacity
            style={styles.editButton}
            onPress={async () => {
              await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate("EditProfile");
            }}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF6B6B", "#FF8E53"]}
              style={styles.editButtonGradient}
            >
              <Ionicons name="create-outline" size={22} color="#fff" />
              <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.logoutButton}
            onPress={handleLogout}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={["#FF6B6B", "#E74C3C"]}
              style={styles.logoutButtonGradient}
            >
              <Ionicons name="log-out-outline" size={22} color="#fff" />
              <Text style={styles.logoutButtonText}>Đăng xuất</Text>
            </LinearGradient>
          </TouchableOpacity>
        </Animatable.View>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8faff",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 20,
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 5,
    borderColor: "#fff",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: "#4CAF50",
    borderWidth: 4,
    borderColor: "#fff",
  },
  levelBadge: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#FFD700",
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: "#fff",
  },
  levelText: {
    fontSize: 10,
    fontWeight: "bold",
    color: "#333",
  },
  name: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 6,
    textShadowColor: "rgba(0,0,0,0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  studentId: {
    fontSize: 16,
    color: "#E8E8E8",
    marginBottom: 4,
    fontWeight: "500",
  },
  email: {
    fontSize: 14,
    color: "#D0D0D0",
    marginBottom: 25,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
    paddingHorizontal: 10,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 5,
    borderRadius: 20,
    overflow: "hidden",
  },
  statCardGradient: {
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
  },
  statNumber: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 12,
    color: "#E8E8E8",
    fontWeight: "500",
  },
  menuContainer: {
    flex: 1,
    paddingTop: 25,
  },
  menuSection: {
    marginBottom: 30,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#333",
    marginBottom: 18,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 18,
    paddingHorizontal: 18,
    borderRadius: 20,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 5,
    borderWidth: 1,
    borderColor: "rgba(255,107,107,0.05)",
  },
  adminMenuItem: {
    borderWidth: 2,
    borderColor: "rgba(52, 152, 219, 0.2)",
  },
  iconContainer: {
    width: 50,
    height: 50,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 13,
    color: "#666",
    fontWeight: "400",
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#4ECDC4",
    fontWeight: "700",
    marginTop: 4,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 12,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "700",
  },
  adminBadge: {
    backgroundColor: "#3498DB",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 15,
    marginRight: 12,
  },
  adminBadgeText: {
    color: "#fff",
    fontSize: 10,
    fontWeight: "700",
  },
  chevronContainer: {
    padding: 4,
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  editButton: {
    borderRadius: 20,
    marginBottom: 15,
    shadowColor: "#FF6B6B",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  editButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
  logoutButton: {
    borderRadius: 20,
    shadowColor: "#E74C3C",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    overflow: "hidden",
  },
  logoutButtonGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 20,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
  bottomSpacer: {
    height: 20,
  },
});
