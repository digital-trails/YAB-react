import { Card, ScreenContainer } from '@/components/screen-container';

export default function HomeScreen() {
  return (
    <ScreenContainer title="Home" subtitle="Welcome to YAB. This is your starting point.">
      <Card title="Getting started">
        Edit src/app/index.tsx to change this screen. Screens live in src/app and become routes
        automatically
        1
      </Card>
      <Card title="Navigation">
        Use the tab bar to move between Home, Explore, Profile, and Settings.
      </Card>
    </ScreenContainer>
  );
}
