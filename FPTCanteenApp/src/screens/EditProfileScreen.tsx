

import { useState } from "react"
import { View, Text, StyleSheet, Image, TouchableOpacity, TextInput, ScrollView, Alert, Dimensions } from "react-native"
import { LinearGradient } from "expo-linear-gradient"
import { Ionicons } from "@expo/vector-icons"

const { width } = Dimensions.get("window")

export default function EditProfileScreen({ navigation }: any) {
  // Dữ liệu mẫu với thêm thông tin sinh viên
  const [name, setName] = useState("Đoàn Thế Anh")
  const [email, setEmail] = useState("vana@student.hust.edu.vn")
  const [studentId, setStudentId] = useState("20210001")
  const [phone, setPhone] = useState("0123456789")
  const [major, setMajor] = useState("Công nghệ thông tin")
  const [year, setYear] = useState("Năm 3")
  const [class_, setClass] = useState("CNTT-K65")
  const [avatar] = useState(require("../assets/images/icon.png"))

  const handleSave = () => {
    if (!name.trim() || !email.trim() || !studentId.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc")
      return
    }
    Alert.alert("Thành công", "Thông tin đã được cập nhật!")
  }

  const handleChangeAvatar = () => {
    Alert.alert("Thay đổi ảnh đại diện", "Chọn nguồn ảnh", [
      { text: "Camera", onPress: () => console.log("Camera") },
      { text: "Thư viện", onPress: () => console.log("Gallery") },
      { text: "Hủy", style: "cancel" },
    ])
  }

  return (
    <View style={styles.container}>
      <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.header} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }}>
        <TouchableOpacity style={styles.backBtn} onPress={() => navigation.goBack()}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>Chỉnh sửa thông tin</Text>
        <Text style={styles.headerSubtitle}>Cập nhật thông tin cá nhân của bạn</Text>

        <View style={styles.avatarContainer}>
          <View style={styles.avatarWrapper}>
            <Image source={avatar} style={styles.avatar} />
            <View style={styles.avatarOverlay} />
          </View>
          <TouchableOpacity style={styles.editAvatarBtn} onPress={handleChangeAvatar}>
            <Ionicons name="camera-outline" size={20} color="#667eea" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView
        style={styles.form}
        contentContainerStyle={{ paddingBottom: 40 }}
        showsVerticalScrollIndicator={false}
      >
        {/* Thông tin cơ bản */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin cơ bản</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Họ và tên <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="person-outline" size={20} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mã số sinh viên <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="card-outline" size={20} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={studentId}
                onChangeText={setStudentId}
                placeholder="Nhập MSSV"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Email <Text style={styles.required}>*</Text>
            </Text>
            <View style={styles.inputContainer}>
              <Ionicons name="mail-outline" size={20} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Nhập email"
                placeholderTextColor="#999"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Số điện thoại</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="call-outline" size={20} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#999"
                keyboardType="phone-pad"
              />
            </View>
          </View>
        </View>

        {/* Thông tin học tập */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin học tập</Text>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Ngành học</Text>
            <View style={styles.inputContainer}>
              <Ionicons name="school-outline" size={20} color="#667eea" style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                value={major}
                onChangeText={setMajor}
                placeholder="Nhập ngành học"
                placeholderTextColor="#999"
              />
            </View>
          </View>

          <View style={styles.row}>
            <View style={[styles.inputGroup, { flex: 1, marginRight: 10 }]}>
              <Text style={styles.label}>Năm học</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="calendar-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={year}
                  onChangeText={setYear}
                  placeholder="Năm học"
                  placeholderTextColor="#999"
                />
              </View>
            </View>

            <View style={[styles.inputGroup, { flex: 1, marginLeft: 10 }]}>
              <Text style={styles.label}>Lớp</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="people-outline" size={20} color="#667eea" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  value={class_}
                  onChangeText={setClass}
                  placeholder="Lớp"
                  placeholderTextColor="#999"
                />
              </View>
            </View>
          </View>
        </View>

        <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
          <LinearGradient
            colors={["#667eea", "#764ba2"]}
            style={styles.saveBtnGradient}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
          >
            <Ionicons name="checkmark-circle-outline" size={22} color="#fff" />
            <Text style={styles.saveBtnText}>Lưu thay đổi</Text>
          </LinearGradient>
        </TouchableOpacity>
      </ScrollView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  header: {
    paddingTop: 50,
    paddingBottom: 40,
    borderBottomLeftRadius: 35,
    borderBottomRightRadius: 35,
    alignItems: "center",
    position: "relative",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  backBtn: {
    position: "absolute",
    top: 50,
    left: 20,
    zIndex: 2,
    backgroundColor: "rgba(255,255,255,0.2)",
    borderRadius: 25,
    padding: 10,
    backdropFilter: "blur(10px)",
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#fff",
    marginTop: 15,
    letterSpacing: 0.5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: "rgba(255,255,255,0.8)",
    marginTop: 4,
    marginBottom: 15,
  },
  avatarContainer: {
    marginTop: 15,
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  avatarWrapper: {
    position: "relative",
  },
  avatar: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 4,
    borderColor: "#fff",
  },
  avatarOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    borderRadius: 55,
    backgroundColor: "rgba(0,0,0,0.1)",
  },
  editAvatarBtn: {
    position: "absolute",
    bottom: 5,
    right: 5,
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 8,
    elevation: 4,
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
  },
  form: {
    flex: 1,
    paddingHorizontal: 20,
    marginTop: -10,
  },
  section: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 20,
    marginTop: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 15,
    paddingBottom: 8,
    borderBottomWidth: 2,
    borderBottomColor: "#667eea",
  },
  inputGroup: {
    marginBottom: 20,
  },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
  },
  label: {
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
    marginBottom: 8,
  },
  required: {
    color: "#e74c3c",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f8f9fa",
    borderRadius: 15,
    borderWidth: 1.5,
    borderColor: "#e9ecef",
    paddingHorizontal: 15,
    paddingVertical: 4,
  },
  inputIcon: {
    marginRight: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    paddingVertical: 12,
  },
  saveBtn: {
    marginTop: 30,
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#667eea",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
  },
  saveBtnGradient: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 18,
    paddingHorizontal: 30,
  },
  saveBtnText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "bold",
    marginLeft: 10,
    letterSpacing: 0.5,
  },
})
