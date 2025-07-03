import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MenuScreen from "../screens/MenuScreen";
import OrderScreen from "../screens/OrderScreen";
import OrderTrackingScreen from "../screens/OrderTrackingScreen";
import OrderDetailScreen from "../screens/OrderDetailScreen";

export type AppStackParamList = {
  Menu: undefined;
  Order: { food: any };
  OrderTracking: undefined;
  OrderDetail: { orderId: string };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => (
  <Stack.Navigator
    initialRouteName="Menu"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Menu" component={MenuScreen} />
    <Stack.Screen name="Order" component={OrderScreen} />
    <Stack.Screen name="OrderTracking" component={OrderTrackingScreen} />
    <Stack.Screen name="OrderDetail" component={OrderDetailScreen} />
  </Stack.Navigator>
);

export default AppStack;
