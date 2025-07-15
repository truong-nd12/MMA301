import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { userApi } from "../api/userApi";

// const notifications = [
//   {
//     id: "1",
//     type: "order",
//     title: "Đơn hàng đã hoàn thành",
//     content: "Đơn hàng #1234 của bạn đã được giao thành công. Cảm ơn bạn!",
//     time: "2 phút trước",
//     icon: "checkmark-done-circle-outline",
//     color: "#4CAF50",
//   },
//   {
//     id: "2",
//     type: "promo",
//     title: "Ưu đãi mới!",
//     content: "Nhận ngay voucher giảm 20% cho đơn hàng tiếp theo.",
//     time: "1 giờ trước",
//     icon: "gift-outline",
//     color: "#FF9800",
//   },
//   {
//     id: "3",
//     type: "system",
//     title: "Bảo trì hệ thống",
//     content: "Căng tin sẽ bảo trì từ 22:00 đến 23:00 hôm nay.",
//     time: "Hôm nay, 09:00",
//     icon: "information-circle-outline",
//     color: "#2196F3",
//   },
//   {
//     id: "4",
//     type: "feedback",
//     title: "Phản hồi đánh giá",
//     content:
//       "Cảm ơn bạn đã đánh giá món ăn. Chúng tôi sẽ cải thiện chất lượng phục vụ!",
//     time: "Hôm qua",
//     icon: "chatbubble-ellipses-outline",
//     color: "#9C27B0",
//   },
// ];

export default function NotificationScreen({ navigation }: any) {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNoti = async () => {
      try {
        const res = await userApi.getNotifications();
        setNotifications(res.notifications);
      } catch (err) {
        console.error("❌ Lỗi khi gọi API:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchNoti();
  }, []);

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Thông báo</Text>
      </LinearGradient>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} size="large" color="#764ba2" />
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.list}
          renderItem={({ item }) => (
            <View style={styles.card}>
              <View
                style={[
                  styles.iconBox,
                  {
                    backgroundColor:
                      getColorByType(item.type).bg,
                  },
                ]}
              >
                <Ionicons
                  name={getIconByType(item.type)}
                  size={28}
                  color={getColorByType(item.type).color}
                />
              </View>
              <View style={styles.contentBox}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.content}>{item.message}</Text>
                <Text style={styles.time}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
            </View>
          )}
          ListEmptyComponent={
            <Text style={styles.empty}>Không có thông báo nào</Text>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const getIconByType = (type: string): any => {
  switch (type) {
    case "order":
      return "checkmark-done-circle-outline";
    case "promotion":
      return "gift-outline";
    case "system":
      return "information-circle-outline";
    case "custom":
      return "notifications-outline";
    default:
      return "alert-circle-outline";
  }
};

const getColorByType = (type: string) => {
  switch (type) {
    case "order":
      return { color: "#4CAF50", bg: "#4CAF5022" };
    case "promotion":
      return { color: "#FF9800", bg: "#FF980022" };
    case "system":
      return { color: "#2196F3", bg: "#2196F322" };
    case "custom":
      return { color: "#9C27B0", bg: "#9C27B022" };
    default:
      return { color: "#607D8B", bg: "#607D8B22" };
  }
};
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f8f9fa" },
  header: {
    paddingTop: 50,
    paddingBottom: 30,
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    alignItems: "center",
    position: "relative",
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 20,
    padding: 6,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 10,
  },
  list: {
    padding: 20,
  },
  card: {
    flexDirection: "row",
    alignItems: "flex-start",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  contentBox: {
    flex: 1,
  },
  title: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 4,
  },
  content: {
    fontSize: 14,
    color: "#555",
    marginBottom: 6,
  },
  time: {
    fontSize: 12,
    color: "#999",
    textAlign: "right",
  },
  empty: {
    textAlign: "center",
    color: "#aaa",
    marginTop: 40,
    fontSize: 16,
  },
});
