import React, { useEffect } from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, ActivityIndicator, StyleSheet } from "react-native";
import LoginScreen from "../screens/LoginScreen";
import RegisterScreen from "../screens/RegisterScreen";
import AppStack from "./AppStack";
import { useAuth } from "../context/AuthContext";
import * as Notifications from 'expo-notifications';
import { registerForPushNotificationsAsync } from '../screens/ExpoPushNotification';

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  App: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

const AuthStack = () => {
  const { isAuthenticated, isLoading } = useAuth();

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

  // Show loading screen while checking authentication status
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{ headerShown: false }}
    >
      {isAuthenticated ? (
        // User is authenticated, show main app
        <Stack.Screen name="App" component={AppStack} />
      ) : (
        // User is not authenticated, show auth screens
        <>
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      )}
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f6fa',
  },
});

export default AuthStack;