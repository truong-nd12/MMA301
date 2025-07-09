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
    // Request permissions and register for push notifications
    const registerForPushNotifications = async () => {
      const token = await registerForPushNotificationsAsync();
      if (token) {
        console.log("Push notification token:", token);
      }
    };

    registerForPushNotifications();

    // Handle incoming notifications
    const subscription = Notifications.addNotificationReceivedListener(notification => {
      console.log("Notification received:", notification);
    });

    return () => {
      subscription.remove();
    };
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