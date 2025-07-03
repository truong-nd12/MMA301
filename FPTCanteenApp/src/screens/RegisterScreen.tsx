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
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

const { height } = Dimensions.get("window");

const RegisterScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [secure, setSecure] = useState(true);
  const [secureConfirm, setSecureConfirm] = useState(true);
  const [focusedInput, setFocusedInput] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async () => {
    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp!");
      return;
    }
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      alert("Đăng ký thành công (mock)!");
    }, 1500);
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
    const hasValue = value.length > 0;
    return (
      <View
        style={[
          styles.inputContainer,
          isFocused && styles.inputContainerFocused,
          hasValue && styles.inputContainerFilled,
        ]}
      >
        <View style={styles.iconContainer}>{icon}</View>
        <View style={styles.inputWrapper}>
          <Text
            style={[
              styles.inputLabel,
              (isFocused || hasValue) && styles.inputLabelActive,
            ]}
          >
            {placeholder}
          </Text>
          <TextInput
            style={[
              styles.input,
              (isFocused || hasValue) && styles.inputActive,
            ]}
            placeholder=""
            placeholderTextColor="transparent"
            value={value}
            onChangeText={onChangeText}
            secureTextEntry={secureTextEntry}
            keyboardType={keyboardType}
            autoCapitalize={autoCapitalize}
            onFocus={() => setFocusedInput(inputKey)}
            onBlur={() => setFocusedInput(null)}
          />
        </View>
        {onIconPress && (
          <TouchableOpacity
            onPress={onIconPress}
            style={styles.eyeIconContainer}
            activeOpacity={0.7}
          >
            <Ionicons
              name={secureTextEntry ? "eye-off-outline" : "eye-outline"}
              size={22}
              color={isFocused ? "#667eea" : "#aaa"}
            />
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <LinearGradient colors={["#667eea", "#764ba2"]} style={styles.gradient}>
      <KeyboardAvoidingView
        style={styles.keyboardAvoidingView}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.container}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {/* Decorative circles */}
          <View style={styles.decorativeCircle1} />
          <View style={styles.decorativeCircle2} />

          <View style={styles.header}>
            <View style={styles.logoContainer}>
              <View style={styles.logoCircle}>
                <Ionicons name="person-add" size={40} color="#fff" />
              </View>
            </View>
            <Text style={styles.title}>Đăng ký</Text>
            <Text style={styles.subtitle}>
              Tạo tài khoản mới để bắt đầu hành trình của bạn
            </Text>
          </View>

          <View style={styles.formContainer}>
            <View style={styles.formCard}>
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
                    color={focusedInput === "email" ? "#667eea" : "#aaa"}
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
                    color={focusedInput === "phone" ? "#667eea" : "#aaa"}
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
                    color={focusedInput === "studentId" ? "#667eea" : "#aaa"}
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
                    color={focusedInput === "password" ? "#667eea" : "#aaa"}
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
                    color={
                      focusedInput === "confirmPassword" ? "#667eea" : "#aaa"
                    }
                  />
                }
                onIconPress={() => setSecureConfirm(!secureConfirm)}
              />

              <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonLoading]}
                onPress={handleRegister}
                activeOpacity={0.8}
                disabled={isLoading}
              >
                <LinearGradient
                  colors={isLoading ? ["#ccc", "#999"] : ["#667eea", "#764ba2"]}
                  style={styles.buttonGradient}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                >
                  {isLoading ? (
                    <Ionicons name="refresh" size={20} color="#fff" />
                  ) : (
                    <Text style={styles.buttonText}>Đăng ký</Text>
                  )}
                </LinearGradient>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => navigation.navigate("Login")}
                activeOpacity={0.7}
                style={styles.linkContainer}
              >
                <Text style={styles.link}>
                  Đã có tài khoản?{" "}
                  <Text style={styles.linkBold}>Đăng nhập</Text>
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  keyboardAvoidingView: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
    minHeight: height,
  },
  decorativeCircle1: {
    position: "absolute",
    top: -50,
    right: -50,
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "rgba(255, 255, 255, 0.1)",
  },
  decorativeCircle2: {
    position: "absolute",
    bottom: -30,
    left: -30,
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255, 255, 255, 0.05)",
  },
  header: {
    alignItems: "center",
    marginBottom: 40,
  },
  logoContainer: {
    marginBottom: 20,
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "rgba(255, 255, 255, 0.2)",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "rgba(255, 255, 255, 0.3)",
  },
  title: {
    fontSize: 36,
    fontWeight: "800",
    color: "#FFFFFF",
    marginBottom: 12,
    letterSpacing: -0.5,
    textShadowColor: "rgba(0, 0, 0, 0.3)",
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  subtitle: {
    fontSize: 16,
    color: "rgba(255, 255, 255, 0.8)",
    textAlign: "center",
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  formContainer: {
    width: "100%",
  },
  formCard: {
    backgroundColor: "rgba(255, 255, 255, 0.95)",
    borderRadius: 24,
    padding: 24,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 15,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8F9FA",
    borderRadius: 16,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "transparent",
    paddingHorizontal: 16,
    height: 64,
    position: "relative",
  },
  inputContainerFocused: {
    borderColor: "#667eea",
    backgroundColor: "#FFFFFF",
    shadowColor: "#667eea",
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
    transform: [{ scale: 1.02 }],
  },
  inputContainerFilled: {
    backgroundColor: "#FFFFFF",
  },
  iconContainer: {
    width: 24,
    alignItems: "center",
    marginRight: 12,
  },
  iconContainerFocused: {
    transform: [{ scale: 1.1 }],
  },
  inputWrapper: {
    flex: 1,
    position: "relative",
  },
  inputLabel: {
    position: "absolute",
    left: 0,
    top: 20,
    fontSize: 16,
    color: "#999",
    backgroundColor: "transparent",
  },
  inputLabelActive: {
    top: 2,
    fontSize: 12,
    color: "#667eea",
    fontWeight: "600",
  },
  input: {
    fontSize: 16,
    color: "#1C1C1E",
    fontWeight: "500",
    paddingTop: 20,
    paddingBottom: 4,
  },
  inputActive: {
    paddingTop: 16,
  },
  eyeIconContainer: {
    padding: 4,
  },
  button: {
    borderRadius: 16,
    height: 56,
    marginTop: 8,
    marginBottom: 24,
    shadowColor: "#667eea",
    shadowOffset: {
      width: 0,
      height: 6,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 8,
  },
  buttonLoading: {
    shadowOpacity: 0.2,
  },
  buttonGradient: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 16,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
  linkContainer: {
    alignItems: "center",
    paddingVertical: 16,
  },
  link: {
    color: "#666",
    fontSize: 16,
    textAlign: "center",
  },
  linkBold: {
    color: "#667eea",
    fontWeight: "700",
  },
});

export default RegisterScreen;
