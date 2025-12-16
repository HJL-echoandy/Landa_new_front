import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Image, Animated, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Heading, Text, Input, InputField } from '@gluestack-ui/themed';
import { useFonts, Inter_400Regular, Inter_500Medium, Inter_700Bold, Inter_900Black } from '@expo-google-fonts/inter';
import { Ionicons } from '@expo/vector-icons';
import { useAppNavigation } from '../navigation/hooks';
import { Swipeable, GestureHandlerRootView } from 'react-native-gesture-handler';

const frequentContactsData = [
  {
    id: 1,
    name: 'Elara',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpgq0lRJwCkuU-_NW1GL24oJ0QH91biu4kGFBwOFQAqgMey6WjfI4OgbWUREL-SYob9n744pbLjQV4m2sB-FN4k7CxzEPIWzIS_u4dgX0hzN9GdvG0MaUOUOw7ex2zl4eOF0r34nPr_gwtPTReoz-SHvAUIqkR0RVdXvx9X3LH-pSQ4O29XprPM_9629KfamXSKHdWpebPY9q-JYH8rShsa4PXOLY6lyuOFTXrTOLqdacowBuqedLyVMJ2F8TyH7IJaPly3_4_rmky'
  },
  {
    id: 2,
    name: 'Jasmine',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlXSw7jJZk0ChG-g4ZwHEQfEJ6E0sDzZACYDe-Ays7OOnmi9cMAOQZUqWgtJYkGW9IMxIhGQrgc8np81ndrt3cnGDkfyb_5cdGSH5r6B-odwU9yDiZLcXBLrW_BMpiRbiXcmmVVETAtFjc71iirp_6jx4TBTpntcrDCEvsJ0EomkbXfvjxclFMUeIcdyuXNpzXWm23Mwqub88tshbYdTEf6gSNquZkUL8APKPHcGQQkdPHycAyXZMkuWLksSh8UZ2lekj_ACJd0lJl'
  },
  {
    id: 3,
    name: 'Chloe',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlXSw7jJZk0ChG-g4ZwHEQfEJ6E0sDzZACYDe-Ays7OOnmi9cMAOQZUqWgtJYkGW9IMxIhGQrgc8np81ndrt3cnGDkfyb_5cdGSH5r6B-odwU9yDiZLcXBLrW_BMpiRbiXcmmVVETAtFjc71iirp_6jx4TBTpntcrDCEvsJ0EomkbXfvjxclFMUeIcdyuXNpzXWm23Mwqub88tshbYdTEf6gSNquZkUL8APKPHcGQQkdPHycAyXZMkuWLksSh8UZ2lekj_ACJd0lJl'
  }
];

