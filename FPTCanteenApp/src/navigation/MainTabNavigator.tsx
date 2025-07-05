import React from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MenuScreen from "../screens/MenuScreen";
import OrderScreen from "../screens/OrderScreen";
import ProfileScreen from "../screens/ProfileScreen";
import OrderTrackingScreen from "../screens/OrderTrackingScreen";
import { Ionicons } from "@expo/vector-icons";

const Tab = createBottomTabNavigator();

export default function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "ellipse";
          if (route.name === "Menu") iconName = "restaurant-outline";
          if (route.name === "Order") iconName = "receipt-outline";
          if (route.name === "Profile") iconName = "person-outline";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#FF6F00",
        tabBarInactiveTintColor: "#BDBDBD",
        headerShown: false,
      })}
    >
      <Tab.Screen name="Menu" component={MenuScreen} />
      <Tab.Screen name="Order" component={OrderScreen} />
      <Tab.Screen
        name="OrderTracking"
        component={OrderTrackingScreen}
        options={{
          title: "Order Tracking",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="list-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen name="Profile" component={ProfileScreen} />
      
    </Tab.Navigator>
  );
}
