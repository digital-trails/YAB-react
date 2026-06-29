import { Card, ScreenContainer } from '@/components/screen-container';

export default function ExploreScreen() {
  return (
    <ScreenContainer title="Explore" subtitle="A placeholder screen for browsing or discovery.">
      <Card title="List content">
        Drop a FlatList or your feed component here. This screen scrolls, so it is a good fit for
        longer content.
      </Card>
      <Card title="Same code, three platforms">
        This screen renders on iOS, Android, and the web from a single component.
      </Card>
    </ScreenContainer>
  );
}
