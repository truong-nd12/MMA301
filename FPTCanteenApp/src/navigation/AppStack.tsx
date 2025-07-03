import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import MenuScreen from "../screens/MenuScreen";
import OrderScreen from "../screens/OrderScreen";

export type AppStackParamList = {
  Menu: undefined;
  Order: { food: any };
};

const Stack = createNativeStackNavigator<AppStackParamList>();

const AppStack = () => (
  <Stack.Navigator
    initialRouteName="Menu"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Menu" component={MenuScreen} />
    <Stack.Screen name="Order" component={OrderScreen} />
  </Stack.Navigator>
);

export default AppStack;
