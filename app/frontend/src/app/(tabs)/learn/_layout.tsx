import { Stack } from 'expo-router';
import React from 'react';

export default function LearnStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#0F172A',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'Algorithm Visualizer' }} />
      <Stack.Screen name="[slug]" options={{ title: 'เรียนรู้ Algorithm' }} />
    </Stack>
  );
}

