import 'react-native-get-random-values';
import 'react-native-url-polyfill/auto';
import { registerRootComponent } from 'expo';
import React, { useState, useEffect, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  StatusBar,
  TouchableOpacity,
  Platform,
  Animated,
  Vibration
} from 'react-native';
import { ThemeColors, getThemeColors } from './src/lib/theme';
import { useI18n } from './src/lib/i18n';
import { ChildRecord, LanguageCode, ParentUser, ThemeMode, NotificationItem } from './src/types';
import {
  getParentChildren,
  VERIFIED_PARENTS,
  subscribeToChildAttendance,
  recordAttendancePunch,
  fetchParentNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  subscribeToParentNotifications
} from './src/lib/supabase';
import {
  registerForPushNotificationsAsync,
  unregisterPushToken,
  setupNotificationListeners
} from './src/lib/notifications';
import { LoginScreen } from './src/screens/LoginScreen';
import { HomeScreen } from './src/screens/HomeScreen';
import { AttendanceScreen } from './src/screens/AttendanceScreen';
import { MessagesScreen } from './src/screens/MessagesScreen';
import { NotificationsScreen } from './src/screens/NotificationsScreen';
import { ProfileScreen } from './src/screens/ProfileScreen';
import { LeaveRequestModal } from './src/screens/LeaveRequestModal';

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Safe Gate Entry Verified (Clock In)',
    message: 'Your child Aarav Mehta has checked in safely at 08:24 AM via Face Recognition Kiosk 1.',
    type: 'CHECK_IN',
    timestamp: 'Today, 08:24 AM',
    is_read: false,
    student_id: '88888888-8888-8888-8888-888888888801'
  },
  {
    id: 'n-2',
    title: 'Leave Request Approved by School',
    message: 'Medical Leave request for 04 Nov 2026 has been approved by Class Teacher Mr. Rajesh Kumar.',
    type: 'LEAVE_STATUS',
    timestamp: 'Yesterday, 03:15 PM',
    is_read: false
  },
  {
    id: 'n-3',
    title: 'School Circular: Winter Timings',
    message: 'Delhi Public School has released the revised winter dress code circular.',
    type: 'CIRCULAR',
    timestamp: '10 Nov 2026, 11:30 AM',
    is_read: true
  },
  {
    id: 'n-4',
    title: 'Campus Departure Verified (Clock Out)',
    message: 'Your child Aarav Mehta was dismissed through Main Gate Perimeter at 04:10 PM.',
    type: 'CHECK_OUT',
    timestamp: '08 Nov 2026, 04:10 PM',
    is_read: true,
    student_id: '88888888-8888-8888-8888-888888888801'
  }
];

