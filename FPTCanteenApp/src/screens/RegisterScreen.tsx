import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import * as Animatable from "react-native-animatable";
import { Ionicons } from "@expo/vector-icons";

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);

  const handleRegister = () => {
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    alert("Đăng ký thành công (mock)!");
  };

  const InputField = ({
    placeholder,
    value,
    onChangeText,
    secureTextEntry,
    keyboardType,
    autoCapitalize,
    inputKey,
    icon,
    onIconPress,
  }: {
    placeholder: string;
    value: string;
    onChangeText: (text: string) => void;
    secureTextEntry?: boolean;
    keyboardType?: any;
    autoCapitalize?: "none" | "sentences" | "words" | "characters";
    inputKey: string;
    icon?: React.ReactNode;
    onIconPress?: () => void;
  }) => {
    const isFocused = focusedInput === inputKey;
    return (
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
        ]}
      >
        {icon}
        <TextInput
          style={styles.input}
          placeholder={placeholder}
          placeholderTextColor="#8E8E93"
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          onFocus={() => setFocusedInput(inputKey)}
          onBlur={() => setFocusedInput(null)}
        />
        {onIconPress && (
          <TouchableOpacity onPress={onIconPress}>
            {inputKey === "password" ? (
              <Ionicons
                name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#aaa"
              />
            ) : inputKey === "confirmPassword" ? (
              <Ionicons
                name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
                size={22}
                color="#aaa"
              />
            ) : null}
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoidingView}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animatable.View animation="fadeInLeft" duration={700}>
          <View style={styles.header}>
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>Tạo tài khoản mới để bắt đầu</Text>
          </View>

          <View style={styles.formContainer}>
            <InputField
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              inputKey="email"
              icon={
                <Ionicons
                  name="mail-outline"
                  size={22}
                  color="#aaa"
                  style={styles.icon}
                />
              }
            />

            <InputField
              placeholder="Số điện thoại"
              value={phone}
              onChangeText={setPhone}
              keyboardType="phone-pad"
              inputKey="phone"
              icon={
                <Ionicons
                  name="call-outline"
                  size={22}
                  color="#aaa"
                  style={styles.icon}
                />
              }
            />

            <InputField
              placeholder="Mã SV-NV"
              value={studentId}
              onChangeText={setStudentId}
              inputKey="studentId"
              icon={
                <Ionicons
                  name="card-outline"
                  size={22}
                  color="#aaa"
                  style={styles.icon}
                />
              }
            />

            <InputField
              placeholder="Mật khẩu"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={secure}
              inputKey="password"
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#aaa"
                  style={styles.icon}
                />
              }
              onIconPress={() => setSecure(!secure)}
            />

            <InputField
              placeholder="Xác nhận mật khẩu"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={secureConfirm}
              inputKey="confirmPassword"
              icon={
                <Ionicons
                  name="lock-closed-outline"
                  size={22}
                  color="#aaa"
                  style={styles.icon}
                />
              }
              onIconPress={() => setSecureConfirm(!secureConfirm)}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={handleRegister}
              activeOpacity={0.8}
            >
              <Text style={styles.buttonText}>Đăng ký</Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => navigation.navigate("Login")}
              activeOpacity={0.7}
              style={styles.linkContainer}
            >
              <Text style={styles.link}>
                Đã có tài khoản? <Text style={styles.linkBold}>Đăng nhập</Text>
              </Text>
            </TouchableOpacity>
          </View>
        </Animatable.View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoidingView: {
    flex: 1,
    backgroundColor: "#F2F2F7",
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  title: {
    fontSize: 34,
    fontWeight: "700",
    color: "#1C1C1E",
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 17,
    color: "#8E8E93",
    textAlign: "center",
    lineHeight: 22,
  },
  formContainer: {
    width: "100%",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#E5E5EA",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
    paddingHorizontal: 12,
    height: 56,
  },
  inputContainerFocused: {
    borderColor: "#007AFF",
    shadowColor: "#007AFF",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  icon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 17,
    color: "#1C1C1E",
    fontWeight: "400",
  },
  button: {
    backgroundColor: "#007AFF",
    borderRadius: 12,
    height: 56,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#007AFF",
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  linkContainer: {
    alignItems: "center",
    paddingVertical: 12,
  },
  link: {
    color: "#8E8E93",
    fontSize: 16,
    textAlign: "center",
  },
  linkBold: {
    color: "#007AFF",
    fontWeight: "600",
  },
});

export default RegisterScreen;
