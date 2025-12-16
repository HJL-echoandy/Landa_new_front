import React, { useState, useRef } from 'react';
import { ScrollView, TouchableOpacity, TextInput, KeyboardAvoidingView, Platform, FlatList, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, VStack, HStack, Heading } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useAppNavigation } from '../navigation/hooks';

// 常见问题 FAQ
const faqData = [
  {
    id: '1',
    question: 'How do I book a massage?',
    answer: 'You can book a massage by browsing our services on the home page, selecting a therapist, choosing your preferred date and time, and completing the payment.',
  },
  {
    id: '2',
    question: 'What is your cancellation policy?',
    answer: 'You can cancel free of charge up to 24 hours before your appointment. Cancellations within 24 hours may incur a 50% fee.',
  },
  {
    id: '3',
    question: 'How do I reschedule my appointment?',
    answer: 'Go to your Orders, select the appointment you want to reschedule, and tap "Reschedule". You can change the date and time based on therapist availability.',
  },
  {
    id: '4',
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards, Apple Pay, Google Pay, and PayPal. Payment is processed securely through our platform.',
  },
  {
    id: '5',
    question: 'How do I contact my therapist?',
    answer: 'Once your booking is confirmed, you can message your therapist directly through the Messages section of the app.',
  },
  {
    id: '6',
    question: 'Is there a safety guarantee?',
    answer: 'Yes! All our therapists are verified and background-checked. We also have an in-app safety center with emergency features during your session.',
  },
];

// 快捷选项
const quickActions = [
  { id: '1', icon: 'call-outline', label: 'Call Us', action: 'call' },
  { id: '2', icon: 'mail-outline', label: 'Email', action: 'email' },
  { id: '3', icon: 'chatbubble-outline', label: 'Live Chat', action: 'chat' },
  { id: '4', icon: 'help-circle-outline', label: 'FAQ', action: 'faq' },
];

// Mock 聊天消息
const initialMessages = [
  {
    id: '1',
    type: 'bot',
    text: 'Hello! 👋 Welcome to Landa Support. How can I help you today?',
    time: 'Now',
  },
];

type ViewType = 'main' | 'faq' | 'chat';

