import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";

export default function ProfileScreen() {
  const navigation = useNavigation() as any;
  // Dữ liệu mẫu cho sinh viên
  const user = {
    name: "Đoàn Thế Anh",
    email: "vana@student.hust.edu.vn",
    studentId: "20210001",
    avatar: require("../assets/images/icon.png"),
    balance: 125000, // Số dư ví
    totalOrders: 47,
    favoriteCount: 12,
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const menuItems = [
    {
      id: 1,
      title: "Lịch sử đặt hàng",
      icon: "time-outline",
      color: "#4CAF50",
      badge: user.totalOrders,
    },
    {
      id: 2,
      title: "Món yêu thích",
      icon: "heart-outline",
      color: "#E91E63",
      badge: user.favoriteCount,
    },
    {
      id: 3,
      title: "Ví điện tử",
      icon: "wallet-outline",
      color: "#FF9800",
      subtitle: formatCurrency(user.balance),
    },
    {
      id: 4,
      title: "Thông báo",
      icon: "notifications-outline",
      color: "#2196F3",
    },
    { id: 5, title: "Cài đặt", icon: "settings-outline", color: "#9C27B0" },
    { id: 6, title: "Hỗ trợ", icon: "help-circle-outline", color: "#607D8B" },
    {
      id: 7,
      title: "Theo dõi dinh dưỡng",
      icon: "nutrition-outline",
      color: "#4CAF50",
    },
  ];

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#667eea" />

      {/* Header với gradient */}
      <LinearGradient
        colors={["#667eea", "#764ba2"]}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      >
        <View style={styles.headerContent}>
          <View style={styles.avatarContainer}>
            <Image source={user.avatar} style={styles.avatar} />
            <View style={styles.onlineIndicator} />
          </View>

          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.studentId}>MSSV: {user.studentId}</Text>
          <Text style={styles.email}>{user.email}</Text>

          {/* Stats Cards */}
          <View style={styles.statsContainer}>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.totalOrders}</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>{user.favoriteCount}</Text>
              <Text style={styles.statLabel}>Yêu thích</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statNumber}>
                {formatCurrency(user.balance)}
              </Text>
              <Text style={styles.statLabel}>Số dư</Text>
            </View>
          </View>
        </View>
      </LinearGradient>

      {/* Menu Items */}
      <ScrollView
        style={styles.menuContainer}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Tài khoản</Text>

          {menuItems.slice(0, 3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.id === 1) navigation.navigate("OrderHistory");
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.color}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
                {item.subtitle && (
                  <Text style={styles.menuSubtitle}>{item.subtitle}</Text>
                )}
              </View>
              {item.badge && (
                <View style={[styles.badge, { backgroundColor: item.color }]}>
                  <Text style={styles.badgeText}>{item.badge}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={20} color="#C5C5C7" />
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.menuSection}>
          <Text style={styles.sectionTitle}>Khác</Text>

          {menuItems.slice(3).map((item) => (
            <TouchableOpacity
              key={item.id}
              style={styles.menuItem}
              onPress={() => {
                if (item.id === 4) navigation.navigate("Notification");
                if (item.id === 5) navigation.navigate("Settings");
                if (item.id === 6) navigation.navigate("Support");
                if (item.id === 7) navigation.navigate("Nutrition");
              }}
            >
              <View
                style={[
                  styles.iconContainer,
                  { backgroundColor: `${item.color}15` },
                ]}
              >
                <Ionicons
                  name={item.icon as any}
                  size={24}
                  color={item.color}
                />
              </View>
              <View style={styles.menuContent}>
                <Text style={styles.menuTitle}>{item.title}</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#C5C5C7" />
            </TouchableOpacity>
          ))}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionSection}>
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => navigation.navigate("EditProfile")}
          >
            <Ionicons name="create-outline" size={22} color="#667eea" />
            <Text style={styles.editButtonText}>Chỉnh sửa thông tin</Text>
          </TouchableOpacity>
        </View>
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
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
  },
  headerContent: {
    alignItems: "center",
    paddingHorizontal: 20,
  },
  avatarContainer: {
    position: "relative",
    marginBottom: 16,
  },
  avatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 4,
    borderColor: "#fff",
  },
  onlineIndicator: {
    position: "absolute",
    bottom: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#4CAF50",
    borderWidth: 3,
    borderColor: "#fff",
  },
  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 4,
  },
  studentId: {
    fontSize: 16,
    color: "#E8E8E8",
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: "#D0D0D0",
    marginBottom: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    width: "100%",
  },
  statCard: {
    alignItems: "center",
    backgroundColor: "rgba(255, 255, 255, 0.1)",
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 15,
    minWidth: 80,
  },
  statNumber: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#fff",
  },
  statLabel: {
    fontSize: 12,
    color: "#E8E8E8",
    marginTop: 2,
  },
  menuContainer: {
    flex: 1,
    paddingTop: 20,
  },
  menuSection: {
    marginBottom: 25,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
    marginBottom: 15,
    marginLeft: 5,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderRadius: 15,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconContainer: {
    width: 45,
    height: 45,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  menuSubtitle: {
    fontSize: 14,
    color: "#4CAF50",
    fontWeight: "600",
    marginTop: 2,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginRight: 10,
  },
  badgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  actionSection: {
    paddingHorizontal: 20,
    paddingBottom: 30,
  },
  editButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 15,
    marginBottom: 15,
    borderWidth: 2,
    borderColor: "#667eea",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  editButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#667eea",
    marginLeft: 10,
  },
  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#E74C3C",
    paddingVertical: 16,
    borderRadius: 15,
    shadowColor: "#E74C3C",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  logoutButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#fff",
    marginLeft: 10,
  },
});
