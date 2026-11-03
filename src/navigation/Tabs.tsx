import { BottomTabBar, BottomTabBarHeightCallbackContext, createBottomTabNavigator, type BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useContext } from 'react';
import { View } from 'react-native';
import { Icon } from '../components/Icon';
import { MiniPlayer } from '../components/MiniPlayer';
import { HomeScreen } from '../screens/HomeScreen';
import { LibraryScreen } from '../screens/LibraryScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { colors, fonts } from '../theme';

const Tab = createBottomTabNavigator();
const noop = () => {};

/**
 * Tab bar with the mini player stacked on top. The navigator measures this whole block (not just the
 * tabs) so screen content is never hidden behind the player.
 */
function TabBarWithPlayer(props: BottomTabBarProps) {
  const reportHeight = useContext(BottomTabBarHeightCallbackContext);
  return (
    <View
      style={{ backgroundColor: colors.surface }}
      onLayout={(e) => reportHeight?.(e.nativeEvent.layout.height)}
    >
      <View style={{ paddingTop: 6 }}>
        <MiniPlayer />
      </View>
      {/* The default bar also reports its own height; silence it so only the combined height counts. */}
      <BottomTabBarHeightCallbackContext.Provider value={noop}>
        <BottomTabBar {...props} />
      </BottomTabBarHeightCallbackContext.Provider>
    </View>
  );
}

const ICONS = {
  Home: ['home', 'home-outline'],
  Search: ['search', 'search-outline'],
  Library: ['library', 'library-outline'],
} as const;

export function Tabs() {
  return (
    <Tab.Navigator
      tabBar={(props) => <TabBarWithPlayer {...props} />}
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.muted,
        tabBarLabelStyle: { fontFamily: fonts.semi, fontSize: 12 },
        tabBarStyle: { backgroundColor: colors.surface, borderTopWidth: 0, elevation: 0 },
        sceneStyle: { backgroundColor: colors.bg },
        tabBarIcon: ({ focused, color }) => {
          const [on, off] = ICONS[route.name as keyof typeof ICONS];
          return <Icon name={focused ? on : off} size={24} color={color} />;
        },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Library" component={LibraryScreen} />
    </Tab.Navigator>
  );
}
