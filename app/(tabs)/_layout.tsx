import React from 'react';
import { isLiquidGlassAvailable } from 'expo-glass-effect';
import { Tabs } from 'expo-router';
import { NativeTabs, Icon, Label, Badge } from 'expo-router/unstable-native-tabs';
import { BlurView } from 'expo-blur';
import { Platform, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Colors from '@/constants/colors';
import { useApp } from '@/contexts/AppContext';

function NativeTabLayout() {
  const { t, unreadCount } = useApp();
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="cookies">
        <Icon sf={{ default: 'circle.grid.2x2', selected: 'circle.grid.2x2.fill' }} />
        <Label>{t('cookies')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="noodles">
        <Icon sf={{ default: 'play.rectangle', selected: 'play.rectangle.fill' }} />
        <Label>{t('noodles')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="add">
        <Icon sf={{ default: 'plus.circle', selected: 'plus.circle.fill' }} />
        <Label>{t('add')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="friends">
        <Icon sf={{ default: 'person.2', selected: 'person.2.fill' }} />
        <Label>{t('friends')}</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="popcorn">
        <Icon sf={{ default: 'bell', selected: 'bell.fill' }} />
        <Label>{t('popcorn')}</Label>
        {unreadCount > 0 && <Badge>{unreadCount}</Badge>}
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  const { t, unreadCount } = useApp();
  const safeAreaInsets = useSafeAreaInsets();
  const isWeb = Platform.OS === 'web';
  const isIOS = Platform.OS === 'ios';

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: Colors.tabInactive,
        tabBarStyle: {
          position: 'absolute',
          backgroundColor: isIOS ? 'transparent' : Colors.tabBar,
          borderTopWidth: isWeb ? 1 : 0,
          borderTopColor: 'rgba(255,255,255,0.3)',
          elevation: 0,
          ...(isWeb ? { height: 84 } : {}),
        },
        tabBarBackground: () =>
          isIOS ? (
            <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
          ) : isWeb ? (
            <View style={[StyleSheet.absoluteFill, { backgroundColor: 'rgba(255,240,245,0.92)', backdropFilter: 'blur(20px)' } as any]} />
          ) : null,
        tabBarLabelStyle: { fontSize: 10, fontWeight: '600' as const },
      }}
    >
      <Tabs.Screen
        name="cookies"
        options={{
          title: t('cookies'),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="cookie" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="noodles"
        options={{
          title: t('noodles'),
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="noodles" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="add"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <View style={styles.addBtnOuter}>
              <View style={[styles.addBtnGlow, focused && styles.addBtnGlowActive]} />
              <View style={styles.addBtnInner}>
                <Ionicons name="add" size={30} color="#fff" />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="friends"
        options={{
          title: t('friends'),
          tabBarIcon: ({ color, size }) => <Ionicons name="people" size={size} color={color} />,
        }}
      />
      <Tabs.Screen
        name="popcorn"
        options={{
          title: t('popcorn'),
          tabBarBadge: unreadCount > 0 ? unreadCount : undefined,
          tabBarBadgeStyle: { backgroundColor: Colors.danger, fontSize: 10 },
          tabBarIcon: ({ color, size }) => <MaterialCommunityIcons name="popcorn" size={size} color={color} />,
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) return <NativeTabLayout />;
  return <ClassicTabLayout />;
}

const styles = StyleSheet.create({
  addBtnOuter: {
    width: 56,
    height: 56,
    marginTop: -20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addBtnGlow: {
    position: 'absolute',
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(255,107,138,0.15)',
  },
  addBtnGlowActive: {
    backgroundColor: 'rgba(255,107,138,0.3)',
    width: 66,
    height: 66,
    borderRadius: 33,
  },
  addBtnInner: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: Colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 6,
  },
});
