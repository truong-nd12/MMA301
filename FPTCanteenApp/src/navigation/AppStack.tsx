import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View } from "react-native";
import OrderTrackingScreen from "../screens/OrderTrackingScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";
import MainTabNavigator from "./MainTabNavigator";
import EditProfileScreen from "../screens/EditProfileScreen";
import OrderHistoryScreen from "../screens/OrderHistoryScreen";
import OrderReviewScreen from "../screens/OrderReviewScreen";

export type AppStackParamList = {
  MainTabs: undefined;
  OrderTracking: undefined;
  OrderDetail: { orderId: string };
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
    </Stack.Navigator>
  </View>
);

export default AppStack;
