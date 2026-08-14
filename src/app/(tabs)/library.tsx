import { useRouter } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Btn } from '@/components/ui';
import { Palette } from '@/constants/tokens';

export default function LibraryScreen() {
  const router = useRouter();

  return (
    <View style={styles.container}>
      <Btn label="Open My Thoughts" onPress={() => router.push('/library-flow' as never)} />
      <Btn label="Open My Goals" onPress={() => router.push('/goals-flow' as never)} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Palette.bg,
    justifyContent: 'center',
    gap: 12,
    padding: 20,
  },
});
