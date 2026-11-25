import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  Modal,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  ActivityIndicator
} from 'react-native';
import { ThemeColors } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { ChildRecord, LanguageCode, ParentUser } from '../types';
import { submitLeaveRequest } from '../lib/supabase';

interface LeaveRequestModalProps {
  visible: boolean;
  theme: ThemeColors;
  language: LanguageCode;
  child: ChildRecord;
  parent: ParentUser;
  onClose: () => void;
  onSubmitSuccess: () => void;
}

export const LeaveRequestModal: React.FC<LeaveRequestModalProps> = ({
  visible,
  theme,
  language,
  child,
  parent,
  onClose,
  onSubmitSuccess
}) => {
  const t = useI18n(language);
  const tomorrow = new Date(Date.now() + 86400000).toISOString().split('T')[0];
  const dayAfter = new Date(Date.now() + 2 * 86400000).toISOString().split('T')[0];

  const [startDate, setStartDate] = useState(tomorrow);
  const [endDate, setEndDate] = useState(dayAfter);
  const [reason, setReason] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async () => {
    if (!reason.trim()) {
      Alert.alert('Required Field', 'Please provide a clear reason for the leave request.');
      return;
    }
    if (!description.trim()) {
      Alert.alert('Required Field', 'Please provide additional details for the teacher.');
      return;
    }

    setSubmitting(true);

    const res = await submitLeaveRequest({
      student_id: child.id,
      student_name: `${child.first_name} ${child.last_name}`,
      parent_name: parent.name,
      parent_phone: parent.phone,
      start_date: startDate,
      end_date: endDate,
      reason,
      description
    });

    setSubmitting(false);

    if (res.success) {
      Alert.alert(
        'Leave Application Submitted',
        `Your request for ${child.first_name} ${child.last_name} has been routed to the Class Teacher for verification.\n\nStatus: PENDING REVIEW`
      );
      setReason('');
      setDescription('');
      onSubmitSuccess();
      onClose();
    } else {
      Alert.alert('Submission Error', res.message);
    }
  };

  return (
    <Modal visible={visible} transparent={true} animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={[styles.container, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={[styles.title, { color: theme.textPrimary }]}>{t.newLeave}</Text>
              <Text style={[styles.studentSub, { color: theme.primary }]}>
                {child.first_name} {child.last_name} ({child.class_name}-{child.division_name})
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={[styles.closeText, { color: theme.textMuted }]}>✕</Text>
            </TouchableOpacity>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <ScrollView showsVerticalScrollIndicator={false} style={styles.formScroll}>
            {/* Disclaimer */}
            <View style={[styles.disclaimerBox, { backgroundColor: theme.lateBg, borderColor: theme.late }]}>
              <Text style={[styles.disclaimerText, { color: theme.lateText }]}>
                ⚠️ {t.leaveDisclaimer}
              </Text>
            </View>

            {/* Date Range Inputs */}
            <View style={styles.dateRow}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>{t.startDate}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                  value={startDate}
                  onChangeText={setStartDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textMuted}
                />
              </View>

              <View style={{ flex: 1, marginLeft: 8 }}>
                <Text style={[styles.label, { color: theme.textPrimary }]}>{t.endDate}</Text>
                <TextInput
                  style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                  value={endDate}
                  onChangeText={setEndDate}
                  placeholder="YYYY-MM-DD"
                  placeholderTextColor={theme.textMuted}
                />
              </View>
            </View>

            {/* Reason Input */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>{t.reason}</Text>
              <TextInput
                style={[styles.input, { borderColor: theme.border, color: theme.textPrimary }]}
                value={reason}
                onChangeText={setReason}
                placeholder={t.reasonPlaceholder}
                placeholderTextColor={theme.textMuted}
              />
            </View>

            {/* Detailed Description */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: theme.textPrimary }]}>{t.description}</Text>
              <TextInput
                style={[
                  styles.textArea,
                  { borderColor: theme.border, color: theme.textPrimary }
                ]}
                value={description}
                onChangeText={setDescription}
                placeholder={t.descriptionPlaceholder}
                placeholderTextColor={theme.textMuted}
                multiline
                numberOfLines={4}
              />
            </View>

            {/* Submit & Cancel Buttons */}
            <View style={styles.btnRow}>
              <TouchableOpacity
                style={[styles.cancelBtn, { borderColor: theme.border }]}
                onPress={onClose}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.submitBtn, { backgroundColor: theme.primary }]}
                onPress={handleSubmit}
                disabled={submitting}
              >
                {submitting ? (
                  <ActivityIndicator color="#FFFFFF" size="small" />
                ) : (
                  <Text style={styles.submitBtnText}>{t.submitRequest}</Text>
                )}
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end'
  },
  container: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    borderWidth: 1,
    maxHeight: '85%'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  title: {
    fontSize: 17,
    fontWeight: '800'
  },
  studentSub: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  closeBtn: {
    padding: 6
  },
  closeText: {
    fontSize: 18,
    fontWeight: '800'
  },
  divider: {
    height: 1,
    marginVertical: 14
  },
  formScroll: {
    marginBottom: 10
  },
  disclaimerBox: {
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    marginBottom: 14
  },
  disclaimerText: {
    fontSize: 11,
    fontWeight: '600',
    lineHeight: 16
  },
  dateRow: {
    flexDirection: 'row',
    marginBottom: 12
  },
  inputGroup: {
    marginBottom: 14
  },
  label: {
    fontSize: 12,
    fontWeight: '700',
    marginBottom: 6
  },
  input: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13
  },
  textArea: {
    height: 80,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingTop: 10,
    fontSize: 13,
    textAlignVertical: 'top'
  },
  btnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    marginTop: 10,
    marginBottom: 20
  },
  cancelBtn: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700'
  }
});