const messagesData = [
  {
    id: 1,
    name: 'Elara',
    message: "Understood. I'll make sure to address those areas. See you then!",
    time: '10:30 AM',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBpgq0lRJwCkuU-_NW1GL24oJ0QH91biu4kGFBwOFQAqgMey6WjfI4OgbWUREL-SYob9n744pbLjQV4m2sB-FN4k7CxzEPIWzIS_u4dgX0hzN9GdvG0MaUOUOw7ex2zl4eOF0r34nPr_gwtPTReoz-SHvAUIqkR0RVdXvx9X3LH-pSQ4O29XprPM_9629KfamXSKHdWpebPY9q-JYH8rShsa4PXOLY6lyuOFTXrTOLqdacowBuqedLyVMJ2F8TyH7IJaPly3_4_rmky'
  },
  {
    id: 2,
    name: 'Jasmine',
    message: 'Can we reschedule for Friday afternoon?',
    time: 'Yesterday',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlXSw7jJZk0ChG-g4ZwHEQfEJ6E0sDzZACYDe-Ays7OOnmi9cMAOQZUqWgtJYkGW9IMxIhGQrgc8np81ndrt3cnGDkfyb_5cdGSH5r6B-odwU9yDiZLcXBLrW_BMpiRbiXcmmVVETAtFjc71iirp_6jx4TBTpntcrDCEvsJ0EomkbXfvjxclFMUeIcdyuXNpzXWm23Mwqub88tshbYdTEf6gSNquZkUL8APKPHcGQQkdPHycAyXZMkuWLksSh8UZ2lekj_ACJd0lJl'
  },
  {
    id: 3,
    name: 'Chloe',
    message: 'Thank you for the session, I feel so much better!',
    time: '2 days ago',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlXSw7jJZk0ChG-g4ZwHEQfEJ6E0sDzZACYDe-Ays7OOnmi9cMAOQZUqWgtJYkGW9IMxIhGQrgc8np81ndrt3cnGDkfyb_5cdGSH5r6B-odwU9yDiZLcXBLrW_BMpiRbiXcmmVVETAtFjc71iirp_6jx4TBTpntcrDCEvsJ0EomkbXfvjxclFMUeIcdyuXNpzXWm23Mwqub88tshbYdTEf6gSNquZkUL8APKPHcGQQkdPHycAyXZMkuWLksSh8UZ2lekj_ACJd0lJl'
  },
  {
    id: 4,
    name: 'Seraphina',
    message: 'Just confirming my appointment for next Tuesday.',
    time: '1 week ago',
    avatar: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDlXSw7jJZk0ChG-g4ZwHEQfEJ6E0sDzZACYDe-Ays7OOnmi9cMAOQZUqWgtJYkGW9IMxIhGQrgc8np81ndrt3cnGDkfyb_5cdGSH5r6B-odwU9yDiZLcXBLrW_BMpiRbiXcmmVVETAtFjc71iirp_6jx4TBTpntcrDCEvsJ0EomkbXfvjxclFMUeIcdyuXNpzXWm23Mwqub88tshbYdTEf6gSNquZkUL8APKPHcGQQkdPHycAyXZMkuWLksSh8UZ2lekj_ACJd0lJl'
  }
];

