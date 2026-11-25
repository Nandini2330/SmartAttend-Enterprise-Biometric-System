import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  Alert,
  ActivityIndicator
} from 'react-native';
import { ThemeColors } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { LanguageCode } from '../types';
import { VERIFIED_PARENTS } from '../lib/supabase';

interface LoginScreenProps {
  theme: ThemeColors;
  language: LanguageCode;
  onLoginSuccess: (parentEmail: string) => void;
  onToggleLanguage: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  theme,
  language,
  onLoginSuccess,
  onToggleLanguage
}) => {
  const t = useI18n(language);
  const [emailOrPhone, setEmailOrPhone] = useState('vikram.mehta@gmail.com');
  const [password, setPassword] = useState('Parent@2026!');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleLogin = () => {
    if (!emailOrPhone.trim()) {
      Alert.alert('Required', 'Please enter your registered email or phone number.');
      return;
    }
    if (!password.trim()) {
      Alert.alert('Required', 'Please enter your password.');
      return;
    }

    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      const cleanInput = emailOrPhone.trim().toLowerCase();
      const parent = VERIFIED_PARENTS.find(
        (p) => p.email.toLowerCase() === cleanInput || p.phone === cleanInput
      );

      if (parent) {
        onLoginSuccess(parent.email);
      } else {
        Alert.alert('Authentication Failed', t.invalidCredentials);
      }
    }, 600);
  };

  const handleQuickSelectParent = (p: typeof VERIFIED_PARENTS[0]) => {
    setEmailOrPhone(p.email);
    setPassword('Parent@2026!');
    onLoginSuccess(p.email);
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      keyboardShouldPersistTaps="handled"
    >
      {/* Top Language Toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.langBadge, { backgroundColor: theme.card, borderColor: theme.border }]}
          onPress={onToggleLanguage}
          activeOpacity={0.7}
        >
          <Text style={[styles.langText, { color: theme.primary }]}>
            {language === 'en' ? 'मराठी' : 'English'}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Brand & Logo Header */}
      <View style={styles.header}>
        <View style={[styles.logoBadge, { backgroundColor: theme.primary }]}>
          <Text style={styles.logoIcon}>🎓</Text>
        </View>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t.appName}</Text>
        <Text style={[styles.subTitle, { color: theme.primary }]}>{t.parentPortal}</Text>
        <Text style={[styles.description, { color: theme.textSecondary }]}>
          {t.loginSubtitle}
        </Text>
      </View>

      {/* Login Card */}
      <View
        style={[
          styles.card,
          { backgroundColor: theme.card, borderColor: theme.border }
        ]}
      >
        <Text style={[styles.inputLabel, { color: theme.textPrimary }]}>
          {t.emailOrPhone}
        </Text>
        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="e.g. vikram.mehta@gmail.com"
            placeholderTextColor={theme.textMuted}
            value={emailOrPhone}
            onChangeText={setEmailOrPhone}
            autoCapitalize="none"
            keyboardType="email-address"
          />
        </View>

        <Text style={[styles.inputLabel, { color: theme.textPrimary, marginTop: 16 }]}>
          {t.password}
        </Text>
        <View style={[styles.inputContainer, { borderColor: theme.border, backgroundColor: theme.background }]}>
          <TextInput
            style={[styles.input, { color: theme.textPrimary }]}
            placeholder="••••••••••••"
            placeholderTextColor={theme.textMuted}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity
            onPress={() => setShowPassword(!showPassword)}
            style={styles.eyeButton}
          >
            <Text style={{ color: theme.textSecondary, fontSize: 13, fontWeight: '600' }}>
              {showPassword ? 'Hide' : 'Show'}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={[styles.loginButton, { backgroundColor: theme.primary }]}
          onPress={handleLogin}
          disabled={loading}
          activeOpacity={0.8}
        >
          {loading ? (
            <ActivityIndicator color="#FFFFFF" size="small" />
          ) : (
            <Text style={styles.loginButtonText}>{t.loginButton}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.forgotBtn}
          onPress={() =>
            Alert.alert(
              t.forgotPassword,
              'To reset your password, contact Delhi Public School Administration at admin@dpsrkpuram.edu.in'
            )
          }
        >
          <Text style={[styles.forgotText, { color: theme.primary }]}>{t.forgotPassword}</Text>
        </TouchableOpacity>
      </View>

      {/* Testing Perspectives Section */}
      <View style={styles.demoSection}>
        <Text style={[styles.demoSectionTitle, { color: theme.textSecondary }]}>
          {t.quickDemoAccounts}
        </Text>
        <View style={styles.demoGrid}>
          {VERIFIED_PARENTS.map((p) => (
            <TouchableOpacity
              key={p.id}
              style={[
                styles.demoCard,
                { backgroundColor: theme.card, borderColor: theme.border }
              ]}
              onPress={() => handleQuickSelectParent(p)}
              activeOpacity={0.7}
            >
              <Image source={{ uri: p.avatar_url }} style={styles.demoAvatar} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={[styles.demoName, { color: theme.textPrimary }]}>{p.name}</Text>
                <Text style={[styles.demoPhone, { color: theme.textSecondary }]}>{p.phone}</Text>
                <Text style={[styles.demoChild, { color: theme.primary }]}>
                  {p.childrenIds.length > 1 ? `${p.childrenIds.length} Linked Children` : '1 Linked Child'}
                </Text>
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  contentContainer: {
    padding: 24,
    paddingTop: 48,
    paddingBottom: 40
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 16
  },
  langBadge: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1
  },
  langText: {
    fontSize: 12,
    fontWeight: '700'
  },
  header: {
    alignItems: 'center',
    marginBottom: 28
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6
  },
  logoIcon: {
    fontSize: 32
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    letterSpacing: -0.5
  },
  subTitle: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 2,
    textTransform: 'uppercase',
    letterSpacing: 1
  },
  description: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 8,
    maxWidth: 280,
    lineHeight: 18
  },
  card: {
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 10,
    elevation: 3
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 6
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 48
  },
  input: {
    flex: 1,
    fontSize: 14,
    height: 48
  },
  eyeButton: {
    padding: 6
  },
  loginButton: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 24,
    shadowColor: '#2563EB',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 4
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700'
  },
  forgotBtn: {
    alignSelf: 'center',
    marginTop: 16,
    padding: 6
  },
  forgotText: {
    fontSize: 13,
    fontWeight: '600'
  },
  demoSection: {
    marginTop: 32
  },
  demoSectionTitle: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 12
  },
  demoGrid: {
    gap: 10
  },
  demoCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1
  },
  demoAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22
  },
  demoName: {
    fontSize: 14,
    fontWeight: '700'
  },
  demoPhone: {
    fontSize: 12,
    marginTop: 2
  },
  demoChild: {
    fontSize: 11,
    fontWeight: '700',
    marginTop: 2
  }
});