export default function CustomerServiceScreen() {
  const navigation = useAppNavigation();
  const [currentView, setCurrentView] = useState<ViewType>('main');
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [messages, setMessages] = useState(initialMessages);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'call':
        Linking.openURL('tel:+1-800-LANDA');
        break;
      case 'email':
        Linking.openURL('mailto:support@landa.com');
        break;
      case 'chat':
        setCurrentView('chat');
        break;
      case 'faq':
        setCurrentView('faq');
        break;
    }
  };

  const handleSendMessage = () => {
    if (!inputText.trim()) return;

    const userMessage = {
      id: Date.now().toString(),
      type: 'user',
      text: inputText.trim(),
      time: 'Now',
    };

    setMessages(prev => [...prev, userMessage]);
    setInputText('');

    // 模拟机器人回复
    setTimeout(() => {
      const botResponse = {
        id: (Date.now() + 1).toString(),
        type: 'bot',
        text: 'Thank you for your message! A support agent will respond shortly. Average wait time is under 5 minutes.',
        time: 'Now',
      };
      setMessages(prev => [...prev, botResponse]);
    }, 1000);
  };

  const renderMainView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Box px="$4" pb="$20">
        {/* Welcome Card */}
        <Box
          backgroundColor="white"
          borderRadius={16}
          p="$5"
          mt="$4"
          alignItems="center"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.05,
            shadowRadius: 8,
            elevation: 2,
          }}
        >
          <Box
            backgroundColor="rgba(139, 92, 246, 0.1)"
            borderRadius={32}
            width={64}
            height={64}
            alignItems="center"
            justifyContent="center"
            mb="$3"
          >
            <Ionicons name="headset" size={32} color="#8b5cf6" />
          </Box>
          <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 20, color: '#211115', marginBottom: 4 }}>
            How can we help?
          </Text>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)', textAlign: 'center' }}>
            Our support team is available 24/7 to assist you
          </Text>
        </Box>

        {/* Quick Actions */}
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#211115', marginTop: 24, marginBottom: 12 }}>
          Quick Actions
        </Text>
        <HStack flexWrap="wrap" style={{ gap: 12 }}>
          {quickActions.map(action => (
            <TouchableOpacity
              key={action.id}
              style={{ width: '48%' }}
              onPress={() => handleQuickAction(action.action)}
            >
              <Box
                backgroundColor="white"
                borderRadius={12}
                p="$4"
                alignItems="center"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <Box
                  backgroundColor="rgba(139, 92, 246, 0.1)"
                  borderRadius={12}
                  width={48}
                  height={48}
                  alignItems="center"
                  justifyContent="center"
                  mb="$2"
                >
                  <Ionicons name={action.icon as any} size={24} color="#8b5cf6" />
                </Box>
                <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#211115' }}>
                  {action.label}
                </Text>
              </Box>
            </TouchableOpacity>
          ))}
        </HStack>

        {/* Popular Topics */}
        <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 18, color: '#211115', marginTop: 24, marginBottom: 12 }}>
          Popular Topics
        </Text>
        <VStack space="sm">
          {faqData.slice(0, 3).map(faq => (
            <TouchableOpacity key={faq.id} onPress={() => { setCurrentView('faq'); setExpandedFaq(faq.id); }}>
              <Box
                backgroundColor="white"
                borderRadius={12}
                p="$4"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <HStack alignItems="center" justifyContent="space-between">
                  <Text style={{ flex: 1, fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#211115' }}>
                    {faq.question}
                  </Text>
                  <Ionicons name="chevron-forward" size={20} color="rgba(33, 17, 21, 0.4)" />
                </HStack>
              </Box>
            </TouchableOpacity>
          ))}
        </VStack>

        {/* Contact Info */}
        <Box mt="$6" p="$4" backgroundColor="rgba(139, 92, 246, 0.05)" borderRadius={12}>
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#211115', marginBottom: 8 }}>
            Contact Information
          </Text>
          <HStack alignItems="center" mb="$2">
            <Ionicons name="call-outline" size={16} color="#8b5cf6" />
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(33, 17, 21, 0.7)', marginLeft: 8 }}>
              +1-800-LANDA (24/7)
            </Text>
          </HStack>
          <HStack alignItems="center" mb="$2">
            <Ionicons name="mail-outline" size={16} color="#8b5cf6" />
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(33, 17, 21, 0.7)', marginLeft: 8 }}>
              support@landa.com
            </Text>
          </HStack>
          <HStack alignItems="center">
            <Ionicons name="time-outline" size={16} color="#8b5cf6" />
            <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 13, color: 'rgba(33, 17, 21, 0.7)', marginLeft: 8 }}>
              Average response time: under 5 minutes
            </Text>
          </HStack>
        </Box>
      </Box>
    </ScrollView>
  );

  const renderFaqView = () => (
    <ScrollView showsVerticalScrollIndicator={false}>
      <Box px="$4" pb="$20">
        <VStack space="sm" mt="$4">
          {faqData.map(faq => (
            <TouchableOpacity key={faq.id} onPress={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}>
              <Box
                backgroundColor="white"
                borderRadius={12}
                overflow="hidden"
                style={{
                  shadowColor: '#000',
                  shadowOffset: { width: 0, height: 2 },
                  shadowOpacity: 0.05,
                  shadowRadius: 8,
                  elevation: 2,
                }}
              >
                <HStack alignItems="center" justifyContent="space-between" p="$4">
                  <Text style={{ flex: 1, fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#211115' }}>
                    {faq.question}
                  </Text>
                  <Ionicons 
                    name={expandedFaq === faq.id ? 'chevron-up' : 'chevron-down'} 
                    size={20} 
                    color="#8b5cf6" 
                  />
                </HStack>
                {expandedFaq === faq.id && (
                  <Box px="$4" pb="$4" pt="$0">
                    <Box height={1} backgroundColor="rgba(139, 92, 246, 0.1)" mb="$3" />
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.7)', lineHeight: 22 }}>
                      {faq.answer}
                    </Text>
                  </Box>
                )}
              </Box>
            </TouchableOpacity>
          ))}
        </VStack>

        {/* Still need help? */}
        <Box mt="$6" p="$4" backgroundColor="white" borderRadius={12} alignItems="center">
          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115', marginBottom: 8 }}>
            Still need help?
          </Text>
          <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)', textAlign: 'center', marginBottom: 16 }}>
            Our support team is here to help you
          </Text>
          <TouchableOpacity onPress={() => setCurrentView('chat')}>
            <Box
              backgroundColor="#8b5cf6"
              borderRadius={8}
              px="$6"
              py="$3"
            >
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: 'white' }}>
                Start Live Chat
              </Text>
            </Box>
          </TouchableOpacity>
        </Box>
      </Box>
    </ScrollView>
  );

  const renderChatView = () => (
    <KeyboardAvoidingView 
      style={{ flex: 1 }} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={90}
    >
      <FlatList
        ref={scrollViewRef as any}
        data={messages}
        keyExtractor={item => item.id}
        contentContainerStyle={{ padding: 16 }}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd?.({ animated: true })}
        renderItem={({ item }) => (
          <Box
            alignSelf={item.type === 'user' ? 'flex-end' : 'flex-start'}
            maxWidth="80%"
            mb="$3"
          >
            <Box
              backgroundColor={item.type === 'user' ? '#8b5cf6' : 'white'}
              borderRadius={16}
              borderBottomRightRadius={item.type === 'user' ? 4 : 16}
              borderBottomLeftRadius={item.type === 'bot' ? 4 : 16}
              p="$3"
              style={item.type === 'bot' ? {
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.05,
                shadowRadius: 8,
                elevation: 2,
              } : undefined}
            >
              <Text
                style={{
                  fontFamily: 'Manrope_400Regular',
                  fontSize: 14,
                  color: item.type === 'user' ? 'white' : '#211115',
                  lineHeight: 20,
                }}
              >
                {item.text}
              </Text>
            </Box>
            <Text
              style={{
                fontFamily: 'Manrope_400Regular',
                fontSize: 11,
                color: 'rgba(33, 17, 21, 0.4)',
                marginTop: 4,
                alignSelf: item.type === 'user' ? 'flex-end' : 'flex-start',
              }}
            >
              {item.time}
            </Text>
          </Box>
        )}
      />

      {/* Input */}
      <Box 
        px="$4" 
        py="$3" 
        backgroundColor="white"
        borderTopWidth={1}
        borderTopColor="rgba(0,0,0,0.05)"
      >
        <HStack space="sm" alignItems="center">
          <Box flex={1}>
            <TextInput
              style={{
                backgroundColor: '#f8f6f6',
                borderRadius: 24,
                paddingHorizontal: 16,
                paddingVertical: 12,
                fontFamily: 'Manrope_400Regular',
                fontSize: 14,
                color: '#211115',
              }}
              placeholder="Type your message..."
              placeholderTextColor="rgba(33, 17, 21, 0.4)"
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={handleSendMessage}
              returnKeyType="send"
            />
          </Box>
          <TouchableOpacity onPress={handleSendMessage}>
            <Box
              backgroundColor={inputText.trim() ? '#8b5cf6' : 'rgba(139, 92, 246, 0.3)'}
              borderRadius={24}
              width={44}
              height={44}
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="send" size={20} color="white" />
            </Box>
          </TouchableOpacity>
        </HStack>
      </Box>
    </KeyboardAvoidingView>
  );

  const getHeaderTitle = () => {
    switch (currentView) {
      case 'faq':
        return 'FAQ';
      case 'chat':
        return 'Live Chat';
      default:
        return 'Customer Service';
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <Box px="$4" py="$3" backgroundColor="#f8f6f6">
        <HStack alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={() => currentView === 'main' ? navigation.goBack() : setCurrentView('main')}>
            <Box p="$2">
              <Ionicons name="arrow-back" size={24} color="#211115" />
            </Box>
          </TouchableOpacity>
          <Heading size="lg" style={{ fontFamily: 'Manrope_700Bold', color: '#211115' }}>
            {getHeaderTitle()}
          </Heading>
          <Box width={40} />
        </HStack>
      </Box>

      {/* Content */}
      {currentView === 'main' && renderMainView()}
      {currentView === 'faq' && renderFaqView()}
      {currentView === 'chat' && renderChatView()}
    </SafeAreaView>
  );
}

