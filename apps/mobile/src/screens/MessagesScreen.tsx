import React, { useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Alert
} from 'react-native';
import { ThemeColors } from '../lib/theme';
import { useI18n } from '../lib/i18n';
import { AnnouncementItem, LanguageCode } from '../types';

interface MessagesScreenProps {
  theme: ThemeColors;
  language: LanguageCode;
}

const SAMPLE_CIRCULARS: AnnouncementItem[] = [
  {
    id: 'ann-1',
    title: 'Pre-Board Examination Schedule Released (Grade 10 & 12)',
    summary: 'CBSE mandatory pre-board assessment schedule for December 2026.',
    body: 'Dear Parents, Please note that the first round of CBSE Pre-Board examinations will commence from December 1st, 2026. The detailed timetable and subject seating plan are attached. Minimum 75% attendance is mandatory for hall ticket eligibility.',
    category: 'EXAM',
    author: "Principal's Office",
    date: '12 Nov 2026',
    is_pinned: true,
    attachment_name: 'PreBoard_Datesheet_2026.pdf',
    attachment_size: '240 KB'
  },
  {
    id: 'ann-2',
    title: 'Winter Uniform & School Timings Circular',
    summary: 'Mandatory winter uniform compliance starting Monday, November 17.',
    body: 'In accordance with seasonal weather changes, all students must report in complete winter uniform starting Monday. Morning gate entry grace cutoff remains strictly 08:45 AM.',
    category: 'CIRCULAR',
    author: 'Dean of Student Welfare',
    date: '10 Nov 2026',
    is_pinned: true,
    attachment_name: 'Winter_Uniform_Guidelines.pdf',
    attachment_size: '180 KB'
  },
  {
    id: 'ann-3',
    title: 'Parent-Teacher Meeting (PTM) – Term 1 Performance Review',
    summary: 'Schedule and slot booking for Grade 9 & 10 parent interaction.',
    body: 'The Term 1 Parent-Teacher Meeting is scheduled for Saturday, November 22nd. Parents can meet the class teacher and review attendance and biometric logs.',
    category: 'PTM',
    author: 'Grade 10 Coordinator',
    date: '08 Nov 2026',
    is_pinned: false,
    attachment_name: 'PTM_Slot_Schedule.pdf',
    attachment_size: '120 KB'
  },
  {
    id: 'ann-4',
    title: 'Guru Nanak Jayanti – Official Institutional Holiday',
    summary: 'School will remain closed on Friday, November 15, 2026.',
    body: 'This is to inform all parents that Delhi Public School, R.K. Puram will observe an institutional holiday on Friday on the auspicious occasion of Guru Nanak Jayanti.',
    category: 'HOLIDAY',
    author: 'Administrative Director',
    date: '05 Nov 2026',
    is_pinned: false
  }
];

export const MessagesScreen: React.FC<MessagesScreenProps> = ({ theme, language }) => {
  const t = useI18n(language);
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'CIRCULAR' | 'EXAM' | 'PTM' | 'HOLIDAY'>('ALL');

  const filtered = selectedCategory === 'ALL'
    ? SAMPLE_CIRCULARS
    : SAMPLE_CIRCULARS.filter((c) => c.category === selectedCategory);

  const getCategoryColor = (cat: string) => {
    switch (cat) {
      case 'EXAM':
        return { bg: theme.lateBg, text: theme.lateText, border: theme.late };
      case 'CIRCULAR':
        return { bg: theme.primaryLight, text: theme.primary, border: theme.primary };
      case 'PTM':
        return { bg: theme.presentBg, text: theme.presentText, border: theme.present };
      case 'HOLIDAY':
        return { bg: theme.leaveBg, text: theme.leaveText, border: theme.leave };
      default:
        return { bg: theme.primaryLight, text: theme.primary, border: theme.primary };
    }
  };

  return (
    <ScrollView
      style={[styles.container, { backgroundColor: theme.background }]}
      contentContainerStyle={styles.contentContainer}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: theme.textPrimary }]}>{t.circulars}</Text>
        <Text style={[styles.subtitle, { color: theme.textSecondary }]}>
          Verified updates from Delhi Public School, R.K. Puram
        </Text>
      </View>

      {/* Category Pills */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
        {(['ALL', 'CIRCULAR', 'EXAM', 'PTM', 'HOLIDAY'] as const).map((cat) => {
          const isSelected = selectedCategory === cat;
          return (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryPill,
                {
                  backgroundColor: isSelected ? theme.primary : theme.card,
                  borderColor: isSelected ? theme.primary : theme.border
                }
              ]}
              onPress={() => setSelectedCategory(cat)}
            >
              <Text
                style={[
                  styles.categoryText,
                  { color: isSelected ? '#FFFFFF' : theme.textSecondary }
                ]}
              >
                {cat === 'ALL' ? t.allCirculars : cat}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Announcements List */}
      <View style={styles.cardList}>
        {filtered.map((item) => {
          const catColor = getCategoryColor(item.category);
          return (
            <View
              key={item.id}
              style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}
            >
              <View style={styles.cardTopRow}>
                <View style={[styles.catBadge, { backgroundColor: catColor.bg, borderColor: catColor.border }]}>
                  <Text style={[styles.catText, { color: catColor.text }]}>{item.category}</Text>
                </View>

                <View style={styles.dateMeta}>
                  {item.is_pinned && <Text style={styles.pinIcon}>📌 </Text>}
                  <Text style={[styles.dateText, { color: theme.textMuted }]}>{item.date}</Text>
                </View>
              </View>

              <Text style={[styles.cardTitle, { color: theme.textPrimary }]}>{item.title}</Text>
              <Text style={[styles.cardSummary, { color: theme.textSecondary }]}>{item.summary}</Text>
              <Text style={[styles.cardBody, { color: theme.textPrimary }]}>{item.body}</Text>

              <View style={[styles.divider, { backgroundColor: theme.border }]} />

              <View style={styles.cardFooter}>
                <Text style={[styles.authorText, { color: theme.textMuted }]}>Issued by: {item.author}</Text>

                {item.attachment_name && (
                  <TouchableOpacity
                    style={[styles.downloadBtn, { backgroundColor: theme.primaryLight, borderColor: theme.border }]}
                    onPress={() =>
                      Alert.alert(
                        'Attached Circular',
                        `Opening document: ${item.attachment_name} (${item.attachment_size})`
                      )
                    }
                  >
                    <Text style={[styles.downloadText, { color: theme.primary }]}>📎 {item.attachment_name}</Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}
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
  header: {
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
  categoryScroll: {
    flexDirection: 'row',
    marginBottom: 16
  },
  categoryPill: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 12,
    borderWidth: 1,
    marginRight: 8
  },
  categoryText: {
    fontSize: 11,
    fontWeight: '700'
  },
  cardList: {
    gap: 12
  },
  card: {
    borderRadius: 16,
    padding: 16,
    borderWidth: 1
  },
  cardTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  catBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1
  },
  catText: {
    fontSize: 10,
    fontWeight: '800'
  },
  dateMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  pinIcon: {
    fontSize: 11
  },
  dateText: {
    fontSize: 11
  },
  cardTitle: {
    fontSize: 15,
    fontWeight: '800',
    lineHeight: 20
  },
  cardSummary: {
    fontSize: 12,
    fontWeight: '600',
    marginTop: 4
  },
  cardBody: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8
  },
  divider: {
    height: 1,
    marginVertical: 12
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 8
  },
  authorText: {
    fontSize: 11,
    fontStyle: 'italic'
  },
  downloadBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1
  },
  downloadText: {
    fontSize: 11,
    fontWeight: '700'
  }
});

