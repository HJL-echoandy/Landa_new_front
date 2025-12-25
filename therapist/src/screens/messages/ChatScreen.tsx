import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const COLORS = {
  primary: '#F9F506', // Landa Yellow
  backgroundLight: '#F8F8F5',
  backgroundDark: '#23220F',
  surfaceLight: '#FFFFFF',
  textMain: '#1C1C0D',
  textSec: '#888870',
  bubbleLeft: '#FFFFFF',
  bubbleRight: '#F9F506',
  inputBg: '#F4F4E6',
};

const INITIAL_MESSAGES = [
  { id: '1', text: 'Hi! I need to reschedule our 3 PM appointment.', time: '10:23 AM', isMe: false },
  { id: '2', text: 'No problem, Jane. What time works best for you?', time: '10:25 AM', isMe: true, isRead: true },
  { id: '3', text: 'Is 5 PM available?', time: '10:28 AM', isMe: false },
];

export default function ChatScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { customerName, customerId } = (route.params as any) || { customerName: 'Jane Doe', customerId: '1' };
  
  const [messages, setMessages] = useState(INITIAL_MESSAGES);
  const [inputText, setInputText] = useState('');
  const scrollViewRef = useRef<ScrollView>(null);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    const newMessage = {
      id: Date.now().toString(),
      text: inputText,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      isRead: false,
    };

    setMessages([...messages, newMessage]);
    setInputText('');
    
    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 100);
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <SafeAreaView style={styles.header} edges={['top']}>
        <View style={styles.headerContent}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back-ios" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
          
          <View style={styles.headerInfo}>
            <View style={styles.avatarContainer}>
              <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpGT81RptJg002M2O6FHWfuulKNdsKbTlwHbKTxbPS48jYbM7H-sHYHLa5un4FDHfxZXuMVUjZO4ZLhPd7FtHAKZdJOhyudQqSxSyji6lB9VNyxi5p4lhYGFgXaPIKbzi4IHgsAW4X4Q2kBKEiSBuVpLUbWZ1D6AE35FoDE1jgEZTSYtEiPkxN3CaqqHrdnDulEo3VdPZPG74WXqMQdDP3yKnXdqICemKZ01diZuHKma31q3pphNZ0D31tXqcaeY_tPMsHxD3Bu9c' }} 
                style={styles.avatar} 
              />
              <View style={styles.onlineDot} />
            </View>
            <View>
              <Text style={styles.name}>{customerName}</Text>
              <Text style={styles.status}>Active now</Text>
            </View>
          </View>

          <TouchableOpacity style={styles.callButton}>
            <MaterialIcons name="call" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>

      {/* Chat Area */}
      <KeyboardAvoidingView 
        style={{ flex: 1 }} 
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={styles.chatContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.timeDivider}>
            <Text style={styles.timeDividerText}>Today, 10:23 AM</Text>
          </View>

          {messages.map((msg) => (
            <View key={msg.id} style={[styles.messageRow, msg.isMe ? styles.messageRowMe : styles.messageRowOther]}>
              {!msg.isMe && (
                <Image 
                  source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuCpGT81RptJg002M2O6FHWfuulKNdsKbTlwHbKTxbPS48jYbM7H-sHYHLa5un4FDHfxZXuMVUjZO4ZLhPd7FtHAKZdJOhyudQqSxSyji6lB9VNyxi5p4lhYGFgXaPIKbzi4IHgsAW4X4Q2kBKEiSBuVpLUbWZ1D6AE35FoDE1jgEZTSYtEiPkxN3CaqqHrdnDulEo3VdPZPG74WXqMQdDP3yKnXdqICemKZ01diZuHKma31q3pphNZ0D31tXqcaeY_tPMsHxD3Bu9c' }} 
                  style={styles.msgAvatar} 
                />
              )}
              
              <View style={[styles.bubbleContainer, msg.isMe ? styles.bubbleMe : styles.bubbleOther]}>
                <View style={[styles.bubble, msg.isMe ? styles.bubbleContentMe : styles.bubbleContentOther]}>
                  <Text style={styles.msgText}>{msg.text}</Text>
                </View>
                <View style={styles.msgMeta}>
                  <Text style={styles.msgTime}>{msg.time}</Text>
                  {msg.isMe && msg.isRead && (
                    <MaterialIcons name="done-all" size={14} color={COLORS.textSec} />
                  )}
                </View>
              </View>
            </View>
          ))}
        </ScrollView>

        {/* Input Area */}
        <View style={styles.inputArea}>
          <TouchableOpacity style={styles.attachButton}>
            <MaterialIcons name="add-circle-outline" size={28} color={COLORS.textSec} />
          </TouchableOpacity>
          
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              placeholder="Message..."
              placeholderTextColor={COLORS.textSec}
              value={inputText}
              onChangeText={setInputText}
              multiline
            />
            <TouchableOpacity style={styles.emojiButton}>
              <MaterialIcons name="sentiment-satisfied" size={24} color={COLORS.textSec} />
            </TouchableOpacity>
          </View>

          <TouchableOpacity 
            style={styles.sendButton}
            onPress={sendMessage}
          >
            <MaterialIcons name="arrow-upward" size={20} color={COLORS.textMain} />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    backgroundColor: 'rgba(248, 248, 245, 0.9)',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E0',
    zIndex: 10,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -8,
  },
  headerInfo: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatarContainer: {
    position: 'relative',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    borderWidth: 2,
    borderColor: 'white',
  },
  onlineDot: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#22C55E', // Green
    borderWidth: 2,
    borderColor: COLORS.backgroundLight,
  },
  name: {
    fontSize: 16,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  status: {
    fontSize: 12,
    color: COLORS.textSec,
    fontWeight: '500',
  },
  callButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F4F4E6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  chatContent: {
    padding: 16,
    paddingBottom: 20,
  },
  timeDivider: {
    alignItems: 'center',
    marginVertical: 16,
  },
  timeDividerText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#888860',
    backgroundColor: '#F4F4E6',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  messageRow: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 8,
  },
  messageRowMe: {
    justifyContent: 'flex-end',
  },
  messageRowOther: {
    justifyContent: 'flex-start',
    alignItems: 'flex-end',
  },
  msgAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginBottom: 4,
  },
  bubbleContainer: {
    maxWidth: '75%',
    gap: 4,
  },
  bubbleMe: {
    alignItems: 'flex-end',
  },
  bubbleOther: {
    alignItems: 'flex-start',
  },
  bubble: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 1,
    elevation: 1,
  },
  bubbleContentMe: {
    backgroundColor: COLORS.primary,
    borderBottomRightRadius: 4,
  },
  bubbleContentOther: {
    backgroundColor: COLORS.surfaceLight,
    borderBottomLeftRadius: 4,
  },
  msgText: {
    fontSize: 15,
    color: COLORS.textMain,
    lineHeight: 22,
  },
  msgMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 4,
  },
  msgTime: {
    fontSize: 11,
    color: COLORS.textSec,
  },
  inputArea: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingBottom: 32, // Safe area
    backgroundColor: COLORS.backgroundLight,
    gap: 8,
  },
  attachButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  inputWrapper: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.inputBg,
    borderRadius: 24,
    paddingHorizontal: 8,
    minHeight: 48,
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 16,
    color: COLORS.textMain,
    maxHeight: 100,
  },
  emojiButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
});

