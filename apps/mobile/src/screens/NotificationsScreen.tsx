import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity
} from 'react-native';
import { ThemeColors } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { LanguageCode, NotificationItem } from '../types';

interface NotificationsScreenProps {
  theme: ThemeColors;
  language: LanguageCode;
  alerts?: NotificationItem[];
  onMarkAllRead?: () => void;
  onToggleRead?: (id: string) => void;
  onSimulatePunch?: (type: 'CHECK_IN' | 'CHECK_OUT' | 'ABSENT') => void;
}

const INITIAL_ALERTS: NotificationItem[] = [
  {
    id: 'n-1',
    title: 'Safe Gate Entry Verified (Clock In)',
    message: 'Your child Aarav Mehta has checked in safely at 08:24 AM via Face Recognition Kiosk 1.',
    type: 'CHECK_IN',
    timestamp: 'Today, 08:24 AM',
    is_read: false
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
    is_read: true
  },
  {
    id: 'n-5',
    title: 'CBSE Attendance Compliance Update',
    message: 'Monthly attendance confirmed at 96%. All admit card attendance thresholds satisfied.',
    type: 'URGENT',
    timestamp: '01 Nov 2026, 09:00 AM',
    is_read: true
  }
];

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({
  theme,
  language,
  alerts: propAlerts,
  onMarkAllRead: propMarkAllRead,
  onToggleRead: propToggleRead,
  onSimulatePunch
}) => {
  const t = useI18n(language);
  const [localAlerts, setLocalAlerts] = useState<NotificationItem[]>(INITIAL_ALERTS);
  const [filter, setFilter] = useState<'ALL' | 'UNREAD'>('ALL');

  const alerts = propAlerts || localAlerts;
  const unreadCount = alerts.filter((a) => !a.is_read).length;

  const handleMarkAllRead = () => {
    if (propMarkAllRead) {
      propMarkAllRead();
    } else {
      setLocalAlerts(localAlerts.map((a) => ({ ...a, is_read: true })));
    }
  };

  const handleToggleRead = (id: string) => {
    if (propToggleRead) {
      propToggleRead(id);
    } else {
      setLocalAlerts(
        localAlerts.map((a) => (a.id === id ? { ...a, is_read: !a.is_read } : a))
      );
    }
  };

  const filtered = filter === 'UNREAD' ? alerts.filter((a) => !a.is_read) : alerts;

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'CHECK_IN':
        return { emoji: '📥', bg: theme.presentBg, color: theme.present };
      case 'CHECK_OUT':
        return { emoji: '📤', bg: theme.leaveBg, color: theme.leave };
      case 'LATE':
        return { emoji: '⏳', bg: theme.lateBg, color: theme.late };
      case 'ABSENT':
        return { emoji: '⚠️', bg: theme.absentBg, color: theme.absent };
      case 'LEAVE_STATUS':
        return { emoji: '📝', bg: theme.presentBg, color: theme.present };
      default:
        return { emoji: '📢', bg: theme.primaryLight, color: theme.primary };
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.topRow}>
        <View>
          <Text style={[styles.title, { color: theme.textPrimary }]}>{t.alertsNotifications}</Text>
          <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
            {unreadCount > 0 ? `${unreadCount} unread alerts` : 'All alerts caught up'}
          </Text>
        </View>

        {unreadCount > 0 && (
          <TouchableOpacity
            style={[styles.markReadBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
            onPress={handleMarkAllRead}
          >
            <Text style={[styles.markReadText, { color: theme.primary }]}>{t.markAllRead}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={[styles.filterBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.filterBtn, filter === 'ALL' && { backgroundColor: theme.primary }]}
          onPress={() => setFilter('ALL')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'ALL' ? '#FFFFFF' : theme.textSecondary }
            ]}
          >
            All Alerts ({alerts.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filter === 'UNREAD' && { backgroundColor: theme.primary }]}
          onPress={() => setFilter('UNREAD')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filter === 'UNREAD' ? '#FFFFFF' : theme.textSecondary }
            ]}
          >
            Unread ({unreadCount})
          </Text>
        </TouchableOpacity>
      </View>

      {/* Real-time Punch Notification Testing Box */}
      <View style={[styles.testAlertBox, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary }}>
            ⚡ {t.simulatePunchSection}
          </Text>
          <View style={{ paddingHorizontal: 6, paddingVertical: 2, borderRadius: 6, backgroundColor: theme.primaryLight }}>
            <Text style={{ fontSize: 10, fontWeight: '700', color: theme.primary }}>Live Push</Text>
          </View>
        </View>
        <Text style={{ fontSize: 11, color: theme.textSecondary, marginBottom: 10 }}>
          {t.testPunchPrompt}
        </Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity
            style={[styles.testBtn, { backgroundColor: theme.presentBg, borderColor: theme.present }]}
            onPress={() => onSimulatePunch?.('CHECK_IN')}
            activeOpacity={0.7}
          >
            <Text style={[styles.testBtnText, { color: theme.presentText }]}>{t.simulateClockIn}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testBtn, { backgroundColor: theme.primaryLight, borderColor: theme.primary }]}
            onPress={() => onSimulatePunch?.('CHECK_OUT')}
            activeOpacity={0.7}
          >
            <Text style={[styles.testBtnText, { color: theme.primary }]}>{t.simulateClockOut}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.testBtn, { backgroundColor: theme.absentBg, borderColor: theme.absent }]}
            onPress={() => onSimulatePunch?.('ABSENT')}
            activeOpacity={0.7}
          >
            <Text style={[styles.testBtnText, { color: theme.absentText }]}>
              {language === 'mr' ? '⚠️ अनुपस्थिती' : '⚠️ Mark Absent'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Alert List */}
      <View style={styles.list}>
        {filtered.length === 0 ? (
          <View style={styles.emptyState}>
            <Text style={[styles.emptyText, { color: theme.textMuted }]}>{t.noNotifications}</Text>
          </View>
        ) : (
          filtered.map((item) => {
            const icon = getTypeIcon(item.type);
            return (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.card,
                  {
                    backgroundColor: theme.card,
                    borderColor: item.is_read ? theme.border : theme.primary,
                    borderLeftWidth: item.is_read ? 1 : 4,
                    borderLeftColor: item.is_read ? theme.border : theme.primary
                  }
                ]}
                onPress={() => handleToggleRead(item.id)}
                activeOpacity={0.7}
              >
                <View style={[styles.iconBadge, { backgroundColor: icon.bg }]}>
                  <Text style={styles.iconEmoji}>{icon.emoji}</Text>
                </View>

                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.itemHeader}>
                    <Text
                      style={[
                        styles.itemTitle,
                        { color: theme.textPrimary, fontWeight: item.is_read ? '700' : '900' }
                      ]}
                    >
                      {item.title}
                    </Text>
                    {!item.is_read && <View style={[styles.unreadDot, { backgroundColor: theme.primary }]} />}
                  </View>

                  <Text style={[styles.itemMessage, { color: theme.textSecondary }]}>{item.message}</Text>
                  <Text style={[styles.itemTime, { color: theme.textMuted }]}>{item.timestamp}</Text>
                </View>
              </TouchableOpacity>
            );
          })
        )}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 16,
    paddingTop: 8,
    paddingBottom: 32
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: 18,
    fontWeight: '800'
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2
  },
  markReadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1
  },
  markReadText: {
    fontSize: 11,
    fontWeight: '700'
  },
  filterBar: {
    flexDirection: 'row',
    borderRadius: 12,
    padding: 3,
    borderWidth: 1,
    marginBottom: 16
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 7,
    alignItems: 'center',
    borderRadius: 9
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700'
  },
  list: {
    gap: 10
  },
  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  iconBadge: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 2
  },
  iconEmoji: {
    fontSize: 18
  },
  itemHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  itemTitle: {
    fontSize: 13,
    flex: 1
  },
  unreadDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
    marginLeft: 6
  },
  itemMessage: {
    fontSize: 12,
    lineHeight: 16,
    marginTop: 4
  },
  itemTime: {
    fontSize: 10,
    marginTop: 6
  },
  emptyState: {
    padding: 40,
    alignItems: 'center'
  },
  emptyText: {
    fontSize: 13
  },
  testAlertBox: {
    borderRadius: 14,
    borderWidth: 1,
    padding: 12,
    marginBottom: 16
  },
  testBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  testBtnText: {
    fontSize: 11,
    fontWeight: '800'
  }
});

