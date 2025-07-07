// filepath: c:\Users\ADMIN\Documents\GitHub\MMA301\FPTCanteenApp\src\screens\ExpoPushNotification.tsx
import Constants from 'expo-constants';
import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';

export async function registerForPushNotificationsAsync(): Promise<string | undefined> {
  if (!Device.isDevice) {
    console.warn('Push notifications chỉ hoạt động trên thiết bị thật.');
    return;
  }

  try {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('Không cấp quyền gửi thông báo.');
      return;
    }

    // Kiểm tra projectId
    const projectId = Constants.expoConfig?.extra?.eas?.projectId || 
                     Constants.easConfig?.projectId ||
                     'managerhuman-98b03';

    const tokenData = await Notifications.getExpoPushTokenAsync({
      projectId: projectId,
    });
    
    console.log('📱 Expo Push Token:', tokenData.data);
    return tokenData.data;
  } catch (error) {
    console.error('Lỗi khi đăng ký push notification:', error);
    return undefined;
  }
}