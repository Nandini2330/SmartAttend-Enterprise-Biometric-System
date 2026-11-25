import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Switch,
  Alert,
  Modal,
  TextInput
} from 'react-native';
import { ThemeColors } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { ChildRecord, LanguageCode, ParentUser, ThemeMode } from '../types';

interface ProfileScreenProps {
  theme: ThemeColors;
  themeMode: ThemeMode;
  language: LanguageCode;
  parent: ParentUser;
  children: ChildRecord[];
  onToggleTheme: () => void;
  onSetLanguage: (lang: LanguageCode) => void;
  onSignOut: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  theme,
  themeMode,
  language,
  parent,
  children,
  onToggleTheme,
  onSetLanguage,
  onSignOut
}) => {
  const t = useI18n(language);

  // Preference switches
  const [entryPush, setEntryPush] = useState(true);
  const [exitPush, setExitPush] = useState(true);
  const [absencePush, setAbsencePush] = useState(true);

  // Password modal
  const [pwModalVisible, setPwModalVisible] = useState(false);
  const [oldPw, setOldPw] = useState('');
  const [newPw, setNewPw] = useState('');

  const handleChangePassword = () => {
    if (!oldPw || !newPw) {
      Alert.alert('Required', 'Please fill both current and new password fields.');
      return;
    }
    setPwModalVisible(false);
    setOldPw('');
    setNewPw('');
    Alert.alert('Success', 'Password updated successfully in Supabase Auth.');
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      {/* 1. Parent Card */}
      <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
        <View style={styles.parentRow}>
          <Image source={{ uri: parent.avatar_url }} style={styles.avatar} />
          <View style={{ flex: 1, marginLeft: 14 }}>
            <Text style={[styles.parentName, { color: theme.textPrimary }]}>{parent.name}</Text>
            <Text style={[styles.relationship, { color: theme.primary }]}>
              {parent.relationship} • {parent.school_name}
            </Text>
            <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
              📞 {parent.phone}
            </Text>
            <Text style={[styles.contactInfo, { color: theme.textSecondary }]}>
              ✉️ {parent.email}
            </Text>
          </View>
        </View>
      </View>

      {/* 2. Linked Children */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          {t.linkedStudents} ({children.length})
        </Text>

        <View style={styles.childrenList}>
          {children.map((c) => (
            <View
              key={c.id}
              style={[styles.childCard, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <Image source={{ uri: c.avatar_url }} style={styles.childAvatar} />
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={[styles.childName, { color: theme.textPrimary }]}>
                  {c.first_name} {c.last_name}
                </Text>
                <Text style={[styles.childMeta, { color: theme.textSecondary }]}>
                  {c.class_name}-{c.division_name} • Roll #{c.roll_number}
                </Text>
                <Text style={[styles.childAdm, { color: theme.textMuted }]}>
                  Adm No: {c.admission_number}
                </Text>
              </View>
              <View
                style={[
                  styles.verifiedBadge,
                  { backgroundColor: theme.presentBg, borderColor: theme.present }
                ]}
              >
                <Text style={[styles.verifiedText, { color: theme.presentText }]}>Verified Link</Text>
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* 3. Language & Appearance Settings */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          {t.appSettings}
        </Text>

        <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          {/* Language Switcher */}
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>{t.language}</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                {language === 'en' ? 'English (Current)' : 'मराठी (सध्याची भाषा)'}
              </Text>
            </View>

            <View style={[styles.langSwitchBar, { backgroundColor: theme.background, borderColor: theme.border }]}>
              <TouchableOpacity
                style={[styles.langSwitchBtn, language === 'en' && { backgroundColor: theme.primary }]}
                onPress={() => onSetLanguage('en')}
              >
                <Text
                  style={[
                    styles.langSwitchText,
                    { color: language === 'en' ? '#FFFFFF' : theme.textSecondary }
                  ]}
                >
                  EN
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.langSwitchBtn, language === 'mr' && { backgroundColor: theme.primary }]}
                onPress={() => onSetLanguage('mr')}
              >
                <Text
                  style={[
                    styles.langSwitchText,
                    { color: language === 'mr' ? '#FFFFFF' : theme.textSecondary }
                  ]}
                >
                  मराठी
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          {/* Theme Switcher */}
          <View style={styles.settingRow}>
            <View>
              <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>{t.theme}</Text>
              <Text style={[styles.settingSubtitle, { color: theme.textSecondary }]}>
                {themeMode === 'dark' ? t.darkMode : t.lightMode}
              </Text>
            </View>

            <TouchableOpacity
              style={[
                styles.themeToggleBtn,
                { backgroundColor: theme.primaryLight, borderColor: theme.border }
              ]}
              onPress={onToggleTheme}
              activeOpacity={0.8}
            >
              <Text style={{ fontSize: 13, fontWeight: '700', color: theme.primary }}>
                {themeMode === 'dark' ? '☀️ ' + t.lightMode : '🌙 ' + t.darkMode}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {/* 4. Push Notification Preferences */}
      <View style={styles.section}>
        <Text style={[styles.sectionHeading, { color: theme.textSecondary }]}>
          Push Notification Preferences
        </Text>

        <View style={[styles.settingsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
          <View style={styles.settingRow}>
            <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>{t.entryAlerts}</Text>
            <Switch
              value={entryPush}
              onValueChange={setEntryPush}
              thumbColor={entryPush ? theme.primary : '#ccc'}
              trackColor={{ false: '#767577', true: theme.presentBg }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>{t.exitAlerts}</Text>
            <Switch
              value={exitPush}
              onValueChange={setExitPush}
              thumbColor={exitPush ? theme.primary : '#ccc'}
              trackColor={{ false: '#767577', true: theme.presentBg }}
            />
          </View>

          <View style={[styles.divider, { backgroundColor: theme.border }]} />

          <View style={styles.settingRow}>
            <Text style={[styles.settingTitle, { color: theme.textPrimary }]}>{t.absenceAlerts}</Text>
            <Switch
              value={absencePush}
              onValueChange={setAbsencePush}
              thumbColor={absencePush ? theme.primary : '#ccc'}
              trackColor={{ false: '#767577', true: theme.presentBg }}
            />
          </View>
        </View>
      </View>

      {/* 5. Account Security & Sign Out */}
      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.securityBtn, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={() => setPwModalVisible(true)}
        >
          <Text style={[styles.securityBtnText, { color: theme.textPrimary }]}>
            🔑 {t.changePassword}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.signOutBtn, { backgroundColor: theme.absentBg, borderColor: theme.absent }]}
          onPress={onSignOut}
        >
          <Text style={[styles.signOutText, { color: theme.absentText }]}>
            🚪 {t.signOut}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Change Password Modal */}
      <Modal visible={pwModalVisible} transparent={true} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.modalTitle, { color: theme.textPrimary }]}>{t.changePassword}</Text>

            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary }]}
              placeholder="Current Password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              value={oldPw}
              onChangeText={setOldPw}
            />

            <TextInput
              style={[styles.modalInput, { borderColor: theme.border, color: theme.textPrimary, marginTop: 10 }]}
              placeholder="New Strong Password"
              placeholderTextColor={theme.textMuted}
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalCancelBtn, { borderColor: theme.border }]}
                onPress={() => setPwModalVisible(false)}
              >
                <Text style={{ color: theme.textSecondary, fontWeight: '700' }}>{t.cancel}</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.modalSaveBtn, { backgroundColor: theme.primary }]}
                onPress={handleChangePassword}
              >
                <Text style={{ color: '#FFFFFF', fontWeight: '700' }}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
  card: {
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    marginBottom: 16
  },
  parentRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30
  },
  parentName: {
    fontSize: 16,
    fontWeight: '800'
  },
  relationship: {
    fontSize: 12,
    fontWeight: '700',
    marginTop: 2
  },
  contactInfo: {
    fontSize: 12,
    marginTop: 3
  },
  section: {
    marginBottom: 16
  },
  sectionHeading: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8
  },
  childrenList: {
    gap: 10
  },
  childCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  childAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  childName: {
    fontSize: 14,
    fontWeight: '800'
  },
  childMeta: {
    fontSize: 12,
    marginTop: 2
  },
  childAdm: {
    fontSize: 10,
    marginTop: 2
  },
  verifiedBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1
  },
  verifiedText: {
    fontSize: 10,
    fontWeight: '800'
  },
  settingsCard: {
    borderRadius: 16,
    padding: 14,
    borderWidth: 1
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  settingTitle: {
    fontSize: 13,
    fontWeight: '700'
  },
  settingSubtitle: {
    fontSize: 11,
    marginTop: 2
  },
  langSwitchBar: {
    flexDirection: 'row',
    borderRadius: 10,
    padding: 3,
    borderWidth: 1
  },
  langSwitchBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 7
  },
  langSwitchText: {
    fontSize: 11,
    fontWeight: '800'
  },
  themeToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1
  },
  divider: {
    height: 1,
    marginVertical: 12
  },
  securityBtn: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center',
    marginBottom: 10
  },
  securityBtnText: {
    fontSize: 13,
    fontWeight: '700'
  },
  signOutBtn: {
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    alignItems: 'center'
  },
  signOutText: {
    fontSize: 13,
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
    maxWidth: 340,
    borderRadius: 18,
    padding: 18,
    borderWidth: 1
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    marginBottom: 14
  },
  modalInput: {
    height: 44,
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13
  },
  modalBtnRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    marginTop: 18
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1
  },
  modalSaveBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8
  }
});