export default function App() {
  const [themeMode, setThemeMode] = useState<ThemeMode>('light');
  const [language, setLanguage] = useState<LanguageCode>('en');
  const [authenticatedEmail, setAuthenticatedEmail] = useState<string | null>('vikram.mehta@gmail.com');
  const [currentTab, setCurrentTab] = useState<'HOME' | 'ATTENDANCE' | 'MESSAGES' | 'NOTIFICATIONS' | 'PROFILE'>('HOME');
  const [children, setChildren] = useState<ChildRecord[]>([]);
  const [selectedChildIndex, setSelectedChildIndex] = useState(0);
  const [leaveModalVisible, setLeaveModalVisible] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [activeLiveAlert, setActiveLiveAlert] = useState<NotificationItem | null>(null);
  const [expoPushToken, setExpoPushToken] = useState<string | null>(null);

  const alertAnim = useRef(new Animated.Value(-150)).current;
  const dismissTimer = useRef<any>(null);

  const theme: ThemeColors = getThemeColors(themeMode);
  const t = useI18n(language);

  const unreadAlertsCount = notifications.filter((n) => !n.is_read).length;

  // Resolve current parent
  const activeParentRecord = VERIFIED_PARENTS.find(
    (p) => p.email.toLowerCase() === authenticatedEmail?.toLowerCase()
  ) || VERIFIED_PARENTS[0];

  const parentUser: ParentUser = {
    id: activeParentRecord.id,
    name: activeParentRecord.name,
    email: activeParentRecord.email,
    phone: activeParentRecord.phone,
    relationship: activeParentRecord.relationship,
    avatar_url: activeParentRecord.avatar_url,
    school_name: activeParentRecord.school_name,
    school_code: activeParentRecord.school_code,
    children: []
  };

  // Load parent's authorized children on login or email change
  useEffect(() => {
    if (!authenticatedEmail) {
      setChildren([]);
      return;
    }

    let isMounted = true;
    getParentChildren(authenticatedEmail).then((fetched) => {
      if (isMounted) {
        setChildren(fetched);
        setSelectedChildIndex(0);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [authenticatedEmail]);

  // Load persistent notification history from Supabase and register background push token
  useEffect(() => {
    if (!authenticatedEmail) return;

    let isMounted = true;

    // 1. Fetch persistent history from Supabase
    fetchParentNotifications(activeParentRecord.id).then((items) => {
      if (isMounted && items.length > 0) {
        setNotifications(items);
      }
    });

    // 2. Register for Expo background push notifications & save token to Supabase
    registerForPushNotificationsAsync(activeParentRecord.id, activeParentRecord.id).then((tok) => {
      if (isMounted && tok) {
        setExpoPushToken(tok);
      }
    });

    // 3. Listen to real-time parent notifications inserted into Supabase
    const unsubscribeNotifs = subscribeToParentNotifications(activeParentRecord.id, (newNotif) => {
      if (isMounted) {
        setNotifications((prev) => [newNotif, ...prev.filter((n) => n.id !== newNotif.id)]);
        triggerLiveNotification(newNotif);
      }
    });

    // 4. Setup push notification listeners (incoming & response/tap)
    const cleanupPushListeners = setupNotificationListeners(
      (notification) => {
        const content = notification.request.content;
        const item: NotificationItem = {
          id: `push-${Date.now()}`,
          title: content.title || 'Attendance Alert',
          message: content.body || '',
          type: (content.data?.type as any) || 'CHECK_IN',
          timestamp: 'Just now',
          is_read: false,
          student_id: content.data?.student_id as string
        };
        triggerLiveNotification(item);
      },
      (response) => {
        // Parent tapped notification from system shade or lock screen
        const data = response.notification.request.content.data;
        if (data?.screen === 'LEAVE') {
          setCurrentTab('HOME');
          setLeaveModalVisible(true);
        } else if (data?.screen === 'ATTENDANCE') {
          setCurrentTab('ATTENDANCE');
        } else {
          setCurrentTab('NOTIFICATIONS');
        }
      }
    );

    return () => {
      isMounted = false;
      unsubscribeNotifs();
      cleanupPushListeners();
    };
  }, [authenticatedEmail, activeParentRecord.id]);

  const triggerLiveNotification = (alert: NotificationItem) => {
    setNotifications((prev) => [alert, ...prev]);
    setActiveLiveAlert(alert);

    // Haptic vibration feedback for native feel
    try {
      Vibration.vibrate([0, 100, 60, 100]);
    } catch (e) { }

    // Slide banner down
    Animated.spring(alertAnim, {
      toValue: 0,
      useNativeDriver: true,
      tension: 40,
      friction: 7
    }).start();

    // Auto dismiss after 6 seconds
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    dismissTimer.current = setTimeout(() => {
      Animated.timing(alertAnim, {
        toValue: -150,
        duration: 350,
        useNativeDriver: true
      }).start(() => setActiveLiveAlert(null));
    }, 6000);
  };

  const handleDismissLiveAlert = () => {
    if (dismissTimer.current) clearTimeout(dismissTimer.current);
    Animated.timing(alertAnim, {
      toValue: -150,
      duration: 250,
      useNativeDriver: true
    }).start(() => setActiveLiveAlert(null));
  };

  // Trigger simulated or instant punch
  const handleTriggerPunch = (type: 'CHECK_IN' | 'CHECK_OUT' | 'ABSENT') => {
    const child = children[selectedChildIndex] || children[0];
    if (!child) return;

    const now = new Date();
    let hours = now.getHours();
    const mins = now.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    const timeFormatted = `${hours < 10 ? '0' + hours : hours}:${mins < 10 ? '0' + mins : mins} ${ampm}`;

    // Update child state immediately
    setChildren((prev) =>
      prev.map((c) => {
        if (c.id !== child.id) return c;
        if (type === 'CHECK_IN') {
          return {
            ...c,
            today_status: 'PRESENT',
            clock_in_time: timeFormatted,
            clock_in_verified: true,
            clock_in_method: 'FACE',
            is_late: false
          };
        } else if (type === 'CHECK_OUT') {
          return {
            ...c,
            clock_out_time: timeFormatted,
            clock_out_verified: true,
            clock_out_method: 'FACE'
          };
        } else {
          return {
            ...c,
            today_status: 'ABSENT',
            clock_in_time: undefined,
            clock_out_time: undefined,
            clock_in_verified: false,
            clock_out_verified: false,
            absent_days: c.absent_days + 1
          };
        }
      })
    );

    // Create live push notification
    let alertTitle: string;
    let alertBody: string;

    if (type === 'CHECK_IN') {
      alertTitle = t.clockInAlertTitle;
      alertBody = t.clockInAlertBody.replace('{name}', `${child.first_name} ${child.last_name}`).replace('{time}', timeFormatted);
    } else if (type === 'CHECK_OUT') {
      alertTitle = t.clockOutAlertTitle;
      alertBody = t.clockOutAlertBody.replace('{name}', `${child.first_name} ${child.last_name}`).replace('{time}', timeFormatted);
    } else {
      alertTitle = language === 'mr' ? 'शाळेत अनुपस्थिती इशारा (Absence Alert)' : 'Urgent: Student Marked Absent Today';
      alertBody = language === 'mr'
        ? `${child.first_name} ${child.last_name} आज शाळेत गैरहजर नोंदवला गेला आहे (कटऑफ वेळ सकाळी १०:००).`
        : `Your child ${child.first_name} ${child.last_name} has been marked ABSENT today. No biometric punch recorded before the 10:00 AM cutoff.`;
    }

    const newAlert: NotificationItem = {
      id: `live-alert-${Date.now()}`,
      title: alertTitle,
      message: alertBody,
      type: type,
      timestamp: t.justNow,
      is_read: false,
      student_id: child.id
    };

    triggerLiveNotification(newAlert);

    // Sync to Supabase
    recordAttendancePunch({
      student_id: child.id,
      type,
      method: 'FACE'
    }).catch(() => { });
  };

  // Subscribe to real-time punches for the currently selected child
  useEffect(() => {
    const currentChild = children[selectedChildIndex];
    if (!currentChild) return;

    const unsubscribe = subscribeToChildAttendance(currentChild.id, (payload) => {
      if (payload.new) {
        const arrivalRaw = payload.new.first_arrival_time;
        const departureRaw = payload.new.departure_time;
        const newStatus = payload.new.status;
        const prevStatus = currentChild.today_status;

        const arrivalFormatted = arrivalRaw ? formatTimeStr(arrivalRaw) : undefined;
        const departureFormatted = departureRaw ? formatTimeStr(departureRaw) : undefined;

        setChildren((prev) =>
          prev.map((c) =>
            c.id === currentChild.id
              ? {
                ...c,
                today_status: newStatus || c.today_status,
                clock_in_time: arrivalFormatted || c.clock_in_time,
                clock_out_time: departureFormatted || c.clock_out_time
              }
              : c
          )
        );

        if (departureFormatted && departureFormatted !== currentChild.clock_out_time) {
          triggerLiveNotification({
            id: `sb-out-${Date.now()}`,
            title: t.clockOutAlertTitle,
            message: t.clockOutAlertBody.replace('{name}', `${currentChild.first_name} ${currentChild.last_name}`).replace('{time}', departureFormatted),
            type: 'CHECK_OUT',
            timestamp: t.justNow,
            is_read: false,
            student_id: currentChild.id
          });
        } else if (arrivalFormatted && arrivalFormatted !== currentChild.clock_in_time) {
          const isLate = newStatus === 'LATE' || payload.new.is_late;
          triggerLiveNotification({
            id: `sb-in-${Date.now()}`,
            title: isLate
              ? (language === 'mr' ? 'उशिरा आगमन इशारा (Late Arrival)' : 'Late Arrival Alert (Past Grace Period)')
              : t.clockInAlertTitle,
            message: isLate
              ? (language === 'mr'
                ? `${currentChild.first_name} ${currentChild.last_name} सकाळी ${arrivalFormatted} वाजता उशिरा शाळेत दाखल झाला आहे.`
                : `Your child ${currentChild.first_name} ${currentChild.last_name} clocked IN late at ${arrivalFormatted} (grace period exceeded).`)
              : t.clockInAlertBody.replace('{name}', `${currentChild.first_name} ${currentChild.last_name}`).replace('{time}', arrivalFormatted),
            type: isLate ? 'LATE' : 'CHECK_IN',
            timestamp: t.justNow,
            is_read: false,
            student_id: currentChild.id
          });
        } else if (newStatus === 'ABSENT' && prevStatus !== 'ABSENT') {
          triggerLiveNotification({
            id: `sb-abs-${Date.now()}`,
            title: language === 'mr' ? 'शाळेत अनुपस्थिती इशारा (Absence Alert)' : 'Urgent: Student Marked Absent Today',
            message: language === 'mr'
              ? `${currentChild.first_name} ${currentChild.last_name} आज शाळेत गैरहजर नोंदवला गेला आहे (कटऑफ वेळ सकाळी १०:००).`
              : `Your child ${currentChild.first_name} ${currentChild.last_name} has been marked ABSENT today. No biometric punch recorded before the 10:00 AM cutoff.`,
            type: 'ABSENT',
            timestamp: t.justNow,
            is_read: false,
            student_id: currentChild.id
          });
        } else if (newStatus === 'ON_LEAVE' && prevStatus !== 'ON_LEAVE') {
          triggerLiveNotification({
            id: `sb-lve-${Date.now()}`,
            title: language === 'mr' ? 'मंजूर रजा सक्रिय (On Leave)' : 'Approved Leave Active',
            message: language === 'mr'
              ? `${currentChild.first_name} ${currentChild.last_name} आज मंजूर रजेवर आहे.`
              : `Your child ${currentChild.first_name} ${currentChild.last_name} is marked On Leave for today under an approved application.`,
            type: 'LEAVE_STATUS',
            timestamp: t.justNow,
            is_read: false,
            student_id: currentChild.id
          });
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [children, selectedChildIndex, language]);

  const handleToggleTheme = () => {
    setThemeMode((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  const handleToggleLanguage = () => {
    setLanguage((prev) => (prev === 'en' ? 'mr' : 'en'));
  };

  const handleSignOut = () => {
    if (expoPushToken) {
      unregisterPushToken(activeParentRecord.id, expoPushToken);
    }
    setExpoPushToken(null);
    setAuthenticatedEmail(null);
    setCurrentTab('HOME');
  };

  const handleMarkAllAlertsRead = () => {
    markAllNotificationsAsRead(activeParentRecord.id);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleToggleAlertRead = (id: string) => {
    markNotificationAsRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: !n.is_read } : n))
    );
  };

  if (!authenticatedEmail) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
        <StatusBar
          barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
          backgroundColor={theme.background}
        />
        <LoginScreen
          theme={theme}
          language={language}
          onLoginSuccess={(email) => setAuthenticatedEmail(email)}
          onToggleLanguage={handleToggleLanguage}
        />
      </SafeAreaView>
    );
  }

  const selectedChild = children[selectedChildIndex] || children[0];

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: theme.background }]}>
      <StatusBar
        barStyle={themeMode === 'dark' ? 'light-content' : 'dark-content'}
        backgroundColor={theme.card}
      />

      {/* Floating Heads-Up Live Attendance Notification Banner */}
      {activeLiveAlert && (
        <Animated.View
          style={[
            styles.floatingBanner,
            {
              backgroundColor: themeMode === 'dark' ? '#1E293B' : '#FFFFFF',
              borderColor:
                activeLiveAlert.type === 'CHECK_IN' ? '#10B981' :
                  activeLiveAlert.type === 'CHECK_OUT' ? '#3B82F6' :
                    activeLiveAlert.type === 'ABSENT' ? '#EF4444' :
                      activeLiveAlert.type === 'LATE' ? '#F59E0B' : '#6366F1',
              transform: [{ translateY: alertAnim }]
            }
          ]}
        >
          <View style={styles.bannerRow}>
            <View
              style={[
                styles.bannerIconBadge,
                {
                  backgroundColor:
                    activeLiveAlert.type === 'CHECK_IN' ? 'rgba(16, 185, 129, 0.15)' :
                      activeLiveAlert.type === 'CHECK_OUT' ? 'rgba(59, 130, 246, 0.15)' :
                        activeLiveAlert.type === 'ABSENT' ? 'rgba(239, 68, 68, 0.15)' :
                          activeLiveAlert.type === 'LATE' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(99, 102, 241, 0.15)'
                }
              ]}
            >
              <Text style={{ fontSize: 20 }}>
                {activeLiveAlert.type === 'CHECK_IN' ? '📥' :
                  activeLiveAlert.type === 'CHECK_OUT' ? '📤' :
                    activeLiveAlert.type === 'ABSENT' ? '⚠️' :
                      activeLiveAlert.type === 'LATE' ? '⏳' : '📝'}
              </Text>
            </View>

            <TouchableOpacity
              style={styles.bannerTextArea}
              onPress={() => {
                handleDismissLiveAlert();
                setCurrentTab('NOTIFICATIONS');
              }}
              activeOpacity={0.8}
            >
              <View style={styles.bannerHeaderRow}>
                <Text style={[styles.bannerAppTag, { color: theme.primary }]}>
                  {t.liveAlertBanner}
                </Text>
                <Text style={[styles.bannerTime, { color: theme.textMuted }]}>
                  {activeLiveAlert.timestamp}
                </Text>
              </View>
              <Text style={[styles.bannerTitle, { color: theme.textPrimary }]} numberOfLines={1}>
                {activeLiveAlert.title}
              </Text>
              <Text style={[styles.bannerBody, { color: theme.textSecondary }]} numberOfLines={2}>
                {activeLiveAlert.message}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.bannerCloseBtn}
              onPress={handleDismissLiveAlert}
              activeOpacity={0.7}
            >
              <Text style={[styles.bannerCloseText, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      )}

      {/* Screen Body */}
      <View style={{ flex: 1 }}>
        {currentTab === 'HOME' && (
          <HomeScreen
            theme={theme}
            language={language}
            parent={parentUser}
            children={children}
            selectedChildIndex={selectedChildIndex}
            onSelectChild={setSelectedChildIndex}
            onNavigateTab={setCurrentTab}
            onOpenLeaveModal={() => setLeaveModalVisible(true)}
            unreadNotificationCount={unreadAlertsCount}
            onTriggerPunch={handleTriggerPunch}
          />
        )}

        {currentTab === 'ATTENDANCE' && selectedChild && (
          <AttendanceScreen
            theme={theme}
            language={language}
            child={selectedChild}
          />
        )}

        {currentTab === 'MESSAGES' && (
          <MessagesScreen
            theme={theme}
            language={language}
          />
        )}

        {currentTab === 'NOTIFICATIONS' && (
          <NotificationsScreen
            theme={theme}
            language={language}
            alerts={notifications}
            onMarkAllRead={handleMarkAllAlertsRead}
            onToggleRead={handleToggleAlertRead}
            onSimulatePunch={handleTriggerPunch}
          />
        )}

        {currentTab === 'PROFILE' && (
          <ProfileScreen
            theme={theme}
            themeMode={themeMode}
            language={language}
            parent={parentUser}
            children={children}
            onToggleTheme={handleToggleTheme}
            onSetLanguage={setLanguage}
            onSignOut={handleSignOut}
          />
        )}
      </View>

      {/* Bottom Navigation Bar */}
      <View
        style={[
          styles.bottomNav,
          {
            backgroundColor: theme.tabBarBg,
            borderTopColor: theme.tabBarBorder
          }
        ]}
      >
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('HOME')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navEmoji, currentTab === 'HOME' && { transform: [{ scale: 1.1 }] }]}>
            🏠
          </Text>
          <Text
            style={[
              styles.navLabel,
              { color: currentTab === 'HOME' ? theme.tabBarActive : theme.tabBarInactive }
            ]}
          >
            {t.home}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('ATTENDANCE')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navEmoji, currentTab === 'ATTENDANCE' && { transform: [{ scale: 1.1 }] }]}>
            📅
          </Text>
          <Text
            style={[
              styles.navLabel,
              { color: currentTab === 'ATTENDANCE' ? theme.tabBarActive : theme.tabBarInactive }
            ]}
          >
            {t.attendance}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('MESSAGES')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navEmoji, currentTab === 'MESSAGES' && { transform: [{ scale: 1.1 }] }]}>
            📢
          </Text>
          <Text
            style={[
              styles.navLabel,
              { color: currentTab === 'MESSAGES' ? theme.tabBarActive : theme.tabBarInactive }
            ]}
          >
            {t.messages}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('NOTIFICATIONS')}
          activeOpacity={0.7}
        >
          <View style={{ position: 'relative' }}>
            <Text style={[styles.navEmoji, currentTab === 'NOTIFICATIONS' && { transform: [{ scale: 1.1 }] }]}>
              🔔
            </Text>
            {unreadAlertsCount > 0 && (
              <View style={styles.navBadgeDot}>
                <Text style={styles.badgeTextSmall}>
                  {unreadAlertsCount > 9 ? '9+' : unreadAlertsCount}
                </Text>
              </View>
            )}
          </View>
          <Text
            style={[
              styles.navLabel,
              { color: currentTab === 'NOTIFICATIONS' ? theme.tabBarActive : theme.tabBarInactive }
            ]}
          >
            {t.notifications}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCurrentTab('PROFILE')}
          activeOpacity={0.7}
        >
          <Text style={[styles.navEmoji, currentTab === 'PROFILE' && { transform: [{ scale: 1.1 }] }]}>
            👤
          </Text>
          <Text
            style={[
              styles.navLabel,
              { color: currentTab === 'PROFILE' ? theme.tabBarActive : theme.tabBarInactive }
            ]}
          >
            {t.profile}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Leave Application Modal Sheet */}
      {selectedChild && (
        <LeaveRequestModal
          visible={leaveModalVisible}
          theme={theme}
          language={language}
          child={selectedChild}
          parent={parentUser}
          onClose={() => setLeaveModalVisible(false)}
          onSubmitSuccess={() => { }}
        />
      )}
    </SafeAreaView>
  );
}

