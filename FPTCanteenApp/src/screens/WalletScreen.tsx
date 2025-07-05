import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput,
  Modal,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { Ionicons } from "@expo/vector-icons";
import WalletStats from "../components/WalletStats";

interface Transaction {
  id: string;
  type: "deposit" | "withdraw" | "payment" | "refund";
  amount: number;
  description: string;
  date: string;
  status: "completed" | "pending" | "failed";
  orderId?: string;
}

export default function WalletScreen({ navigation }: any) {
  const [balance, setBalance] = useState(125000);
  const [showTopUpModal, setShowTopUpModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [withdrawAmount, setWithdrawAmount] = useState("");
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("momo");

  // Dữ liệu mẫu giao dịch
  const [transactions] = useState<Transaction[]>([
    {
      id: "1",
      type: "payment",
      amount: -45000,
      description: "Thanh toán đơn hàng #12345",
      date: "2024-01-15 12:30",
      status: "completed",
      orderId: "12345",
    },
    {
      id: "2",
      type: "deposit",
      amount: 100000,
      description: "Nạp tiền qua MoMo",
      date: "2024-01-14 15:20",
      status: "completed",
    },
    {
      id: "3",
      type: "refund",
      amount: 25000,
      description: "Hoàn tiền đơn hàng #12340",
      date: "2024-01-13 09:15",
      status: "completed",
      orderId: "12340",
    },
    {
      id: "4",
      type: "payment",
      amount: -35000,
      description: "Thanh toán đơn hàng #12338",
      date: "2024-01-12 18:45",
      status: "completed",
      orderId: "12338",
    },
    {
      id: "5",
      type: "deposit",
      amount: 50000,
      description: "Nạp tiền qua thẻ sinh viên",
      date: "2024-01-11 10:30",
      status: "completed",
    },
  ]);

  // Tính toán thống kê sau khi transactions đã được khởi tạo
  const totalSpent = Math.abs(
    transactions
      .filter((t) => t.type === "payment")
      .reduce((sum, t) => sum + t.amount, 0)
  );
  const totalDeposited = transactions
    .filter((t) => t.type === "deposit")
    .reduce((sum, t) => sum + t.amount, 0);
  const totalWithdrawn = Math.abs(
    transactions
      .filter((t) => t.type === "withdraw")
      .reduce((sum, t) => sum + t.amount, 0)
  );

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return "add-circle";
      case "withdraw":
        return "remove-circle";
      case "payment":
        return "card";
      case "refund":
        return "refresh-circle";
      default:
        return "help-circle";
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type) {
      case "deposit":
      case "refund":
        return "#4CAF50";
      case "withdraw":
      case "payment":
        return "#F44336";
      default:
        return "#FF9800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return "#4CAF50";
      case "pending":
        return "#FF9800";
      case "failed":
        return "#F44336";
      default:
        return "#9E9E9E";
    }
  };

  const handleTopUp = () => {
    const amount = parseInt(topUpAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    Alert.alert(
      "Xác nhận nạp tiền",
      `Bạn có muốn nạp ${formatCurrency(amount)} vào ví?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Nạp tiền",
          onPress: () => {
            setBalance(balance + amount);
            setShowTopUpModal(false);
            setTopUpAmount("");
            Alert.alert("Thành công", "Đã nạp tiền vào ví!");
          },
        },
      ]
    );
  };

  const handleWithdraw = () => {
    const amount = parseInt(withdrawAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số tiền hợp lệ");
      return;
    }

    if (amount > balance) {
      Alert.alert("Lỗi", "Số dư không đủ để rút tiền");
      return;
    }

    Alert.alert(
      "Xác nhận rút tiền",
      `Bạn có muốn rút ${formatCurrency(amount)} từ ví?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Rút tiền",
          onPress: () => {
            setBalance(balance - amount);
            setShowWithdrawModal(false);
            setWithdrawAmount("");
            Alert.alert("Thành công", "Đã rút tiền từ ví!");
          },
        },
      ]
    );
  };

  const renderTransaction = (transaction: Transaction) => (
    <View key={transaction.id} style={styles.transactionCard}>
      <View style={styles.transactionHeader}>
        <View style={styles.transactionIcon}>
          <Ionicons
            name={getTransactionIcon(transaction.type) as any}
            size={24}
            color={getTransactionColor(transaction.type)}
          />
        </View>
        <View style={styles.transactionInfo}>
          <Text style={styles.transactionDescription}>
            {transaction.description}
          </Text>
          <Text style={styles.transactionDate}>{transaction.date}</Text>
        </View>
        <View style={styles.transactionAmount}>
          <Text
            style={[
              styles.amountText,
              { color: getTransactionColor(transaction.type) },
            ]}
          >
            {transaction.amount > 0 ? "+" : ""}
            {formatCurrency(transaction.amount)}
          </Text>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: getStatusColor(transaction.status) + "20" },
            ]}
          >
            <Text
              style={[
                styles.statusText,
                { color: getStatusColor(transaction.status) },
              ]}
            >
              {transaction.status === "completed" && "Hoàn thành"}
              {transaction.status === "pending" && "Đang xử lý"}
              {transaction.status === "failed" && "Thất bại"}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Ví điện tử</Text>
        <TouchableOpacity style={styles.moreButton}>
          <Ionicons name="ellipsis-vertical" size={24} color="#fff" />
        </TouchableOpacity>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Balance Card */}
        <View style={styles.balanceCard}>
          <LinearGradient
            colors={["#4CAF50", "#45a049"]}
            style={styles.balanceGradient}
          >
            <Text style={styles.balanceLabel}>Số dư hiện tại</Text>
            <Text style={styles.balanceAmount}>{formatCurrency(balance)}</Text>
            <View style={styles.balanceActions}>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowTopUpModal(true)}
              >
                <Ionicons name="add" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Nạp tiền</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.actionButton}
                onPress={() => setShowWithdrawModal(true)}
              >
                <Ionicons name="remove" size={20} color="#fff" />
                <Text style={styles.actionButtonText}>Rút tiền</Text>
              </TouchableOpacity>
            </View>
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="card-outline" size={24} color="#667eea" />
            </View>
            <Text style={styles.quickActionText}>Thẻ sinh viên</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons
                name="phone-portrait-outline"
                size={24}
                color="#E91E63"
              />
            </View>
            <Text style={styles.quickActionText}>MoMo</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="card-outline" size={24} color="#FF9800" />
            </View>
            <Text style={styles.quickActionText}>Thẻ ATM</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.quickAction}>
            <View style={styles.quickActionIcon}>
              <Ionicons name="qr-code-outline" size={24} color="#9C27B0" />
            </View>
            <Text style={styles.quickActionText}>QR Code</Text>
          </TouchableOpacity>
        </View>

        {/* Wallet Statistics */}
        <WalletStats
          totalSpent={totalSpent}
          totalDeposited={totalDeposited}
          totalWithdrawn={totalWithdrawn}
          transactionCount={transactions.length}
        />

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Lịch sử giao dịch</Text>
            <TouchableOpacity>
              <Text style={styles.viewAllText}>Xem tất cả</Text>
            </TouchableOpacity>
          </View>
          {transactions.map(renderTransaction)}
        </View>
      </ScrollView>

      {/* Top Up Modal */}
      <Modal
        visible={showTopUpModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTopUpModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Nạp tiền</Text>
              <TouchableOpacity
                onPress={() => setShowTopUpModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Số tiền nạp</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập số tiền..."
                value={topUpAmount}
                onChangeText={setTopUpAmount}
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Phương thức thanh toán</Text>
              <View style={styles.paymentMethods}>
                {[
                  { id: "momo", name: "MoMo", icon: "phone-portrait" },
                  { id: "card", name: "Thẻ sinh viên", icon: "card" },
                  { id: "atm", name: "Thẻ ATM", icon: "card-outline" },
                ].map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethod,
                      selectedPaymentMethod === method.id &&
                        styles.paymentMethodActive,
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={
                        selectedPaymentMethod === method.id ? "#fff" : "#667eea"
                      }
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method.id &&
                          styles.paymentMethodTextActive,
                      ]}
                    >
                      {method.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleTopUp}
              >
                <Text style={styles.modalButtonText}>Nạp tiền</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Withdraw Modal */}
      <Modal
        visible={showWithdrawModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowWithdrawModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Rút tiền</Text>
              <TouchableOpacity
                onPress={() => setShowWithdrawModal(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#333" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Số tiền rút</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập số tiền..."
                value={withdrawAmount}
                onChangeText={setWithdrawAmount}
                keyboardType="numeric"
              />

              <Text style={styles.modalLabel}>Tài khoản nhận tiền</Text>
              <View style={styles.paymentMethods}>
                {[
                  { id: "momo", name: "MoMo", icon: "phone-portrait" },
                  { id: "bank", name: "Tài khoản ngân hàng", icon: "card" },
                ].map((method) => (
                  <TouchableOpacity
                    key={method.id}
                    style={[
                      styles.paymentMethod,
                      selectedPaymentMethod === method.id &&
                        styles.paymentMethodActive,
                    ]}
                    onPress={() => setSelectedPaymentMethod(method.id)}
                  >
                    <Ionicons
                      name={method.icon as any}
                      size={20}
                      color={
                        selectedPaymentMethod === method.id ? "#fff" : "#667eea"
                      }
                    />
                    <Text
                      style={[
                        styles.paymentMethodText,
                        selectedPaymentMethod === method.id &&
                          styles.paymentMethodTextActive,
                      ]}
                    >
                      {method.name}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <TouchableOpacity
                style={styles.modalButton}
                onPress={handleWithdraw}
              >
                <Text style={styles.modalButtonText}>Rút tiền</Text>
              </TouchableOpacity>
            </View>
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
    paddingBottom: 20,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
  },
  backButton: {
    marginRight: 15,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#fff",
    flex: 1,
  },
  moreButton: {
    padding: 5,
  },
  content: {
    flex: 1,
  },
  balanceCard: {
    margin: 16,
    borderRadius: 16,
    overflow: "hidden",
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  balanceGradient: {
    padding: 24,
  },
  balanceLabel: {
    fontSize: 16,
    color: "rgba(255,255,255,0.8)",
    marginBottom: 8,
  },
  balanceAmount: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 20,
  },
  balanceActions: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  actionButtonText: {
    color: "#fff",
    fontWeight: "500",
    marginLeft: 4,
  },
  quickActions: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingHorizontal: 16,
    paddingVertical: 20,
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  quickAction: {
    alignItems: "center",
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  quickActionText: {
    fontSize: 12,
    color: "#666",
  },
  section: {
    backgroundColor: "#fff",
    marginHorizontal: 16,
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#333",
  },
  viewAllText: {
    fontSize: 14,
    color: "#667eea",
  },
  transactionCard: {
    marginBottom: 12,
  },
  transactionHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#f8f9fa",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 2,
  },
  transactionDate: {
    fontSize: 12,
    color: "#666",
  },
  transactionAmount: {
    alignItems: "flex-end",
  },
  amountText: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    fontSize: 10,
    fontWeight: "500",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
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
    fontWeight: "600",
    color: "#333",
  },
  closeButton: {
    padding: 5,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    marginBottom: 20,
  },
  paymentMethods: {
    flexDirection: "row",
    marginBottom: 20,
  },
  paymentMethod: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    marginRight: 8,
  },
  paymentMethodActive: {
    backgroundColor: "#667eea",
  },
  paymentMethodText: {
    fontSize: 14,
    color: "#666",
    marginLeft: 4,
  },
  paymentMethodTextActive: {
    color: "#fff",
  },
  modalButton: {
    backgroundColor: "#667eea",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  modalButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});
