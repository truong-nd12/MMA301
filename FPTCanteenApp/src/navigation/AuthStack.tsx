import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AppStack from "./AppStack";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => (
  <Stack.Navigator
    initialRouteName="Login"
    screenOptions={{ headerShown: false }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
    <Stack.Screen name="App" component={AppStack} />
  </Stack.Navigator>
);

export default AuthStack;
