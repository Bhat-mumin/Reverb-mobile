import {
  BricolageGrotesque_400Regular,
  BricolageGrotesque_500Medium,
  BricolageGrotesque_600SemiBold,
  BricolageGrotesque_800ExtraBold,
  useFonts,
} from '@expo-google-fonts/bricolage-grotesque';
import { DarkTheme, NavigationContainer, type Theme } from '@react-navigation/native';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';
import { ActivityIndicator, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AddToPlaylistSheet } from './src/components/AddToPlaylistSheet';
import { Toast } from './src/components/Toast';
import { TrackActionsSheet } from './src/components/TrackActionsSheet';
import { useHydrated } from './src/hooks/useHydrated';
import { Tabs } from './src/navigation/Tabs';
import { NowPlayingModal } from './src/screens/NowPlayingModal';
import { QueueModal } from './src/screens/QueueModal';
import { initPlayback } from './src/store/player';
import { useUI } from './src/store/ui';
import { colors } from './src/theme';

const navTheme: Theme = {
  ...DarkTheme,
  colors: { ...DarkTheme.colors, background: colors.bg, card: colors.surface, text: colors.text, border: colors.border, primary: colors.accent },
};

export default function App() {
  const [fontsLoaded] = useFonts({
    BricolageGrotesque_400Regular,
    BricolageGrotesque_500Medium,
    BricolageGrotesque_600SemiBold,
    BricolageGrotesque_800ExtraBold,
  });
  const hydrated = useHydrated();

  useEffect(() => {
    initPlayback().catch(() => useUI.getState().showToast('Audio engine failed to start'));
  }, []);

  if (!fontsLoaded || !hydrated) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg, alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator color={colors.accent} />
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <StatusBar style="light" />
      <NavigationContainer theme={navTheme}>
        <Tabs />
      </NavigationContainer>
      <NowPlayingModal />
      <QueueModal />
      <TrackActionsSheet />
      <AddToPlaylistSheet />
      <Toast />
    </SafeAreaProvider>
  );
}
