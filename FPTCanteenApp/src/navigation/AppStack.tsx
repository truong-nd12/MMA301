import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import AdminSwitchScreen from "../screens/AdminSwitchScreen";
import EditProfileScreen from "../screens/EditProfileScreen";
import FavoriteFoodsScreen from "../screens/FavoriteFoodsScreen";
import NotificationScreen from "../screens/NotificationScreen";
import NutritionScreen from "../screens/NutritionScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import OrderReviewScreen from "../screens/OrderReviewScreen";
import OrderScreen from "../screens/OrderScreen";
import OrderTrackingScreen from "../screens/OrderTrackingScreen";
import SettingsScreen from "../screens/SettingsScreen";
import SupportScreen from "../screens/SupportScreen";
import WalletScreen from "../screens/WalletScreen";
import AdminTabNavigator from "./AdminTabNavigator";
import MainTabNavigator from "./MainTabNavigator";

export type AppStackParamList = {
  MainTabs: { screen?: string } | undefined;
  OrderTracking: undefined;
  OrderDetail: { orderId: string };
  Order: { food: any };
  FavoriteFoods: undefined;
  Wallet: undefined;
  AdminSwitch: undefined;
  AdminTabs: undefined;
  EditProfile: undefined;
  OrderHistory: undefined;
  OrderReview: undefined;
  Notification: undefined;
  Settings: undefined;
  Support: undefined;
  Nutrition: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => (
  <View style={{ flex: 1 }}>
    <Stack.Navigator
      initialRouteName="MainTabs"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="MainTabs" component={MainTabNavigator} />
      <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
      <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
      <Stack.Screen name="EditProfile" component={EditProfileScreen} />
      <Stack.Screen name="OrderHistory" component={OrderHistoryScreen} />
      <Stack.Screen name="OrderReview" component={OrderReviewScreen} />
      <Stack.Screen name="Notification" component={NotificationScreen} />
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="Support" component={SupportScreen} />
      <Stack.Screen name="Nutrition" component={NutritionScreen} />
      <Stack.Screen name="FavoriteFoods" component={FavoriteFoodsScreen} />
      <Stack.Screen name="Order" component={OrderScreen} />
      <Stack.Screen name="Wallet" component={WalletScreen} />
      <Stack.Screen name="AdminSwitch" component={AdminSwitchScreen} />
      <Stack.Screen name="AdminTabs" component={AdminTabNavigator} />
    </Stack.Navigator>
  </View>
);

export default AppStack;
