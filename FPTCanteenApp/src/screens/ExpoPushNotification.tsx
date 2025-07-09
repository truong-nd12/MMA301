import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import { Platform, Alert } from 'react-native';

/**
 * Đăng ký và lấy Expo Push Token.
 * @returns Chuỗi token hoặc null nếu không thành công.
 */
export async function registerForPushNotificationsAsync(): Promise<string | null> {
  let token: string | null = null;

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Yêu cầu quyền nếu chưa được cấp
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    // Nếu vẫn chưa được cấp quyền
    if (finalStatus !== 'granted') {
      console.warn('Push notification permission denied.');
      Alert.alert(
        'Không thể nhận thông báo',
        'Bạn cần cho phép quyền để nhận thông báo đẩy.'
      );
      return null;
    }

    // Lấy Expo push token
    const pushToken = await Notifications.getExpoPushTokenAsync();
    token = pushToken.data;
    console.log('Expo Push Token:', token);
  } else {
    Alert.alert('Chỉ hỗ trợ thiết bị thật', 'Thông báo đẩy không hoạt động trên giả lập.');
  }

  // Cấu hình kênh cho Android
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  return token;
}
