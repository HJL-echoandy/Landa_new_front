import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image, KeyboardAvoidingView, Platform, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Heading, Text, Input, InputField } from '@gluestack-ui/themed';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';
import { GestureHandlerRootView, Gesture, GestureDetector } from 'react-native-gesture-handler';
import Animated from 'react-native-reanimated';

const chatMessages = [
  {
    id: 1,
    sender: 'therapist',
    message: "Hi Sarah, I'm looking forward to our session tomorrow. Please let me know if you have any specific areas you'd like me to focus on.",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpgq0lRJwCkuU-_NW1GL24oJ0QH91biu4kGFBwOFQAqgMey6WjfI4OgbWUREL-SYob9n744pbLjQV4m2sB-FN4k7CxzEPIWzIS_u4dgX0hzN9GdvG0MaUOUOw7ex2zl4eOF0r34nPr_gwtPTReoz-SHvAUIqkR0RVdXvx9X3LH-pSQ4O29XprPM_9629KfamXSKHdWpebPY9q-JYH8rShsa4PXOLY6lyuOFTXrTOLqdacowBuqedLyVMJ2F8TyH7IJaPly3_4_rmky'
  },
  {
    id: 2,
    sender: 'user',
    message: "Hi! I'm excited too. My shoulders and lower back have been bothering me lately, so extra attention there would be great.",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBXMzyrnSTdVHpC3oyRVYJj-4eUK9SHud6p0lv-zK-jn9_4fZxW4dPPlpfKAKK5yr6Vo_4vntbjBjcJfwWu1i40Z271mT7Z0a5V4YPkXQqWT3PfIe6YYrqFasA4Aq4wwI5wdh3toSEWYPL_gr_8uLlP65hY8eaaJfik6MNGrmD5t3JagWe9WhZt4eXL71KZISdm8xqZH1cUYrG4IlmKPYIi1Fgm5k6YQJTbBwaYDJhLpguAYC_BuJPQtXnNHpiHNAr-dp1qfu1z47KY'
  },
  {
    id: 3,
    sender: 'therapist',
    message: "Understood. I'll make sure to address those areas. See you then!",
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuChiikJyCmiGugfBoOXqKz3o73ModyWq-5VGnSqJmTdeCdUkPJqhBER32I-yToY6Gl0_3WK8eiD5fK7oz0O5PN7jXkJXbFVpwC1ajD2KS_DrK2Iuf6FJ1uBexNVPws1rMgs3SSSlhBIDrAdezQh7AelYuiFtpoxgbkyTGdQLAq_mkkwd6BiQKOC478CmGorTLxxdg0nQtjWHJ870_N7QQJP2CUe3ckzsAerpOnt5j9Oz0a8uSm-Kb10NzuB8jJSPF_DYfOFuSuX3vNz'
  }
];

