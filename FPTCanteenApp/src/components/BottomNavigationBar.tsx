import React from "react";
import { View, TouchableOpacity, StyleSheet, Text } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const TABS = [
  { name: "Menu", icon: "restaurant-outline", route: "Menu" },
  { name: "Order", icon: "receipt-outline", route: "Order" },
  { name: "Profile", icon: "person-outline", route: "Profile" }, // Profile chưa có, có thể thêm sau
];

export default function BottomNavigationBar({ navigation, state }: any) {
  // Lấy index màn hình hiện tại
  const currentIndex = state?.index ?? 0;
  return (
    <View style={styles.container}>
      {TABS.map((tab, idx) => {
        const isActive = currentIndex === idx;
        return (
          <TouchableOpacity
            key={tab.name}
            style={styles.tab}
            onPress={() => navigation.navigate(tab.route)}
          >
            <Ionicons
              name={tab.icon as any}
              size={28}
              color={isActive ? "#FF6F00" : "#BDBDBD"}
            />
            <Text style={[styles.label, isActive && { color: "#FF6F00" }]}>
              {tab.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    height: 60,
    backgroundColor: "#fff",
    borderTopWidth: 0.5,
    borderTopColor: "#eee",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 6,
  },
  label: {
    fontSize: 12,
    color: "#BDBDBD",
    marginTop: 2,
  },
});
