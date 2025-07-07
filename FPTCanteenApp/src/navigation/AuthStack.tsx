import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AppStack from "./AppStack";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../screens/ExpoPushNotification';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  useEffect(() => {
    // Đăng ký thông báo đẩy khi ứng dụng khởi động
    registerForPushNotificationsAsync()
      .then(token => {
        if (token) {
          console.log('Đăng ký thành công với token:', token);
        }
      })
      .catch(error => {
        console.error('Lỗi đăng ký thông báo đẩy:', error);
      });
  }, []);

  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="App" component={AppStack} />
    </Stack.Navigator>
  );
};

export default AuthStack;