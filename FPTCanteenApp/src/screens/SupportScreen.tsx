import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Alert,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";

export default function SupportScreen({ navigation }: any) {
  const supportOptions = [
    {
      id: "faq",
      title: "Câu hỏi thường gặp",
      subtitle: "Tìm câu trả lời cho các vấn đề phổ biến",
      icon: "help-circle-outline",
      color: "#4CAF50",
      onPress: () => Alert.alert("FAQ", "Tính năng đang phát triển"),
    },
    {
      id: "contact",
      title: "Liên hệ hỗ trợ",
      subtitle: "Chat với nhân viên hỗ trợ",
      icon: "chatbubbles-outline",
      color: "#2196F3",
      onPress: () => Alert.alert("Liên hệ", "Tính năng đang phát triển"),
    },
    {
      id: "report",
      title: "Báo cáo lỗi",
      subtitle: "Gửi báo cáo khi gặp vấn đề",
      icon: "bug-outline",
      color: "#FF5722",
      onPress: () => Alert.alert("Báo cáo lỗi", "Tính năng đang phát triển"),
    },
    {
      id: "guide",
      title: "Hướng dẫn sử dụng",
      subtitle: "Xem hướng dẫn chi tiết",
      icon: "book-outline",
      color: "#9C27B0",
      onPress: () => Alert.alert("Hướng dẫn", "Tính năng đang phát triển"),
    },
    {
      id: "feedback",
      title: "Góp ý ứng dụng",
      subtitle: "Đóng góp ý kiến cải thiện",
      icon: "bulb-outline",
      color: "#FF9800",
      onPress: () => Alert.alert("Góp ý", "Tính năng đang phát triển"),
    },
    {
      id: "hotline",
      title: "Hotline khẩn cấp",
      subtitle: "Gọi ngay: 1900-xxxx",
      icon: "call-outline",
      color: "#E91E63",
      onPress: () => {
        Alert.alert("Gọi hotline", "Bạn có muốn gọi hotline hỗ trợ?", [
          { text: "Hủy", style: "cancel" },
          { text: "Gọi", onPress: () => Linking.openURL("tel:19000000") },
        ]);
      },
    },
  ];

  const quickHelp = [
    {
      title: "Không thể đặt hàng?",
      answer: "Kiểm tra kết nối mạng và số dư tài khoản của bạn.",
    },
    {
      title: "Đơn hàng bị hủy?",
      answer: "Liên hệ hotline để được hỗ trợ và hoàn tiền nếu cần.",
    },
    {
      title: "Quên mật khẩu?",
      answer: "Sử dụng tính năng quên mật khẩu hoặc liên hệ hỗ trợ.",
    },
  ];

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Hỗ trợ</Text>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Các tùy chọn hỗ trợ chính */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Dịch vụ hỗ trợ</Text>
          <View style={styles.optionsGrid}>
            {supportOptions.map((option) => (
              <TouchableOpacity
                key={option.id}
                style={styles.optionCard}
                onPress={option.onPress}
              >
                <View
                  style={[
                    styles.optionIcon,
                    { backgroundColor: option.color + "22" },
                  ]}
                >
                  <Ionicons
                    name={option.icon as any}
                    size={28}
                    color={option.color}
                  />
                </View>
                <Text style={styles.optionTitle}>{option.title}</Text>
                <Text style={styles.optionSubtitle}>{option.subtitle}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Hỗ trợ nhanh */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Hỗ trợ nhanh</Text>
          <View style={styles.quickHelpContainer}>
            {quickHelp.map((item, index) => (
              <View key={index} style={styles.quickHelpItem}>
                <View style={styles.questionBox}>
                  <Ionicons name="help-circle" size={20} color="#667eea" />
                  <Text style={styles.questionText}>{item.title}</Text>
                </View>
                <Text style={styles.answerText}>{item.answer}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Thông tin liên hệ */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.contactInfo}>
            <View style={styles.contactItem}>
              <Ionicons name="time-outline" size={20} color="#667eea" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Thời gian làm việc</Text>
                <Text style={styles.contactValue}>
                  7:00 - 22:00 (Thứ 2 - Chủ nhật)
                </Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="mail-outline" size={20} color="#667eea" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Email hỗ trợ</Text>
                <Text style={styles.contactValue}>support@fptcanteen.com</Text>
              </View>
            </View>
            <View style={styles.contactItem}>
              <Ionicons name="location-outline" size={20} color="#667eea" />
              <View style={styles.contactText}>
                <Text style={styles.contactLabel}>Địa chỉ</Text>
                <Text style={styles.contactValue}>
                  Căng tin FPT, Tòa FPT, Hà Nội
                </Text>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}

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
  content: {
    flex: 1,
    padding: 20,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 16,
  },
  optionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  optionCard: {
    width: "48%",
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  optionIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  optionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    textAlign: "center",
    marginBottom: 4,
  },
  optionSubtitle: {
    fontSize: 12,
    color: "#666",
    textAlign: "center",
  },
  quickHelpContainer: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  quickHelpItem: {
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  questionBox: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  questionText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginLeft: 8,
    flex: 1,
  },
  answerText: {
    fontSize: 13,
    color: "#666",
    marginLeft: 28,
  },
  contactInfo: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  contactItem: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  contactText: {
    flex: 1,
    marginLeft: 12,
  },
  contactLabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 2,
  },
  contactValue: {
    fontSize: 13,
    color: "#666",
  },
});
