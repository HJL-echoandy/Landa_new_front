import React from 'react';
import { Box, Heading, Text } from '@gluestack-ui/themed';

export default function SignupScreen() {
  return (
    <Box flex={1} p="$4" alignItems="center" justifyContent="center">
      <Heading size="lg">注册</Heading>
      <Text mt="$2">这里将放注册表单。</Text>
    </Box>
  );
}


