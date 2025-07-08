import { Ionicons } from "@expo/vector-icons";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import MenuManagementScreen from "../screens/MenuManagementScreen";
import OrderStatsScreen from "../screens/OrderStatsScreen";

const Tab = createBottomTabNavigator();

export default function AdminTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = "ellipse";
          if (route.name === "MenuManagement") iconName = "restaurant-outline";
          if (route.name === "OrderStats") iconName = "analytics-outline";
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
        name="OrderStats" 
        component={OrderStatsScreen}
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