export default function ChatScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { contactName = 'Therapist Chat' } = route.params || {};
  const [messageText, setMessageText] = useState('');
  const screenWidth = Dimensions.get('window').width;
  
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleSendMessage = () => {
    if (messageText.trim()) {
      // 这里将来接入发送消息 API
      setMessageText('');
    }
  };

  const panGesture = Gesture.Pan()
    .onEnd((event) => {
      if (event.absoluteX < 50 && event.translationX > 100) {
        navigation.goBack();
      }
    });

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <GestureDetector gesture={panGesture}>
        <Animated.View style={{ flex: 1 }}>
          <SafeAreaView style={{ flex: 1 }}>
          <KeyboardAvoidingView 
            style={{ flex: 1 }} 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          >
            <Box flex={1} style={{ backgroundColor: '#f8f6f6' }}>
          {/* Header */}
          <Box
            flexDirection="row"
            alignItems="center"
            justifyContent="space-between"
            p="$4"
            style={{
              borderBottomWidth: 1,
              borderBottomColor: 'rgba(230, 76, 115, 0.2)',
              backgroundColor: '#f8f6f6',
            }}
          >
            <TouchableOpacity onPress={() => navigation.goBack()}>
              <Ionicons name="arrow-back" size={24} color="#211115" />
            </TouchableOpacity>
            <Heading
              size="lg"
              style={{ fontFamily: 'Inter_700Bold', color: '#211115' }}
            >
              {contactName}
            </Heading>
            <Box w="$6" />
          </Box>

          {/* Chat Messages */}
          <Box flex={1}>
            <ScrollView 
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ padding: 16, gap: 24 }}
            >
              {chatMessages.map((message) => (
                <Box
                  key={message.id}
                  flexDirection="row"
                  alignItems="flex-end"
                  style={{
                    gap: 12,
                    justifyContent: message.sender === 'user' ? 'flex-end' : 'flex-start',
                  }}
                >
                  {message.sender === 'therapist' && (
                    <Image
                      source={{ uri: message.avatar }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                      }}
                    />
                  )}
                  
                  <Box
                    style={{
                      flexDirection: 'column',
                      alignItems: message.sender === 'user' ? 'flex-end' : 'flex-start',
                      gap: 6,
                      maxWidth: '75%',
                    }}
                  >
                    <Text
                      style={{
                        fontFamily: 'Inter_400Regular',
                        fontSize: 12,
                        color: 'rgba(33, 17, 21, 0.6)',
                      }}
                    >
                      {message.sender === 'user' ? 'Sarah' : 'Therapist'}
                    </Text>
                    <Box
                      style={{
                        backgroundColor: message.sender === 'user' ? '#e64c73' : 'rgba(230, 76, 115, 0.1)',
                        borderRadius: 12,
                        borderBottomLeftRadius: message.sender === 'therapist' ? 0 : 12,
                        borderBottomRightRadius: message.sender === 'user' ? 0 : 12,
                        padding: 12,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 16,
                          color: message.sender === 'user' ? 'white' : '#211115',
                        }}
                      >
                        {message.message}
                      </Text>
                    </Box>
                  </Box>

                  {message.sender === 'user' && (
                    <Image
                      source={{ uri: message.avatar }}
                      style={{
                        width: 40,
                        height: 40,
                        borderRadius: 20,
                      }}
                    />
                  )}
                </Box>
              ))}
            </ScrollView>
          </Box>

          {/* Message Input */}
          <Box
            p="$4"
            style={{
              backgroundColor: '#f8f6f6',
              borderTopWidth: 1,
              borderTopColor: 'rgba(230, 76, 115, 0.2)',
            }}
          >
            <Box flexDirection="row" alignItems="center" style={{ gap: 12 }}>
              <Box
                flex={1}
                flexDirection="row"
                alignItems="center"
                style={{
                  backgroundColor: 'rgba(230, 76, 115, 0.1)',
                  borderRadius: 12,
                }}
              >
                <Input
                  flex={1}
                  style={{
                    backgroundColor: 'transparent',
                    borderWidth: 0,
                  }}
                >
                  <InputField
                    placeholder="Type a message"
                    value={messageText}
                    onChangeText={setMessageText}
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 16,
                      color: '#211115',
                      paddingHorizontal: 16,
                      paddingVertical: 12,
                    }}
                    placeholderTextColor="rgba(33, 17, 21, 0.6)"
                  />
                </Input>
                
                <TouchableOpacity style={{ padding: 12 }}>
                  <Ionicons name="image" size={20} color="rgba(33, 17, 21, 0.6)" />
                </TouchableOpacity>
                
                <TouchableOpacity style={{ padding: 12 }}>
                  <Ionicons name="mic" size={20} color="rgba(33, 17, 21, 0.6)" />
                </TouchableOpacity>
              </Box>
              
              <TouchableOpacity
                onPress={handleSendMessage}
                style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  backgroundColor: '#e64c73',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Ionicons name="send" size={24} color="white" />
              </TouchableOpacity>
            </Box>
          </Box>
            </Box>
          </KeyboardAvoidingView>
          </SafeAreaView>
        </Animated.View>
      </GestureDetector>
    </GestureHandlerRootView>
  );
}
