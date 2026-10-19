import { View } from 'react-native';
import { Circle, Ellipse, Line, Path, Polygon, Rect, Svg } from 'react-native-svg';

import { AVATAR_BG } from '@/data/community-content';

/**
 * Anonymizing "monster" avatars — one hand-drawn doodle per id, so community
 * posts and board notes show a consistent, friendly identity without photos
 * or initials. Colors are fixed per variant (not theme tokens) so every
 * user's monster reads the same regardless of app theme.
 */
export function MonsterAvatar({ id, size = 28 }: { id: number; size?: number }) {
  const index = ((id % 8) + 8) % 8;
  const bg = AVATAR_BG[index];
  const Face = FACE_COMPONENTS[index];

  return (
    <View
      style={{
        width: size,
        height: size,
        borderRadius: size / 2,
        backgroundColor: bg,
        overflow: 'hidden',
        alignItems: 'center',
        justifyContent: 'center',
      }}>
      <Svg viewBox="0 0 36 36" width={size} height={size}>
        <Face />
      </Svg>
    </View>
  );
}

function Face0() {
  return (
    <>
      <Polygon points="11,13 9,4 16,12" fill="#C4668A" stroke="#9A4A6A" strokeWidth={1.2} strokeLinejoin="round" />
      <Polygon points="25,13 27,4 20,12" fill="#C4668A" stroke="#9A4A6A" strokeWidth={1.2} strokeLinejoin="round" />
      <Ellipse cx={18} cy={22} rx={13.5} ry={12.5} fill="#C4668A" stroke="#9A4A6A" strokeWidth={1.5} />
      <Ellipse cx={12.5} cy={19.5} rx={3.5} ry={4} fill="white" stroke="#9A4A6A" strokeWidth={0.9} />
      <Circle cx={12} cy={20} r={1.9} fill="#6B3355" />
      <Circle cx={11.3} cy={19.2} r={0.8} fill="white" />
      <Ellipse cx={23.5} cy={19.5} rx={3.5} ry={4} fill="white" stroke="#9A4A6A" strokeWidth={0.9} />
      <Circle cx={24} cy={20} r={1.9} fill="#6B3355" />
      <Circle cx={23.3} cy={19.2} r={0.8} fill="white" />
      <Path d="M10.5 25 Q18 33 25.5 25" fill="#7A3555" stroke="#9A4A6A" strokeWidth={1} />
      <Rect x={13.5} y={25} width={4} height={2.8} rx={0.7} fill="white" />
      <Rect x={18.5} y={25} width={4} height={2.8} rx={0.7} fill="white" />
    </>
  );
}

function Face1() {
  return (
    <>
      <Line x1={18} y1={9} x2={18} y2={15} stroke="#2A8A8A" strokeWidth={1.6} strokeLinecap="round" />
      <Circle cx={18} cy={7.5} r={3} fill="#2A8A8A" stroke="#1A6A6A" strokeWidth={1} />
      <Circle cx={18} cy={23} r={13} fill="#5BB8B8" stroke="#2A8A8A" strokeWidth={1.5} />
      <Circle cx={13.5} cy={21} r={3} fill="white" stroke="#2A8A8A" strokeWidth={0.8} />
      <Circle cx={13} cy={21.5} r={1.6} fill="#1A6060" />
      <Circle cx={12.3} cy={20.7} r={0.65} fill="white" />
      <Circle cx={22.5} cy={21} r={3} fill="white" stroke="#2A8A8A" strokeWidth={0.8} />
      <Circle cx={23} cy={21.5} r={1.6} fill="#1A6060" />
      <Circle cx={22.3} cy={20.7} r={0.65} fill="white" />
      <Path d="M13 26.5 Q18 30.5 23 26.5" stroke="#2A8A8A" strokeWidth={1.6} fill="none" strokeLinecap="round" />
    </>
  );
}

