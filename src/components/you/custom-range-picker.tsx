import { DateTimePicker } from '@expo/ui/community/datetime-picker';
import { useState } from 'react';
import { Platform, Pressable, Text, TextInput, View } from 'react-native';

import { Btn } from '@/components/ui';
import { Palette, Radius, themedStyleSheet } from '@/constants/tokens';
import { endOfDay, localDateKey, startOfDay, type DateRange } from '@/data/you-patterns';

export function CustomRangePicker({ value, onChange }: { value: DateRange | null; onChange: (range: DateRange) => void }) {
  const today = startOfDay(new Date());
  const [startDate, setStartDate] = useState(value ? startOfDay(value.start) : today);
  const [endDate, setEndDate] = useState(value ? startOfDay(value.end) : today);
  const [activePicker, setActivePicker] = useState<'start' | 'end' | null>(null);
  const [startText, setStartText] = useState(value ? formatDateInput(value.start) : formatDateInput(today));
  const [endText, setEndText] = useState(value ? formatDateInput(value.end) : formatDateInput(today));
  const [error, setError] = useState('');
  const nativePicker = Platform.OS !== 'web';

  const apply = () => {
    const start = nativePicker ? startDate : parseDateInput(startText);
    const end = nativePicker ? endDate : parseDateInput(endText);
    if (!start || !end) return setError('Use YYYY-MM-DD for both dates.');
    if (start > end) return setError('The start date must come before the end date.');
    setError('');
    onChange({ start: startOfDay(start), end: endOfDay(end) });
  };

  const updateDate = (date: Date) => {
    const next = startOfDay(date);
    if (activePicker === 'start') {
      setStartDate(next);
      setStartText(formatDateInput(next));
    } else if (activePicker === 'end') {
      setEndDate(next);
      setEndText(formatDateInput(next));
    }
    setError('');
    if (Platform.OS === 'android') setActivePicker(null);
  };

  return (
    <View style={styles.customPicker}>
      <Text style={styles.customHint}>{nativePicker ? 'Choose a start and end date.' : 'Choose dates (YYYY-MM-DD)'}</Text>
      <View style={styles.dateInputs}>
        {nativePicker ? (
          <>
            <Pressable accessibilityRole="button" onPress={() => setActivePicker('start')} style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>Start</Text>
              <Text style={styles.dateFieldValue}>{formatDateDisplay(startDate)}</Text>
            </Pressable>
            <Pressable accessibilityRole="button" onPress={() => setActivePicker('end')} style={styles.dateField}>
              <Text style={styles.dateFieldLabel}>End</Text>
              <Text style={styles.dateFieldValue}>{formatDateDisplay(endDate)}</Text>
            </Pressable>
          </>
        ) : (
          <>
            <TextInput value={startText} onChangeText={setStartText} placeholder="Start date" placeholderTextColor={Palette.neutral600} style={styles.dateInput} />
            <TextInput value={endText} onChangeText={setEndText} placeholder="End date" placeholderTextColor={Palette.neutral600} style={styles.dateInput} />
          </>
        )}
      </View>
      {nativePicker && activePicker ? (
        <View style={styles.nativePicker}>
          <DateTimePicker
            value={activePicker === 'start' ? startDate : endDate}
            mode="date"
            display="inline"
            presentation="dialog"
            minimumDate={activePicker === 'end' ? startDate : undefined}
            maximumDate={activePicker === 'start' ? endDate : today}
            accentColor={Palette.accent2_700}
            onValueChange={(_, date) => { if (date) updateDate(date); }}
            onDismiss={() => setActivePicker(null)}
          />
          {Platform.OS === 'ios' ? <Btn label="Done" variant="ghost" onPress={() => setActivePicker(null)} /> : null}
        </View>
      ) : null}
      {error ? <Text style={styles.customError}>{error}</Text> : null}
      <Btn label="Apply dates" variant="ghost" onPress={apply} />
    </View>
  );
}

function parseDateInput(value: string) {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value.trim());
  if (!match) return null;
  const date = new Date(Number(match[1]), Number(match[2]) - 1, Number(match[3]));
  return date.getFullYear() === Number(match[1]) && date.getMonth() === Number(match[2]) - 1 && date.getDate() === Number(match[3]) ? date : null;
}

function formatDateInput(date: Date) {
  return localDateKey(date);
}

function formatDateDisplay(date: Date) {
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
}

const styles = themedStyleSheet(() => ({
  customPicker: { gap: 8, padding: 12, backgroundColor: Palette.neutral100, borderRadius: Radius.lg, borderWidth: 1, borderColor: Palette.neutral300 },
  customHint: { color: Palette.neutral700, fontSize: 12 },
  customError: { color: Palette.accent700, fontSize: 12 },
  dateInputs: { flexDirection: 'row', gap: 8, width: '100%' },
  dateInput: { flex: 1, minWidth: 0, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.sm, padding: 10, color: Palette.text, backgroundColor: Palette.bg, fontSize: 12 },
  dateField: { flex: 1, minWidth: 0, gap: 4, borderWidth: 1, borderColor: Palette.neutral300, borderRadius: Radius.sm, padding: 10, backgroundColor: Palette.bg },
  dateFieldLabel: { color: Palette.neutral700, fontSize: 11, fontWeight: '700', textTransform: 'uppercase' },
  dateFieldValue: { color: Palette.text, fontSize: 13 },
  nativePicker: { alignItems: 'center', gap: 8 },
}));
