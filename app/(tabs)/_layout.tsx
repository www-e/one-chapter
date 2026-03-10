import { Tabs } from 'expo-router';
import React from 'react';
import { GlassTabBar } from '@/components/navigation';

export default function TabLayout() {
  return (
    <>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarStyle: { display: 'none' }, // Hide default tab bar completely
        }}>
        <Tabs.Screen
          name="index"
          options={{
            title: 'Tasks',
          }}
        />
        <Tabs.Screen
          name="explore"
          options={{
            title: 'Categories',
          }}
        />
        <Tabs.Screen
          name="stats"
          options={{
            title: 'Stats',
          }}
        />
      </Tabs>

      {/* Our custom glass tab bar - it figures out active tab itself */}
      <GlassTabBar />
    </>
  );
}
