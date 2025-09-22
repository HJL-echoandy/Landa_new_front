import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Heading } from '@gluestack-ui/themed';

export default function ProfileScreen() {
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <Box flex={1} justifyContent="center" alignItems="center" style={{ backgroundColor: '#f8f6f6' }}>
        <Heading>Profile Screen</Heading>
      </Box>
    </SafeAreaView>
  );
}