function Face2() {
  return (
    <>
      <Polygon points="7,18 3,7 14,16" fill="#E8813A" stroke="#C4612A" strokeWidth={1.2} strokeLinejoin="round" />
      <Polygon points="29,18 33,7 22,16" fill="#E8813A" stroke="#C4612A" strokeWidth={1.2} strokeLinejoin="round" />
      <Circle cx={18} cy={22} r={13} fill="#E8813A" stroke="#C4612A" strokeWidth={1.5} />
      <Circle cx={13} cy={20} r={3.8} fill="white" stroke="#C4612A" strokeWidth={0.8} />
      <Circle cx={13} cy={20.5} r={2} fill="#8B3A10" />
      <Circle cx={12.2} cy={19.6} r={0.8} fill="white" />
      <Circle cx={23} cy={20} r={3.8} fill="white" stroke="#C4612A" strokeWidth={0.8} />
      <Circle cx={23} cy={20.5} r={2} fill="#8B3A10" />
      <Circle cx={22.2} cy={19.6} r={0.8} fill="white" />
      <Ellipse cx={18} cy={27} rx={3.5} ry={3.2} fill="#8B3A10" stroke="#C4612A" strokeWidth={0.8} />
    </>
  );
}

function Face3() {
  return (
    <>
      <Polygon points="11,14 9,5 15,13" fill="#7BAE8A" stroke="#4A8A58" strokeWidth={1.2} strokeLinejoin="round" />
      <Polygon points="18,12 17,3 22,11" fill="#7BAE8A" stroke="#4A8A58" strokeWidth={1.2} strokeLinejoin="round" />
      <Polygon points="25,14 27,5 21,13" fill="#7BAE8A" stroke="#4A8A58" strokeWidth={1.2} strokeLinejoin="round" />
      <Ellipse cx={18} cy={23} rx={13} ry={12} fill="#7BAE8A" stroke="#4A8A58" strokeWidth={1.5} />
      <Path d="M10.5 20 Q13.5 17 16.5 20" stroke="#4A8A58" strokeWidth={1.9} fill="none" strokeLinecap="round" />
      <Path d="M19.5 20 Q22.5 17 25.5 20" stroke="#4A8A58" strokeWidth={1.9} fill="none" strokeLinecap="round" />
      <Path d="M12 25 Q18 30.5 24 25" fill="#3A6A48" stroke="#4A8A58" strokeWidth={0.8} />
      <Rect x={15.5} y={25} width={5} height={3.5} rx={1} fill="white" stroke="#4A8A58" strokeWidth={0.5} />
    </>
  );
}

function Face4() {
  return (
    <>
      <Circle cx={7.5} cy={14} r={5.5} fill="#6AABCD" stroke="#3A7EA0" strokeWidth={1.2} />
      <Circle cx={7.5} cy={14} r={2.8} fill="#4A8AAD" />
      <Circle cx={28.5} cy={14} r={5.5} fill="#6AABCD" stroke="#3A7EA0" strokeWidth={1.2} />
      <Circle cx={28.5} cy={14} r={2.8} fill="#4A8AAD" />
      <Circle cx={18} cy={23} r={13} fill="#6AABCD" stroke="#3A7EA0" strokeWidth={1.5} />
      <Circle cx={13.5} cy={21} r={2.8} fill="white" stroke="#3A7EA0" strokeWidth={0.8} />
      <Circle cx={13.5} cy={21.5} r={1.4} fill="#2A5A7A" />
      <Circle cx={12.9} cy={20.8} r={0.6} fill="white" />
      <Circle cx={22.5} cy={21} r={2.8} fill="white" stroke="#3A7EA0" strokeWidth={0.8} />
      <Circle cx={22.5} cy={21.5} r={1.4} fill="#2A5A7A" />
      <Circle cx={21.9} cy={20.8} r={0.6} fill="white" />
      <Ellipse cx={11} cy={25} rx={3} ry={2} fill="#FF9AAA" opacity={0.45} />
      <Ellipse cx={25} cy={25} rx={3} ry={2} fill="#FF9AAA" opacity={0.45} />
      <Path d="M13 27 Q18 31 23 27" stroke="#3A7EA0" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </>
  );
}