export default function MessagesScreen() {
  const navigation = useAppNavigation();
  const [searchText, setSearchText] = useState('');
  const [messages, setMessages] = useState(messagesData);
  const [fontsLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_700Bold,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return null;
  }

  const handleDeleteMessage = (messageId: number) => {
    Alert.alert(
      "删除消息",
      "确定要删除这条消息吗？",
      [
        {
          text: "取消",
          style: "cancel"
        },
        {
          text: "删除",
          style: "destructive",
          onPress: () => {
            setMessages(messages.filter(msg => msg.id !== messageId));
          }
        }
      ]
    );
  };

  const renderRightAction = (messageId: number) => {
    return (
      <TouchableOpacity
        style={{
          backgroundColor: '#e64c73',
          justifyContent: 'center',
          alignItems: 'center',
          width: 80,
          height: '100%',
        }}
        onPress={() => handleDeleteMessage(messageId)}
      >
        <Ionicons name="trash" size={24} color="white" />
        <Text style={{ color: 'white', fontSize: 12, marginTop: 4 }}>删除</Text>
      </TouchableOpacity>
    );
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaView style={{ flex: 1 }}>
        <Box flex={1} style={{ backgroundColor: '#f8f6f6' }}>
        {/* Header */}
        <Box
          flexDirection="row"
          alignItems="center"
          justifyContent="center"
          p="$4"
          style={{
            borderBottomWidth: 1,
            borderBottomColor: 'rgba(230, 76, 115, 0.2)',
            backgroundColor: '#f8f6f6',
          }}
        >
          <Heading
            size="lg"
            style={{ fontFamily: 'Inter_700Bold', color: '#211115' }}
          >
            Messages
          </Heading>
        </Box>

        {/* Search Bar */}
        <Box p="$4" style={{ backgroundColor: '#f8f6f6' }}>
          <Box position="relative">
            <Input
              style={{
                borderRadius: 25,
                borderColor: 'rgba(230, 76, 115, 0.2)',
                backgroundColor: '#f8f6f6',
                height: 40,
              }}
            >
              <InputField
                placeholder="Search contacts"
                value={searchText}
                onChangeText={setSearchText}
                style={{
                  fontFamily: 'Inter_400Regular',
                  fontSize: 14,
                  color: '#211115',
                  paddingLeft: 40,
                }}
                placeholderTextColor="rgba(33, 17, 21, 0.4)"
              />
            </Input>
            <Box position="absolute" left="$3" top="$2" bottom="$2">
              <Ionicons name="search" size={20} color="rgba(33, 17, 21, 0.4)" />
            </Box>
          </Box>
        </Box>

        {/* Frequent Contacts */}
        <Box px="$4" pb="$4">
          <Heading
            size="md"
            mb="$3"
            style={{ fontFamily: 'Inter_700Bold', color: '#211115' }}
          >
            Frequent Contacts
          </Heading>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            <Box flexDirection="row" style={{ gap: 16 }}>
              {frequentContactsData.map((contact) => (
                <TouchableOpacity 
                  key={contact.id} 
                  style={{ alignItems: 'center' }}
                  onPress={() => navigation.navigate('Chat', { contactName: contact.name })}
                >
                  <Image
                    source={{ uri: contact.avatar }}
                    style={{
                      width: 64,
                      height: 64,
                      borderRadius: 32,
                    }}
                  />
                  <Text
                    mt="$2"
                    style={{
                      fontFamily: 'Inter_400Regular',
                      fontSize: 12,
                      color: '#211115',
                    }}
                  >
                    {contact.name}
                  </Text>
                </TouchableOpacity>
              ))}
            </Box>
          </ScrollView>
        </Box>

        {/* All Messages Header */}
        <Box
          px="$4"
          pb="$2"
          flexDirection="row"
          justifyContent="space-between"
          alignItems="center"
          style={{
            borderTopWidth: 1,
            borderTopColor: 'rgba(230, 76, 115, 0.2)',
            paddingTop: 16,
          }}
        >
          <Heading
            size="md"
            style={{ fontFamily: 'Inter_700Bold', color: '#211115' }}
          >
            All Messages
          </Heading>
          <TouchableOpacity style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text
              style={{
                fontFamily: 'Inter_400Regular',
                fontSize: 14,
                color: 'rgba(33, 17, 21, 0.6)',
                marginRight: 4,
              }}
            >
              Date
            </Text>
            <Ionicons name="swap-vertical" size={16} color="rgba(33, 17, 21, 0.6)" />
          </TouchableOpacity>
        </Box>

        {/* Messages List */}
        <Box flex={1}>
          <ScrollView showsVerticalScrollIndicator={false}>
            {messages.map((message, index) => (
              <Swipeable
                key={message.id}
                renderRightActions={() => renderRightAction(message.id)}
                rightThreshold={40}
              >
                <TouchableOpacity
                  style={{
                    borderBottomWidth: index < messages.length - 1 ? 1 : 0,
                    borderBottomColor: 'rgba(230, 76, 115, 0.2)',
                    backgroundColor: '#f8f6f6',
                  }}
                  activeOpacity={0.7}
                  onPress={() => navigation.navigate('Chat', { contactName: message.name })}
                >
                  <Box
                    flexDirection="row"
                    alignItems="center"
                    p="$4"
                    style={{ gap: 16 }}
                  >
                    {/* Avatar */}
                    <Image
                      source={{ uri: message.avatar }}
                      style={{
                        width: 48,
                        height: 48,
                        borderRadius: 24,
                      }}
                    />

                    {/* Message Content */}
                    <Box flex={1}>
                      <Box flexDirection="row" justifyContent="space-between" alignItems="center" mb="$1">
                        <Text
                          style={{
                            fontFamily: 'Inter_700Bold',
                            fontSize: 16,
                            color: '#211115',
                          }}
                        >
                          {message.name}
                        </Text>
                        <Text
                          style={{
                            fontFamily: 'Inter_400Regular',
                            fontSize: 12,
                            color: 'rgba(33, 17, 21, 0.6)',
                          }}
                        >
                          {message.time}
                        </Text>
                      </Box>
                      <Text
                        numberOfLines={1}
                        style={{
                          fontFamily: 'Inter_400Regular',
                          fontSize: 14,
                          color: 'rgba(33, 17, 21, 0.6)',
                        }}
                      >
                        {message.message}
                      </Text>
                    </Box>
                  </Box>
                </TouchableOpacity>
              </Swipeable>
            ))}
          </ScrollView>
        </Box>
        </Box>
      </SafeAreaView>
    </GestureHandlerRootView>
  );
}
