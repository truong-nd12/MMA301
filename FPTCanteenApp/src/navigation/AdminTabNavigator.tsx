import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MenuManagementScreen from "../screens/MenuManagementScreen";
import OrderManagementScreen from "../screens/OrderManagementScreen";
import AdminStatsScreen from "../screens/AdminStatsScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "ellipse";
          if (route.name === "MenuManagement") iconName = "restaurant-outline";
          if (route.name === "OrderManagement") iconName = "receipt-outline";
          if (route.name === "AdminStats") iconName = "analytics-outline";
          return <Ionicons name={iconName as any} size={size} color={color} />;
        },
        tabBarActiveTintColor: "#3498DB",
        tabBarInactiveTintColor: "#BDBDBD",
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="MenuManagement" 
        component={MenuManagementScreen}
        options={{
          title: "Quản lý món",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="restaurant-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="OrderManagement" 
        component={OrderManagementScreen}
        options={{
          title: "Đơn hàng",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt-outline" size={size} color={color} />
          ),
        }}
      />
      <Tab.Screen 
        name="AdminStats" 
        component={AdminStatsScreen}
        options={{
          title: "Thống kê",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="analytics-outline" size={size} color={color} />
          ),
        }}
      />
    </Tab.Navigator>
  );
} 