function formatTimeStr(timeString: string): string {
  if (!timeString) return '';
  if (timeString.includes('AM') || timeString.includes('PM')) return timeString;
  const parts = timeString.split(':');
  if (parts.length >= 2) {
    let hours = parseInt(parts[0], 10);
    const mins = parts[1];
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours < 10 ? '0' + hours : hours}:${mins} ${ampm}`;
  }
  return timeString;
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
    position: 'relative'
  },
  floatingBanner: {
    position: 'absolute',
    top: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + 6 : 48,
    left: 12,
    right: 12,
    zIndex: 9999,
    borderRadius: 16,
    borderWidth: 1.5,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 12
  },
  bannerRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  bannerIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 21,
    alignItems: 'center',
    justifyContent: 'center'
  },
  bannerTextArea: {
    flex: 1,
    marginLeft: 12,
    marginRight: 6
  },
  bannerHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2
  },
  bannerAppTag: {
    fontSize: 10,
    fontWeight: '800',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  bannerTime: {
    fontSize: 10
  },
  bannerTitle: {
    fontSize: 13,
    fontWeight: '800'
  },
  bannerBody: {
    fontSize: 11,
    lineHeight: 15,
    marginTop: 2
  },
  bannerCloseBtn: {
    padding: 6,
    borderRadius: 12
  },
  bannerCloseText: {
    fontSize: 16,
    fontWeight: '700'
  },
  badgeTextSmall: {
    color: '#FFFFFF',
    fontSize: 8,
    fontWeight: '900'
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 8,
    paddingBottom: Platform.OS === 'ios' ? 24 : 10,
    borderTopWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 8
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1
  },
  navEmoji: {
    fontSize: 20
  },
  navLabel: {
    fontSize: 10,
    fontWeight: '700',
    marginTop: 3
  },
  navBadgeDot: {
    position: 'absolute',
    top: -2,
    right: -8,
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#EF4444',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2
  }
});

registerRootComponent(App);
