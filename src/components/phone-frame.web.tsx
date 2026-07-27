import { type ReactNode } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { Colors } from '@/constants/tokens';

/**
 * On web, render the app inside a centered phone "device" so it reads as a
 * mobile app in the browser. The app is rendered into `appArea`, which is the
 * positioned ancestor for the app's own (absolutely-positioned) tab bar, and
 * which starts *below* the status bar so nothing collides with the notch.
 */
// Real modern phone proportions: the iPhone 15/16 logical viewport is
// 393 x 852 points (~19.5:9), the current standard for flagship phones.
// Height drives the size and width is derived from the aspect ratio, so the
// shape holds at any window height.
const PHONE_HEIGHT = 852;
const PHONE_ASPECT = 393 / 852;
const STATUS_BAR_HEIGHT = 50;

export function PhoneFrame({ children }: { children: ReactNode }) {
  return (
    <View style={styles.backdrop}>
      <View style={styles.device}>
        {/* Side buttons */}
        <View style={[styles.btnLeft, styles.btnSilent]} />
        <View style={[styles.btnLeft, styles.btnVolumeUp]} />
        <View style={[styles.btnLeft, styles.btnVolumeDown]} />
        <View style={styles.btnPower} />

        <View style={[styles.screen, { backgroundColor: Colors.bg }]}>
          <StatusBar />
          <View style={styles.appArea}>{children}</View>
          {/* Dynamic Island sits over the status bar, clear of app content */}
          <View style={styles.dynamicIsland} />
          {/* Home indicator */}
          <View style={styles.homeIndicator} />
        </View>
      </View>
    </View>
  );
}

function StatusBar() {
  const tint = Colors.text;

  return (
    <View style={styles.statusBar}>
      <Text style={[styles.statusTime, { color: tint }]}>9:41</Text>
      <View style={styles.statusIcons}>
        <View style={styles.signal}>
          {[5, 8, 11, 14].map((h) => (
            <View key={h} style={{ width: 3, height: h, borderRadius: 1, backgroundColor: tint }} />
          ))}
        </View>
        <View style={[styles.batteryBody, { borderColor: tint }]}>
          <View style={[styles.batteryFill, { backgroundColor: tint }]} />
        </View>
        <View style={[styles.batteryCap, { backgroundColor: tint }]} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
    backgroundColor: '#15151a',
  },
  device: {
    position: 'relative',
    height: PHONE_HEIGHT,
    aspectRatio: PHONE_ASPECT,
    maxWidth: '100%',
    maxHeight: '100%',
    borderRadius: 56,
    borderColor: '#1c1c1f',
    borderWidth: 11,
    backgroundColor: '#1c1c1f',
    boxShadow: '0px 24px 70px rgba(0, 0, 0, 0.6), inset 0px 0px 2px rgba(255, 255, 255, 0.18)',
  },
  screen: {
    position: 'relative',
    flex: 1,
    borderRadius: 45,
    overflow: 'hidden',
  },
  appArea: {
    flex: 1,
    position: 'relative',
    // Leave room at the bottom so the tab bar clears the home indicator
    // (on a real device the safe-area inset handles this).
    paddingBottom: 20,
  },
  // Status bar
  statusBar: {
    height: STATUS_BAR_HEIGHT,
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 28,
    paddingBottom: 6,
    zIndex: 5,
    pointerEvents: 'none',
  },
  statusTime: {
    fontSize: 15,
    fontWeight: '600',
  },
  statusIcons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  signal: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 2,
  },
  batteryBody: {
    width: 22,
    height: 11,
    borderRadius: 3,
    borderWidth: 1,
    padding: 1.5,
    opacity: 0.9,
  },
  batteryFill: {
    flex: 1,
    borderRadius: 1,
  },
  batteryCap: {
    width: 1.5,
    height: 4,
    borderRadius: 1,
    marginLeft: -4,
    opacity: 0.9,
  },
  // Notch + home indicator
  dynamicIsland: {
    position: 'absolute',
    top: 11,
    left: '50%',
    marginLeft: -57,
    width: 114,
    height: 33,
    borderRadius: 19,
    backgroundColor: '#000',
    zIndex: 10,
    pointerEvents: 'none',
  },
  homeIndicator: {
    position: 'absolute',
    bottom: 8,
    left: '50%',
    marginLeft: -67,
    width: 134,
    height: 5,
    borderRadius: 3,
    backgroundColor: '#000',
    opacity: 0.28,
    zIndex: 10,
    pointerEvents: 'none',
  },
  // Hardware buttons
  btnLeft: {
    position: 'absolute',
    left: -17,
    width: 3,
    backgroundColor: '#101013',
    borderTopLeftRadius: 2,
    borderBottomLeftRadius: 2,
  },
  btnSilent: {
    top: 96,
    height: 28,
  },
  btnVolumeUp: {
    top: 150,
    height: 56,
  },
  btnVolumeDown: {
    top: 220,
    height: 56,
  },
  btnPower: {
    position: 'absolute',
    right: -17,
    top: 176,
    width: 3,
    height: 90,
    backgroundColor: '#101013',
    borderTopRightRadius: 2,
    borderBottomRightRadius: 2,
  },
});
