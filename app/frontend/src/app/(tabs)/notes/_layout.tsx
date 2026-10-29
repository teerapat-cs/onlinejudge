import { Stack } from 'expo-router';
import React from 'react';

export default function NotesStackLayout() {
  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: '#FFFFFF' },
        headerTintColor: '#0F172A',
        headerTitleStyle: { fontWeight: '700' },
      }}
    >
      <Stack.Screen name="index" options={{ title: 'OJ Notes' }} />
      <Stack.Screen name="editor" options={{ title: 'บันทึกโจทย์' }} />
      <Stack.Screen name="[id]" options={{ title: 'รายละเอียด Note' }} />
    </Stack>
  );
}

