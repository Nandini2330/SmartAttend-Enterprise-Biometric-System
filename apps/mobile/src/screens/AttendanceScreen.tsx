import React, { useState, useEffect } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Modal,
  ActivityIndicator
} from 'react-native';
import { ThemeColors } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { ChildRecord, DailyLedgerItem, LanguageCode } from '../types';
import { getAttendanceHistory } from '../lib/supabase';

interface AttendanceScreenProps {
  theme: ThemeColors;
  language: LanguageCode;
  child: ChildRecord;
}

export const AttendanceScreen: React.FC<AttendanceScreenProps> = ({
  theme,
  language,
  child
}) => {
  const t = useI18n(language);
  const [ledger, setLedger] = useState<DailyLedgerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedItem, setSelectedItem] = useState<DailyLedgerItem | null>(null);
  const [filterMode, setFilterMode] = useState<'MONTHLY' | 'WEEKLY' | 'ALL'>('MONTHLY');

  useEffect(() => {
    let isMounted = true;
    setLoading(true);

    getAttendanceHistory(child.id).then((items) => {
      if (isMounted) {
        setLedger(items);
        setLoading(false);
      }
    });

    return () => {
      isMounted = false;
    };
  }, [child.id]);

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

  const filteredLedger = filterMode === 'WEEKLY' ? ledger.slice(0, 7) : ledger;

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Header Summary Card */}
      <View style={[styles.summaryCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.summaryTopRow}>
          <View>
            <Text style={[styles.childName, { color: theme.textPrimary }]}>
              {child.first_name} {child.last_name}
            </Text>
            <Text style={[styles.childClass, { color: theme.textSecondary }]}>
              {child.class_name}-{child.division_name} • {t.currentSession}
            </Text>
          </View>

          <View
            style={[
              styles.compliancePill,
              {
                backgroundColor: child.monthly_rate >= 75 ? theme.presentBg : theme.absentBg,
                borderColor: child.monthly_rate >= 75 ? theme.present : theme.absent
              }
            ]}
          >
            <Text
              style={[
                styles.complianceText,
                { color: child.monthly_rate >= 75 ? theme.presentText : theme.absentText }
              ]}
            >
              {child.monthly_rate >= 75 ? t.cbseCompliant : t.cbseWarning}
            </Text>
          </View>
        </View>

        {/* Big Percentage Bar */}
        <View style={styles.percentContainer}>
          <View style={styles.percentHeader}>
            <Text style={[styles.percentLabel, { color: theme.textSecondary }]}>{t.monthlyAttendance}</Text>
            <Text style={[styles.percentValue, { color: theme.primary }]}>{child.monthly_rate}%</Text>
          </View>
          <View style={[styles.progressBarTrack, { backgroundColor: theme.border }]}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${child.monthly_rate}%`,
                  backgroundColor: child.monthly_rate >= 75 ? theme.present : theme.absent
                }
              ]}
            />
          </View>
        </View>

        {/* Mini 4-stat chips */}
        <View style={styles.chipsRow}>
          <View style={styles.chip}>
            <Text style={[styles.chipNumber, { color: theme.present }]}>{child.present_days}</Text>
            <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>{t.presentDays}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={[styles.chipNumber, { color: theme.late }]}>{child.late_days}</Text>
            <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>{t.lateDays}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={[styles.chipNumber, { color: theme.absent }]}>{child.absent_days}</Text>
            <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>{t.absentDays}</Text>
          </View>
          <View style={styles.chip}>
            <Text style={[styles.chipNumber, { color: theme.leave }]}>{child.leave_days}</Text>
            <Text style={[styles.chipLabel, { color: theme.textSecondary }]}>{t.leaveDays}</Text>
          </View>
        </View>
      </View>

      {/* 2. Filter Segment Control */}
      <View style={[styles.filterBar, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'MONTHLY' && { backgroundColor: theme.primary }]}
          onPress={() => setFilterMode('MONTHLY')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filterMode === 'MONTHLY' ? '#FFFFFF' : theme.textSecondary }
            ]}
          >
            {t.monthly}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'WEEKLY' && { backgroundColor: theme.primary }]}
          onPress={() => setFilterMode('WEEKLY')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filterMode === 'WEEKLY' ? '#FFFFFF' : theme.textSecondary }
            ]}
          >
            {t.weekly}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.filterBtn, filterMode === 'ALL' && { backgroundColor: theme.primary }]}
          onPress={() => setFilterMode('ALL')}
        >
          <Text
            style={[
              styles.filterText,
              { color: filterMode === 'ALL' ? '#FFFFFF' : theme.textSecondary }
            ]}
          >
            All Ledger
          </Text>
        </TouchableOpacity>
      </View>

      {/* 3. Daily Ledger Table */}
      <View style={styles.ledgerSection}>
        <View style={styles.ledgerHeader}>
          <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>{t.dailyLedger}</Text>
          <Text style={[styles.subHint, { color: theme.textMuted }]}>{t.selectDate}</Text>
        </View>

        {loading ? (
          <View style={{ padding: 40, alignItems: 'center' }}>
            <ActivityIndicator color={theme.primary} size="large" />
          </View>
        ) : (
          <View style={styles.ledgerList}>
            {filteredLedger.map((item) => {
              const badge = getStatusBadge(item.status);
              return (
                <TouchableOpacity
                  key={item.id}
                  style={[styles.ledgerRow, { backgroundColor: theme.card, borderColor: theme.border }]}
                  onPress={() => setSelectedItem(item)}
                  activeOpacity={0.7}
                >
                  <View style={styles.dateCol}>
                    <Text style={[styles.rowDate, { color: theme.textPrimary }]}>{item.date}</Text>
                    <Text style={[styles.rowDay, { color: theme.textSecondary }]}>{item.day_name}</Text>
                  </View>

                  <View style={styles.timeCol}>
                    <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>In: {item.clock_in_time || '--'}</Text>
                    <Text style={[styles.timeLabel, { color: theme.textSecondary }]}>Out: {item.clock_out_time || '--'}</Text>
                  </View>

                  <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.border }]}>
                    <Text style={[styles.badgeText, { color: badge.color }]}>{badge.label}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}
      </View>

      {/* 4. Attendance Detail Modal */}
      {selectedItem && (
        <Modal
          visible={true}
          transparent={true}
          animationType="fade"
          onRequestClose={() => setSelectedItem(null)}
        >
          <View style={styles.modalOverlay}>
            <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
              <View style={styles.modalHeader}>
                <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{t.attendanceDetails}</Text>
                <TouchableOpacity onPress={() => setSelectedItem(null)}>
                  <Text style={[styles.modalCloseText, { color: theme.textMuted }]}>✕</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.modalDivider, { backgroundColor: theme.border }]} />

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.textSecondary }]}>Date:</Text>
                <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                  {selectedItem.date} ({selectedItem.day_name})
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.textSecondary }]}>Status:</Text>
                <View
                  style={[
                    styles.badge,
                    {
                      backgroundColor: getStatusBadge(selectedItem.status).bg,
                      borderColor: getStatusBadge(selectedItem.status).border
                    }
                  ]}
                >
                  <Text style={[styles.badgeText, { color: getStatusBadge(selectedItem.status).color }]}>
                    {getStatusBadge(selectedItem.status).label}
                  </Text>
                </View>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.textSecondary }]}>{t.clockIn}:</Text>
                <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                  {selectedItem.clock_in_time || 'Not Recorded'}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.textSecondary }]}>{t.clockOut}:</Text>
                <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                  {selectedItem.clock_out_time || t.notCheckedOut}
                </Text>
              </View>

              <View style={styles.detailRow}>
                <Text style={[styles.detailKey, { color: theme.textSecondary }]}>{t.verificationMethod}:</Text>
                <Text style={[styles.detailVal, { color: theme.textPrimary }]}>
                  {selectedItem.method || 'Biometric Verification'}
                </Text>
              </View>

              {selectedItem.is_late && (
                <View style={styles.detailRow}>
                  <Text style={[styles.detailKey, { color: theme.late }]}>{t.late}:</Text>
                  <Text style={[styles.detailVal, { color: theme.late }]}>
                    {selectedItem.minutes_late} Minutes after 08:30
                  </Text>
                </View>
              )}

              <View style={styles.remarksBox}>
                <Text style={[styles.remarksLabel, { color: theme.textSecondary }]}>{t.remarks}</Text>
                <Text style={[styles.remarksContent, { color: theme.textPrimary }]}>
                  {selectedItem.remarks || 'Biometric terminal scan successfully committed to PostgreSQL database.'}
                </Text>
              </View>

              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: theme.primary }]}
                onPress={() => setSelectedItem(null)}
              >
                <Text style={styles.modalBtnText}>{t.close}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}
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
  summaryCard: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  summaryTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start'
  },
  childName: {
    fontSize: 16,
    fontWeight: '800'
  },
  childClass: {
    fontSize: 12,
    marginTop: 2
  },
  compliancePill: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1
  },
  complianceText: {
    fontSize: 10,
    fontWeight: '800'
  },
  percentContainer: {
    marginTop: 16
  },
  percentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  percentLabel: {
    fontSize: 12,
    fontWeight: '600'
  },
  percentValue: {
    fontSize: 18,
    fontWeight: '900'
  },
  progressBarTrack: {
    height: 8,
    borderRadius: 4,
    overflow: 'hidden'
  },
  progressBarFill: {
    height: 8,
    borderRadius: 4
  },
  chipsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(150, 150, 150, 0.1)'
  },
  chip: {
    alignItems: 'center',
    flex: 1
  },
  chipNumber: {
    fontSize: 15,
    fontWeight: '800'
  },
  chipLabel: {
    fontSize: 10,
    fontWeight: '600',
    marginTop: 2
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
    paddingVertical: 8,
    alignItems: 'center',
    borderRadius: 9
  },
  filterText: {
    fontSize: 12,
    fontWeight: '700'
  },
  ledgerSection: {
    marginBottom: 16
  },
  ledgerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  subHint: {
    fontSize: 10,
    fontStyle: 'italic'
  },
  ledgerList: {
    gap: 8
  },
  ledgerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  dateCol: {
    flex: 1.2
  },
  rowDate: {
    fontSize: 13,
    fontWeight: '700'
  },
  rowDay: {
    fontSize: 11,
    marginTop: 1
  },
  timeCol: {
    flex: 1.5
  },
  timeLabel: {
    fontSize: 11
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1
  },
  badgeText: {
    fontSize: 11,
    fontWeight: '800'
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20
  },
  modalCard: {
    width: '100%',
    maxWidth: 360,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800'
  },
  modalCloseText: {
    fontSize: 18,
    padding: 4
  },
  modalDivider: {
    height: 1,
    marginVertical: 12
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6
  },
  detailKey: {
    fontSize: 13,
    fontWeight: '600'
  },
  detailVal: {
    fontSize: 13,
    fontWeight: '700'
  },
  remarksBox: {
    backgroundColor: 'rgba(150,150,150,0.08)',
    borderRadius: 10,
    padding: 10,
    marginTop: 12
  },
  remarksLabel: {
    fontSize: 11,
    fontWeight: '700',
    marginBottom: 2
  },
  remarksContent: {
    fontSize: 12,
    lineHeight: 16
  },
  modalBtn: {
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16
  },
  modalBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});

