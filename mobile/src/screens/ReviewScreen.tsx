import React, { useState } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  ButtonText,
  ScrollView,
  Image,
  Input,
  InputField,
  Textarea,
  TextareaInput,
  Checkbox,
  CheckboxIndicator,
  CheckboxIcon,
  CheckboxLabel,
  Radio,
  RadioGroup,
  RadioIndicator,
  RadioIcon,
  RadioLabel,
} from '@gluestack-ui/themed';
import { StatusBar, TouchableOpacity, Alert } from 'react-native';
import { useAppNavigation, useAppRoute } from '../navigation/hooks';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, SplineSans_400Regular, SplineSans_500Medium, SplineSans_600SemiBold, SplineSans_700Bold } from '@expo-google-fonts/spline-sans';

export default function ReviewScreen() {
  const navigation = useAppNavigation();
  const route = useAppRoute<'Review'>();
  const [fontsLoaded] = useFonts({
    SplineSans_400Regular,
    SplineSans_500Medium,
    SplineSans_600SemiBold,
    SplineSans_700Bold,
  });

  const [rating, setRating] = useState(5);
  const [feedback, setFeedback] = useState('');
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [tipAmount, setTipAmount] = useState('other');
  const [customTip, setCustomTip] = useState('');

  if (!fontsLoaded) {
    return null;
  }

  // Default data if no route params (for development)
  const reviewData = route.params || {
    therapistName: 'Sophia',
    therapistImage: 'https://lh3.googleusercontent.com/aida-public/AB6AXuDBwsg9IYp0sP7RyjpuQ4CRngGJIWR52BTtCQTJ_YZtme_pVm3quNHBXOk9cf7kslwr4TGwqqFR0pSxzqFuReMIm896Iu8h1r8HdtI9Qv-E4jDNY4hIR9pzyu3lOPpUtijGlwLBgHTTtySt00SSGcOWRI-nFXlmigNe5hoLve_njEq8bs91WAgxTtXCXgu8bCfTHgG349LVkVcq1ll93KAxlktQITNlxslBjWK4BsRbCnJUoXrNmMhrtSJ6guiXTR3JO5sbdMLZHtet',
    serviceName: 'Luxe Aromatherapy Massage',
    orderId: 'ORD001',
  };

  const handleBack = () => {
    navigation.goBack();
  };

  const handleStarPress = (starIndex: number) => {
    setRating(starIndex + 1);
  };

  const handleUploadMedia = () => {
    Alert.alert('Upload Media', 'Media upload functionality will be implemented here.');
  };

  const handleSubmitReview = () => {
    console.log('Submit review:', {
      rating,
      feedback,
      isAnonymous,
      tipAmount,
      customTip,
      therapistName: reviewData.therapistName,
      orderId: reviewData.orderId,
    });
    
    Alert.alert(
      'Review Submitted',
      'Thank you for your feedback!',
      [
        {
          text: 'OK',
          onPress: () => navigation.goBack(),
        },
      ]
    );
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => (
      <TouchableOpacity key={index} onPress={() => handleStarPress(index)}>
        <Ionicons
          name={index < rating ? 'star' : 'star-outline'}
          size={40}
          color="#E5B2B2"
        />
      </TouchableOpacity>
    ));
  };

  return (
    <Box flex={1} backgroundColor="#FDFBFB">
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      
      {/* Header */}
      <Box
        backgroundColor="white"
        pt="$12"
        pb="$4"
        px="$4"
        shadowColor="$black"
        shadowOffset={{
          width: 0,
          height: 2,
        }}
        shadowOpacity={0.05}
        shadowRadius={4}
        elevation={2}
      >
        <HStack alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={handleBack}>
            <Box
              width="$8"
              height="$8"
              alignItems="center"
              justifyContent="center"
            >
              <Ionicons name="close" size={24} color="#796D6D" />
            </Box>
          </TouchableOpacity>
          
          <Text
            fontSize="$lg"
            fontFamily="SplineSans_700Bold"
            color="#3D2C2C"
          >
            Rate Your Service
          </Text>
          
          <Box width="$8" />
        </HStack>
      </Box>

      <ScrollView flex={1} px="$6" showsVerticalScrollIndicator={false}>
        <VStack space="2xl" py="$8">
          
          {/* Therapist Info */}
          <HStack alignItems="center" space="md">
            <Image
              source={{
                uri: reviewData.therapistImage
              }}
              width="$20"
              height="$20"
              borderRadius="$full"
              alt="Therapist avatar"
            />
            <VStack>
              <Text
                fontSize="$xl"
                fontFamily="SplineSans_700Bold"
                color="#3D2C2C"
              >
                {reviewData.therapistName}
              </Text>
              <Text
                fontSize="$md"
                fontFamily="SplineSans_400Regular"
                color="#796D6D"
              >
                Massage Therapist
              </Text>
            </VStack>
          </HStack>

          {/* Rating Section */}
          <Box
            backgroundColor="white"
            borderRadius="$2xl"
            p="$6"
            shadowColor="$black"
            shadowOffset={{
              width: 0,
              height: 2,
            }}
            shadowOpacity={0.05}
            shadowRadius={8}
            elevation={3}
          >
            <VStack space="md">
              <Text
                fontSize="$lg"
                fontFamily="SplineSans_600SemiBold"
                color="#3D2C2C"
              >
                How was your experience?
              </Text>
              
              <HStack justifyContent="center" space="xs" py="$4">
                {renderStars()}
              </HStack>
              
              {/* Rating Slider Visual */}
              <Box
                height="$2"
                backgroundColor="#E5E5E5"
                borderRadius="$full"
                position="relative"
              >
                <Box
                  height="$2"
                  backgroundColor="#E5B2B2"
                  borderRadius="$full"
                  width={`${(rating / 5) * 100}%`}
                />
              </Box>
            </VStack>
          </Box>

          {/* Feedback Section */}
          <Box
            backgroundColor="white"
            borderRadius="$2xl"
            p="$6"
            shadowColor="$black"
            shadowOffset={{
              width: 0,
              height: 2,
            }}
            shadowOpacity={0.05}
            shadowRadius={8}
            elevation={3}
          >
            <VStack space="md">
              <HStack justifyContent="space-between" alignItems="center">
                <Text
                  fontSize="$lg"
                  fontFamily="SplineSans_600SemiBold"
                  color="#3D2C2C"
                >
                  Leave Feedback
                </Text>
                
                <HStack alignItems="center" space="xs">
                  <Checkbox
                    value="anonymous"
                    isChecked={isAnonymous}
                    onChange={setIsAnonymous}
                    size="sm"
                  >
                    <CheckboxIndicator mr="$2">
                      <CheckboxIcon as={() => 
                        <Ionicons 
                          name="checkmark" 
                          size={12} 
                          color={isAnonymous ? "#E5B2B2" : "transparent"} 
                        />
                      } />
                    </CheckboxIndicator>
                    <CheckboxLabel
                      fontSize="$sm"
                      fontFamily="SplineSans_400Regular"
                      color="#796D6D"
                    >
                      Post anonymously
                    </CheckboxLabel>
                  </Checkbox>
                </HStack>
              </HStack>
              
              <Textarea
                borderColor="#E0D8D8"
                backgroundColor="#FDFBFB"
                borderRadius="$xl"
                p="$4"
                minHeight={144}
                focusable={true}
                $focus-borderColor="#E5B2B2"
                $focus-borderWidth={1}
              >
                <TextareaInput
                  placeholder="Share your experience... (optional)"
                  placeholderTextColor="#9CA3AF"
                  fontSize="$md"
                  fontFamily="SplineSans_400Regular"
                  color="#796D6D"
                  value={feedback}
                  onChangeText={setFeedback}
                />
              </Textarea>
              
              {/* Upload Media Section */}
              <Box
                borderWidth={2}
                borderColor="#E0D8D8"
                borderStyle="dashed"
                borderRadius="$xl"
                p="$8"
                alignItems="center"
                justifyContent="center"
              >
                <VStack alignItems="center" space="md">
                  <Ionicons name="camera-outline" size={48} color="#9CA3AF" />
                  <Text
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#796D6D"
                  >
                    Add photos or videos
                  </Text>
                  <Button
                    backgroundColor="#F8E8E8"
                    borderRadius="$full"
                    px="$6"
                    py="$2.5"
                    onPress={handleUploadMedia}
                    $active-backgroundColor="#F0D8D8"
                  >
                    <ButtonText
                      fontSize="$sm"
                      fontFamily="SplineSans_600SemiBold"
                      color="#E5B2B2"
                    >
                      Upload Media
                    </ButtonText>
                  </Button>
                </VStack>
              </Box>
            </VStack>
          </Box>

          {/* Tip Section */}
          <Box
            backgroundColor="white"
            borderRadius="$2xl"
            p="$6"
            shadowColor="$black"
            shadowOffset={{
              width: 0,
              height: 2,
            }}
            shadowOpacity={0.05}
            shadowRadius={8}
            elevation={3}
          >
            <VStack space="md">
              <Text
                fontSize="$lg"
                fontFamily="SplineSans_600SemiBold"
                color="#3D2C2C"
              >
                Add a Tip
              </Text>
              
              <RadioGroup value={tipAmount} onChange={setTipAmount}>
                <VStack space="sm">
                  <HStack space="sm" flexWrap="wrap">
                    {['0', '10', '15'].map((tip) => (
                      <Radio key={tip} value={tip} flex={1} minWidth="30%">
                        <Box
                          flex={1}
                          borderWidth={1}
                          borderColor={tipAmount === tip ? "#E5B2B2" : "#E0D8D8"}
                          backgroundColor={tipAmount === tip ? "#F8E8E8" : "white"}
                          borderRadius="$full"
                          py="$3"
                          alignItems="center"
                          justifyContent="center"
                        >
                          <RadioIndicator style={{ display: 'none' }}>
                            <RadioIcon />
                          </RadioIndicator>
                          <RadioLabel
                            fontSize="$sm"
                            fontFamily="SplineSans_500Medium"
                            color={tipAmount === tip ? "#E5B2B2" : "#796D6D"}
                          >
                            {tip === '0' ? 'No tip' : `${tip}%`}
                          </RadioLabel>
                        </Box>
                      </Radio>
                    ))}
                  </HStack>
                  
                  <HStack space="sm">
                    <Radio value="20" flex={1}>
                      <Box
                        flex={1}
                        borderWidth={1}
                        borderColor={tipAmount === '20' ? "#E5B2B2" : "#E0D8D8"}
                        backgroundColor={tipAmount === '20' ? "#F8E8E8" : "white"}
                        borderRadius="$full"
                        py="$3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <RadioIndicator style={{ display: 'none' }}>
                          <RadioIcon />
                        </RadioIndicator>
                        <RadioLabel
                          fontSize="$sm"
                          fontFamily="SplineSans_500Medium"
                          color={tipAmount === '20' ? "#E5B2B2" : "#796D6D"}
                        >
                          20%
                        </RadioLabel>
                      </Box>
                    </Radio>
                    
                    <Radio value="other" flex={1}>
                      <Box
                        flex={1}
                        borderWidth={1}
                        borderColor={tipAmount === 'other' ? "#E5B2B2" : "#E0D8D8"}
                        backgroundColor={tipAmount === 'other' ? "#F8E8E8" : "white"}
                        borderRadius="$full"
                        py="$3"
                        alignItems="center"
                        justifyContent="center"
                      >
                        <RadioIndicator style={{ display: 'none' }}>
                          <RadioIcon />
                        </RadioIndicator>
                        <RadioLabel
                          fontSize="$sm"
                          fontFamily="SplineSans_500Medium"
                          color={tipAmount === 'other' ? "#E5B2B2" : "#796D6D"}
                        >
                          Other
                        </RadioLabel>
                      </Box>
                    </Radio>
                  </HStack>
                </VStack>
              </RadioGroup>
              
              {tipAmount === 'other' && (
                <Input
                  borderColor="#E0D8D8"
                  backgroundColor="#FDFBFB"
                  borderRadius="$lg"
                  mt="$2"
                  $focus-borderColor="#E5B2B2"
                >
                  <InputField
                    placeholder="Enter custom tip amount"
                    placeholderTextColor="#9CA3AF"
                    fontSize="$md"
                    fontFamily="SplineSans_400Regular"
                    color="#796D6D"
                    value={customTip}
                    onChangeText={setCustomTip}
                    keyboardType="numeric"
                  />
                </Input>
              )}
            </VStack>
          </Box>
        </VStack>
      </ScrollView>

      {/* Submit Button */}
      <Box
        backgroundColor="white"
        p="$4"
        shadowColor="$black"
        shadowOffset={{
          width: 0,
          height: -2,
        }}
        shadowOpacity={0.05}
        shadowRadius={4}
        elevation={2}
      >
        <Button
          width="$full"
          height="$14"
          borderRadius="$full"
          backgroundColor="#E5B2B2"
          onPress={handleSubmitReview}
          shadowColor="#E5B2B2"
          shadowOffset={{
            width: 0,
            height: 4,
          }}
          shadowOpacity={0.2}
          shadowRadius={8}
          elevation={4}
          $active-backgroundColor="#D69999"
        >
          <ButtonText
            fontSize="$md"
            fontFamily="SplineSans_700Bold"
            color="white"
          >
            Submit Review
          </ButtonText>
        </Button>
      </Box>
    </Box>
  );
}