function Face5() {
  return (
    <>
      <Circle cx={12} cy={14} r={5} fill="#D4A030" stroke="#A07820" strokeWidth={1.2} />
      <Circle cx={18} cy={11.5} r={5.5} fill="#D4A030" stroke="#A07820" strokeWidth={1.2} />
      <Circle cx={24} cy={14} r={5} fill="#D4A030" stroke="#A07820" strokeWidth={1.2} />
      <Ellipse cx={18} cy={24} rx={13} ry={11.5} fill="#D4A030" stroke="#A07820" strokeWidth={1.5} />
      <Ellipse cx={13.5} cy={22} rx={3.2} ry={2.3} fill="white" stroke="#A07820" strokeWidth={0.8} />
      <Ellipse cx={13.5} cy={23.1} rx={3.2} ry={1.4} fill="#7A5010" />
      <Ellipse cx={22.5} cy={22} rx={3.2} ry={2.3} fill="white" stroke="#A07820" strokeWidth={0.8} />
      <Ellipse cx={22.5} cy={23.1} rx={3.2} ry={1.4} fill="#7A5010" />
      <Path d="M14 27.5 Q18 31 22 27.5" stroke="#A07820" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </>
  );
}

function Face6() {
  return (
    <>
      <Polygon points="18,7 14,16 22,16" fill="#9B7FBF" stroke="#7A5AAA" strokeWidth={1.2} strokeLinejoin="round" />
      <Circle cx={18} cy={23} r={13} fill="#9B7FBF" stroke="#7A5AAA" strokeWidth={1.5} />
      <Ellipse cx={13.5} cy={21} rx={4.8} ry={5.5} fill="white" stroke="#7A5AAA" strokeWidth={1} />
      <Circle cx={13.5} cy={21.5} r={3} fill="#4A2A7A" />
      <Circle cx={12.2} cy={20.2} r={1.1} fill="white" />
      <Circle cx={23.5} cy={21} r={2.2} fill="white" stroke="#7A5AAA" strokeWidth={0.8} />
      <Circle cx={23.5} cy={21.5} r={1.2} fill="#4A2A7A" />
      <Path d="M13 27.5 Q19 31 24.5 27" stroke="#7A5AAA" strokeWidth={1.5} fill="none" strokeLinecap="round" />
    </>
  );
}

function Face7() {
  return (
    <>
      <Ellipse cx={6} cy={24} rx={4.5} ry={6.5} fill="#E87070" stroke="#C04040" strokeWidth={1.2} transform="rotate(-12 6 24)" />
      <Ellipse cx={30} cy={24} rx={4.5} ry={6.5} fill="#E87070" stroke="#C04040" strokeWidth={1.2} transform="rotate(12 30 24)" />
      <Circle cx={18} cy={21} r={13} fill="#E87070" stroke="#C04040" strokeWidth={1.5} />
      <Circle cx={13} cy={18.5} r={3.5} fill="white" stroke="#C04040" strokeWidth={0.8} />
      <Circle cx={13.5} cy={19} r={1.8} fill="#8B1A1A" />
      <Circle cx={12.7} cy={18.2} r={0.75} fill="white" />
      <Circle cx={23} cy={18.5} r={3.5} fill="white" stroke="#C04040" strokeWidth={0.8} />
      <Circle cx={23.5} cy={19} r={1.8} fill="#8B1A1A" />
      <Circle cx={22.7} cy={18.2} r={0.75} fill="white" />
      <Path d="M11 24.5 Q18 32 25 24.5" fill="#8B1A1A" stroke="#C04040" strokeWidth={1} />
      <Rect x={13.5} y={24.5} width={3.5} height={2.5} rx={0.5} fill="white" />
      <Rect x={18} y={24.5} width={3.5} height={2.5} rx={0.5} fill="white" />
    </>
  );
}

const FACE_COMPONENTS = [Face0, Face1, Face2, Face3, Face4, Face5, Face6, Face7];
