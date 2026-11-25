import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity
} from 'react-native';
import { ThemeColors } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { ChildRecord, LanguageCode, ParentUser } from '../types';

interface HomeScreenProps {
  theme: ThemeColors;
  language: LanguageCode;
  parent: ParentUser;
  children: ChildRecord[];
  selectedChildIndex: number;
  onSelectChild: (index: number) => void;
  onNavigateTab: (tab: 'HOME' | 'ATTENDANCE' | 'MESSAGES' | 'NOTIFICATIONS' | 'PROFILE') => void;
  onOpenLeaveModal: () => void;
  unreadNotificationCount?: number;
  onTriggerPunch?: (type: 'CHECK_IN' | 'CHECK_OUT' | 'ABSENT') => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  theme,
  language,
  parent,
  children,
  selectedChildIndex,
  onSelectChild,
  onNavigateTab,
  onOpenLeaveModal,
  unreadNotificationCount = 0,
  onTriggerPunch
}) => {
  const t = useI18n(language);
  const child = children[selectedChildIndex] || children[0];

  const currentDateStr = new Date().toLocaleDateString(language === 'mr' ? 'mr-IN' : 'en-US', {
    weekday: 'long',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return { label: t.present, bg: theme.presentBg, color: theme.presentText, border: theme.present };
      case 'LATE':
        return { label: t.late, bg: theme.lateBg, color: theme.lateText, border: theme.late };
      case 'ABSENT':
        return { label: t.absent, bg: theme.absentBg, color: theme.absentText, border: theme.absent };
      case 'ON_LEAVE':
        return { label: t.leave, bg: theme.leaveBg, color: theme.leaveText, border: theme.leave };
      default:
        return { label: t.present, bg: theme.presentBg, color: theme.presentText, border: theme.present };
    }
  };

  const statusBadge = getStatusBadge(child?.today_status || 'PRESENT');

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. School Header & Welcome Banner */}
      <View style={[styles.headerCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.schoolRow}>
          <View style={styles.schoolInfo}>
            <Text style={[styles.schoolName, { color: theme.textPrimary }]}>{parent.school_name}</Text>
            <View style={styles.codeContainer}>
              <Text style={[styles.schoolCode, { backgroundColor: theme.primaryLight, color: theme.primary }]}>
                {parent.school_code}
              </Text>
              <Text style={[styles.dateText, { color: theme.textSecondary }]}>•  {currentDateStr}</Text>
            </View>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <TouchableOpacity
              style={[styles.bellBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
              onPress={() => onNavigateTab('NOTIFICATIONS')}
              activeOpacity={0.7}
            >
              <Text style={{ fontSize: 16 }}>🔔</Text>
              {unreadNotificationCount > 0 && (
                <View style={styles.bellBadge}>
                  <Text style={styles.bellBadgeText}>{unreadNotificationCount > 9 ? '9+' : unreadNotificationCount}</Text>
                </View>
              )}
            </TouchableOpacity>

            <View style={[styles.liveDotContainer, { backgroundColor: theme.presentBg, marginLeft: 8 }]}>
              <View style={[styles.liveDot, { backgroundColor: theme.present }]} />
              <Text style={[styles.liveText, { color: theme.presentText }]}>LIVE</Text>
            </View>
          </View>
        </View>

        <View style={styles.welcomeRow}>
          <Image source={{ uri: parent.avatar_url }} style={styles.parentAvatar} />
          <View style={{ flex: 1, marginLeft: 12 }}>
            <Text style={[styles.welcomeLabel, { color: theme.textSecondary }]}>{t.welcomeBack},</Text>
            <Text style={[styles.parentName, { color: theme.textPrimary }]}>{parent.name}</Text>
          </View>
        </View>
      </View>

      {/* 2. Child Selector (Multi-Child Support) */}
      {children.length > 1 && (
        <View style={styles.childSelectorSection}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
            {t.switchChild} ({children.length})
          </Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.childScroll}>
            {children.map((c, idx) => {
              const isSelected = idx === selectedChildIndex;
              return (
                <TouchableOpacity
                  key={c.id}
                  style={[
                    styles.childPill,
                    {
                      backgroundColor: isSelected ? theme.primary : theme.card,
                      borderColor: isSelected ? theme.primary : theme.border
                    }
                  ]}
                  onPress={() => onSelectChild(idx)}
                  activeOpacity={0.8}
                >
                  <Image source={{ uri: c.avatar_url }} style={styles.childPillAvatar} />
                  <View style={{ marginLeft: 8 }}>
                    <Text
                      style={[
                        styles.childPillName,
                        { color: isSelected ? '#FFFFFF' : theme.textPrimary }
                      ]}
                    >
                      {c.first_name} {c.last_name}
                    </Text>
                    <Text
                      style={[
                        styles.childPillClass,
                        { color: isSelected ? 'rgba(255,255,255,0.85)' : theme.textSecondary }
                      ]}
                    >
                      {c.class_name}-{c.division_name}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>
      )}

      {/* 3. Selected Child Profile Card */}
      {child && (
        <View style={[styles.childCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.childHeaderRow}>
            <Image source={{ uri: child.avatar_url }} style={styles.studentAvatar} />
            <View style={{ flex: 1, marginLeft: 14 }}>
              <View style={styles.studentTitleRow}>
                <Text style={[styles.studentName, { color: theme.textPrimary }]}>
                  {child.first_name} {child.last_name}
                </Text>
                <View style={[styles.badge, { backgroundColor: statusBadge.bg, borderColor: statusBadge.border }]}>
                  <Text style={[styles.badgeText, { color: statusBadge.color }]}>{statusBadge.label}</Text>
                </View>
              </View>

              <Text style={[styles.studentClass, { color: theme.textSecondary }]}>
                {child.class_name} • Section {child.division_name}
              </Text>

              <View style={styles.metaRow}>
                <Text style={[styles.metaText, { color: theme.textMuted }]}>
                  Roll #{child.roll_number}
                </Text>
                <Text style={[styles.metaDivider, { color: theme.border }]}>|</Text>
                <Text style={[styles.metaText, { color: theme.textMuted }]}>
                  Adm: {child.admission_number}
                </Text>
              </View>
            </View>
          </View>
        </View>
      )}

      {/* 4. Clock In / Clock Out Section (CRITICAL FEATURE) */}
      <View style={styles.clockSection}>
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          {t.todayStatus} & Attendance Verification
        </Text>

        <View style={styles.clockGrid}>
          {/* Clock In Card */}
          <View
            style={[
              styles.clockCard,
              { backgroundColor: theme.card, borderColor: child?.clock_in_time ? theme.present : theme.border }
            ]}
          >
            <View style={styles.clockCardHeader}>
              <View style={[styles.clockIconBadge, { backgroundColor: theme.presentBg }]}>
                <Text style={styles.clockIconEmoji}>📥</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.clockLabel, { color: theme.textSecondary }]}>{t.clockIn}</Text>
                <Text style={[styles.clockTime, { color: child?.clock_in_time ? theme.textPrimary : theme.textMuted }]}>
                  {child?.clock_in_time || '--:--'}
                </Text>
              </View>
              <View
                style={[
                  styles.verifiedPill,
                  { backgroundColor: child?.clock_in_time ? theme.presentBg : theme.pendingBg }
                ]}
              >
                <Text
                  style={[
                    styles.verifiedText,
                    { color: child?.clock_in_time ? theme.presentText : theme.pendingText }
                  ]}
                >
                  {child?.clock_in_time ? t.completed : t.pending}
                </Text>
              </View>
            </View>

            <View style={[styles.clockDivider, { backgroundColor: theme.border }]} />

            <View style={styles.clockFooter}>
              <Text style={[styles.clockSubtext, { color: child?.clock_in_time ? theme.presentText : theme.textMuted }]}>
                {child?.clock_in_time ? `✓ ${t.safeArrival}` : t.pending}
              </Text>
              {child?.clock_in_method && (
                <Text style={[styles.methodText, { color: theme.textSecondary }]}>
                  {child.clock_in_method}
                </Text>
              )}
            </View>
          </View>

          {/* Clock Out Card */}
          <View
            style={[
              styles.clockCard,
              { backgroundColor: theme.card, borderColor: child?.clock_out_time ? theme.present : theme.border }
            ]}
          >
            <View style={styles.clockCardHeader}>
              <View style={[styles.clockIconBadge, { backgroundColor: child?.clock_out_time ? theme.presentBg : theme.lateBg }]}>
                <Text style={styles.clockIconEmoji}>📤</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.clockLabel, { color: theme.textSecondary }]}>{t.clockOut}</Text>
                <Text style={[styles.clockTime, { color: child?.clock_out_time ? theme.textPrimary : theme.textMuted }]}>
                  {child?.clock_out_time || t.notCheckedOut}
                </Text>
              </View>
              <View
                style={[
                  styles.verifiedPill,
                  { backgroundColor: child?.clock_out_time ? theme.presentBg : theme.lateBg }
                ]}
              >
                <Text
                  style={[
                    styles.verifiedText,
                    { color: child?.clock_out_time ? theme.presentText : theme.lateText }
                  ]}
                >
                  {child?.clock_out_time ? t.completed : t.inSession}
                </Text>
              </View>
            </View>

            <View style={[styles.clockDivider, { backgroundColor: theme.border }]} />

            <View style={styles.clockFooter}>
              <Text style={[styles.clockSubtext, { color: child?.clock_out_time ? theme.presentText : theme.lateText }]}>
                {child?.clock_out_time ? `✓ ${t.safeDeparture}` : `⏳ ${t.inSession}`}
              </Text>
              {child?.clock_out_time && (
                <Text style={[styles.methodText, { color: theme.textSecondary }]}>
                  Biometric Terminal
                </Text>
              )}
            </View>
          </View>
        </View>

        <Text style={[styles.securityNotice, { color: theme.textMuted }]}>
          🔒 Read-only parent view: Timestamps are committed by authorized biometric hardware.
        </Text>

        {/* Live Attendance Punch Simulation / Instant Test Buttons */}
        <View style={[styles.simCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.simHeaderRow}>
            <Text style={{ fontSize: 13, fontWeight: '800', color: theme.textPrimary }}>
              ⚡ {t.simulatePunchSection}
            </Text>
            <View style={[styles.simBadge, { backgroundColor: theme.primaryLight }]}>
              <Text style={[styles.simBadgeText, { color: theme.primary }]}>Live Push Test</Text>
            </View>
          </View>
          <Text style={[styles.simDesc, { color: theme.textSecondary }]}>
            {t.testPunchPrompt}
          </Text>
          <View style={styles.simButtonsRow}>
            <TouchableOpacity
              style={[styles.simClockInBtn, { backgroundColor: theme.present }]}
              onPress={() => onTriggerPunch?.('CHECK_IN')}
              activeOpacity={0.8}
            >
              <Text style={styles.simBtnText}>{t.simulateClockIn}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.simClockOutBtn, { backgroundColor: theme.primary }]}
              onPress={() => onTriggerPunch?.('CHECK_OUT')}
              activeOpacity={0.8}
            >
              <Text style={styles.simBtnText}>{t.simulateClockOut}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.simAbsentBtn, { backgroundColor: theme.absent }]}
              onPress={() => onTriggerPunch?.('ABSENT')}
              activeOpacity={0.8}
            >
              <Text style={styles.simBtnText}>
                {language === 'mr' ? '⚠️ गैरहजर (Absent)' : '⚠️ Absent'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 5. Four Attendance KPI Status Cards */}
      <View style={styles.kpiSection}>
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          {t.monthlyAttendance} ({t.currentSession})
        </Text>

        <View style={styles.kpiGrid}>
          {/* Present Card */}
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.kpiValue, { color: theme.present }]}>{child?.present_days ?? 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t.presentDays}</Text>
          </View>

          {/* Late Arrivals Card */}
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.kpiValue, { color: theme.late }]}>{child?.late_days ?? 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t.lateDays}</Text>
          </View>

          {/* Absent Days Card */}
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.kpiValue, { color: theme.absent }]}>{child?.absent_days ?? 0}</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>{t.absentDays}</Text>
          </View>

          {/* Monthly Attendance % Card */}
          <View style={[styles.kpiCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.kpiValue, { color: theme.primary }]}>{child?.monthly_rate ?? 0}%</Text>
            <Text style={[styles.kpiLabel, { color: theme.textSecondary }]}>
              {child?.monthly_rate && child.monthly_rate >= 75 ? 'CBSE Safe' : 'Risk'}
            </Text>
          </View>
        </View>
      </View>

      {/* 6. Quick Action Shortcuts */}
      <View style={styles.actionRow}>
        <TouchableOpacity
          style={[styles.primaryActionBtn, { backgroundColor: theme.primary }]}
          onPress={onOpenLeaveModal}
          activeOpacity={0.8}
        >
          <Text style={styles.primaryActionEmoji}>📝</Text>
          <Text style={styles.primaryActionText}>{t.applyLeave}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.secondaryActionBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => onNavigateTab('ATTENDANCE')}
          activeOpacity={0.8}
        >
          <Text style={styles.secondaryActionEmoji}>📅</Text>
          <Text style={[styles.secondaryActionText, { color: theme.textPrimary }]}>{t.attendanceHistory}</Text>
        </TouchableOpacity>
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
  headerCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  schoolRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    paddingBottom: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(150, 150, 150, 0.1)'
  },
  schoolInfo: {
    flex: 1
  },
  schoolName: {
    fontSize: 14,
    fontWeight: '800'
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  schoolCode: {
    fontSize: 10,
    fontWeight: '700',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6
  },
  dateText: {
    fontSize: 11,
    marginLeft: 6
  },
  liveDotContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12
  },
  liveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 4
  },
  liveText: {
    fontSize: 10,
    fontWeight: '800'
  },
  welcomeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 12
  },
  parentAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20
  },
  welcomeLabel: {
    fontSize: 12
  },
  parentName: {
    fontSize: 15,
    fontWeight: '800'
  },
  childSelectorSection: {
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  childScroll: {
    flexDirection: 'row'
  },
  childPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 14,
    borderWidth: 1,
    marginRight: 10
  },
  childPillAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16
  },
  childPillName: {
    fontSize: 13,
    fontWeight: '700'
  },
  childPillClass: {
    fontSize: 11
  },
  childCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  childHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  studentAvatar: {
    width: 54,
    height: 54,
    borderRadius: 27
  },
  studentTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  studentName: {
    fontSize: 16,
    fontWeight: '800'
  },
  studentClass: {
    fontSize: 13,
    marginTop: 2
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4
  },
  metaText: {
    fontSize: 11,
    fontWeight: '500'
  },
  metaDivider: {
    marginHorizontal: 8
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  clockSection: {
    marginBottom: 16
  },
  clockGrid: {
    gap: 12
  },
  clockCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5
  },
  clockCardHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  clockIconBadge: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  clockIconEmoji: {
    fontSize: 20
  },
  clockLabel: {
    fontSize: 11,
    fontWeight: '700',
    textTransform: 'uppercase'
  },
  clockTime: {
    fontSize: 16,
    fontWeight: '800',
    marginTop: 1
  },
  verifiedPill: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800'
  },
  clockDivider: {
    height: 1,
    marginVertical: 10
  },
  clockFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  clockSubtext: {
    fontSize: 11,
    fontWeight: '600'
  },
  methodText: {
    fontSize: 11,
    fontWeight: '500'
  },
  securityNotice: {
    fontSize: 11,
    marginTop: 8,
    textAlign: 'center',
    fontStyle: 'italic'
  },
  kpiSection: {
    marginBottom: 16
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10
  },
  kpiCard: {
    flex: 1,
    minWidth: '47%',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center'
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: '900'
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    marginTop: 4
  },
  actionRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 4
  },
  primaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14
  },
  primaryActionEmoji: {
    fontSize: 16,
    marginRight: 6
  },
  primaryActionText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700'
  },
  secondaryActionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1
  },
  secondaryActionEmoji: {
    fontSize: 16,
    marginRight: 6
  },
  secondaryActionText: {
    fontSize: 13,
    fontWeight: '700'
  },
  bellBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  bellBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#EF4444',
    minWidth: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3
  },
  bellBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800'
  },
  simCard: {
    marginTop: 14,
    borderRadius: 14,
    borderWidth: 1,
    padding: 12
  },
  simHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4
  },
  simBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8
  },
  simBadgeText: {
    fontSize: 10,
    fontWeight: '700'
  },
  simDesc: {
    fontSize: 11,
    lineHeight: 15,
    marginBottom: 10
  },
  simButtonsRow: {
    flexDirection: 'row',
    gap: 8
  },
  simClockInBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  simClockOutBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  simAbsentBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2
  },
  simBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800'
  }
});

