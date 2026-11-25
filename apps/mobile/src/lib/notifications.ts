// ==============================================================================
// SmartAttend: Mobile Push Notifications Client Service
// Manages Expo Push Permissions, Channels, Token Registration & Response Handlers
// ==============================================================================

import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';
import { supabase } from './supabase';

// Configure foreground notification presentation behavior
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

/**
 * Configure Android Notification Channels for High-Priority Attendance Alerts
 */
export async function setupAndroidNotificationChannels() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('attendance-alerts', {
      name: 'Attendance & Gate Alerts',
      description: 'Instant notifications when your child arrives or leaves school.',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#1E40AF',
      sound: 'default',
      enableVibrate: true,
      showBadge: true
    });

    await Notifications.setNotificationChannelAsync('general-notices', {
      name: 'School Circulars & Notices',
      description: 'Official school updates and announcements.',
      importance: Notifications.AndroidImportance.DEFAULT,
      sound: 'default',
      showBadge: true
    });
  }
}

/**
 * Request notification permissions and register the device push token with Supabase
 */
export async function registerForPushNotificationsAsync(
  guardianId: string,
  userId?: string
): Promise<string | null> {
  try {
    await setupAndroidNotificationChannels();

    // Check device capability
    if (!Device.isDevice) {
      console.warn('[SmartAttend Push]: Running on emulator/simulator; push token registration may be limited.');
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.warn('[SmartAttend Push]: Notification permissions not granted by user.');
      return null;
    }

    // Resolve project ID for Expo Push API
    const projectId =
      Constants.expoConfig?.extra?.eas?.projectId ||
      Constants.easConfig?.projectId;

    const tokenResponse = await Notifications.getExpoPushTokenAsync(
      projectId ? { projectId } : undefined
    );
    const expoPushToken = tokenResponse.data;

    if (!expoPushToken) {
      return null;
    }

    // Save token in Supabase device_tokens table
    const deviceType = Platform.OS === 'ios' ? 'IOS' : Platform.OS === 'android' ? 'ANDROID' : 'WEB';
    const deviceName = Device.modelName || Device.deviceName || `${Platform.OS} Phone`;

    await supabase.from('device_tokens').upsert(
      {
        guardian_id: guardianId,
        user_id: userId || undefined,
        expo_push_token: expoPushToken,
        device_type: deviceType,
        device_name: deviceName,
        is_active: true,
        last_used_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      },
      { onConflict: 'guardian_id,expo_push_token' }
    );

    return expoPushToken;
  } catch (err: any) {
    console.warn('[SmartAttend Push Registration Error]:', err?.message || err);
    return null;
  }
}

/**
 * Deactivate push token in Supabase on logout
 */
export async function unregisterPushToken(guardianId: string, expoPushToken: string) {
  try {
    await supabase
      .from('device_tokens')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .match({ guardian_id: guardianId, expo_push_token: expoPushToken });
  } catch (err) {
    console.warn('[SmartAttend Unregister Token Error]:', err);
  }
}

/**
 * Setup listeners for incoming notifications and tap responses
 */
export function setupNotificationListeners(
  onNotificationReceived: (notification: Notifications.Notification) => void,
  onNotificationTapped: (response: Notifications.NotificationResponse) => void
) {
  const receivedSubscription = Notifications.addNotificationReceivedListener((notification) => {
    onNotificationReceived(notification);
  });

  const responseSubscription = Notifications.addNotificationResponseReceivedListener((response) => {
    onNotificationTapped(response);
  });

  return () => {
    receivedSubscription.remove();
    responseSubscription.remove();
  };
}

