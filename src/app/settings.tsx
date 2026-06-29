import { Card, ScreenContainer } from '@/components/screen-container';

export default function SettingsScreen() {
  return (
    <ScreenContainer title="Settings" subtitle="App preferences and configuration.">
      <Card title="Appearance">
        The app already follows the system light/dark theme. Add toggles or options here.
      </Card>
      <Card title="About">YAB · version 1.0.0</Card>
    </ScreenContainer>
  );
}
