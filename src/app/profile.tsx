import { Card, ScreenContainer } from '@/components/screen-container';

export default function ProfileScreen() {
  return (
    <ScreenContainer title="Profile" subtitle="Account details and user info go here.">
      <Card title="User">
        Show the signed-in user's name, avatar, and profile fields on this screen.
      </Card>
      <Card title="Activity">Recent activity or stats can live here.</Card>
    </ScreenContainer>
  );
}
