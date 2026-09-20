import React from 'react';
import { Tabs, useRouter } from 'expo-router';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { House, Notebook, ChartLineUp, User, Plus } from 'phosphor-react-native';
import { colors, spacing, radii, typography } from '../../src/theme';

type BottomTabBarProps = Parameters<NonNullable<React.ComponentProps<typeof Tabs>['tabBar']>>[0];

function CenterButton() {
  const router = useRouter();
  return (
    <TouchableOpacity 
      style={styles.centerButton} 
      onPress={() => router.push('/log-entry')}
    >
      <Plus weight="bold" size={24} color={colors.surface} />
    </TouchableOpacity>
  );
}

function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  return (
    <View style={styles.container}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: 'tabPress',
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        };

        let Icon = House;
        let label = '';
        
        switch (route.name) {
          case 'index':
            Icon = House;
            label = 'Home';
            break;
          case 'log':
            Icon = Notebook;
            label = 'Log';
            break;
          case 'insights':
            Icon = ChartLineUp;
            label = 'Insights';
            break;
          case 'profile':
            Icon = User;
            label = 'Profile';
            break;
        }

        if (route.name === 'empty_center') {
          return (
            <View key={route.key} style={styles.centerButtonContainer}>
              <CenterButton />
            </View>
          );
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tabItem}
            activeOpacity={0.7}
          >
            <Icon
              weight={isFocused ? 'fill' : 'regular'}
              size={24}
              color={isFocused ? colors.textPrimary : colors.textTertiary}
            />
            <Text style={[styles.label, { color: isFocused ? colors.textPrimary : colors.textTertiary }]}>
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      tabBar={(props) => <CustomTabBar {...props} />}
      screenOptions={{
        headerShown: false,
      }}
    >
      <Tabs.Screen name="index" />
      <Tabs.Screen name="log" />
      <Tabs.Screen name="empty_center" />
      <Tabs.Screen name="insights" />
      <Tabs.Screen name="profile" />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    paddingBottom: 30, // SafeArea padding basically
    paddingTop: spacing.sm,
    borderTopWidth: 1,
    borderColor: colors.divider,
    justifyContent: 'space-around',
    alignItems: 'center',
    position: 'relative',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    flex: 1,
  },
  label: {
    ...typography.label,
    marginTop: 4,
  },
  centerButtonContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  centerButton: {
    width: 56,
    height: 56,
    borderRadius: radii.full,
    backgroundColor: colors.accentWarm,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateY: -15 }],
    shadowColor: colors.accentWarm,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 5,
  },
});
