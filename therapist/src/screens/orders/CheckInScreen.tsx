import React, { useState } from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity, ScrollView, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Snackbar, Portal, Provider as PaperProvider } from 'react-native-paper';
import { MaterialIcons, MaterialCommunityIcons } from '@expo/vector-icons';
import { useNavigation, useRoute } from '@react-navigation/native';

const { width, height } = Dimensions.get('window');

const COLORS = {
  primary: '#135BEC',
  backgroundLight: '#F8F9FC',
  surfaceLight: '#FFFFFF',
  textMain: '#0F172A',
  textSec: '#64748B',
  green: '#22C55E',
};

export default function CheckInScreen() {
  const navigation = useNavigation();
  const route = useRoute();
  const { orderId, type } = (route.params as any) || { orderId: '8493', type: 'arrived' };

  // ✅ Snackbar 状态管理
  const [snackbar, setSnackbar] = useState({
    visible: false,
    message: '',
    type: 'success' as 'success' | 'error' | 'info',
  });

  // ✅ 显示 Snackbar
  const showSnackbar = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    setSnackbar({ visible: true, message, type });
  };

  // ✅ 隐藏 Snackbar
  const hideSnackbar = () => {
    setSnackbar({ ...snackbar, visible: false });
  };

  // Determine current step based on type
  const getStep = () => {
    switch(type) {
      case 'arrived': return 2;
      case 'start': return 3;
      case 'complete': return 4;
      default: return 2;
    }
  };

  const currentStep = getStep();

  const handleAction = () => {
    showSnackbar('操作成功完成！', 'success');
    setTimeout(() => {
      navigation.goBack();
    }, 1500);
  };

  const renderStep = (step: number, icon: any, label: string, isActive: boolean, isCompleted: boolean) => (
    <View style={styles.stepItem}>
      <View style={[
        styles.stepIconContainer, 
        isActive && styles.stepActive,
        isCompleted && styles.stepCompleted
      ]}>
        <MaterialIcons 
          name={icon} 
          size={isCompleted ? 14 : 16} 
          color={isActive ? 'white' : (isCompleted ? '#94A3B8' : '#94A3B8')} 
        />
      </View>
      <Text style={[
        styles.stepLabel, 
        isActive && styles.stepLabelActive
      ]}>{label}</Text>
    </View>
  );

  return (
    <PaperProvider>
      <View style={styles.container}>
        <SafeAreaView style={styles.header} edges={['top']}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <MaterialIcons name="arrow-back" size={24} color={COLORS.textMain} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Order #{orderId}</Text>
          <View style={{ width: 40 }} />
        </SafeAreaView>

      <ScrollView contentContainerStyle={styles.content}>
        {/* Stepper */}
        <View style={styles.stepperContainer}>
            <View style={styles.stepperLine} />
            {renderStep(1, 'directions-car', 'ON WAY', currentStep === 1, currentStep > 1)}
            {renderStep(2, 'location-on', 'ARRIVE', currentStep === 2, currentStep > 2)}
            {renderStep(3, 'spa', 'SERVICE', currentStep === 3, currentStep > 3)}
            {renderStep(4, 'check', 'DONE', currentStep === 4, currentStep > 4)}
        </View>

        {/* Action Card */}
        <View style={styles.actionCard}>
          <View style={styles.mapPreview}>
             <Image 
                source={{ uri: 'https://lh3.googleusercontent.com/aida-public/AB6AXuBmCDTGV3pPUWS4V9KMPcOZ9ffndoTKDolz1Q0R-tpwquTWTLb8CU8rvBuOHd-BUq26kzRAS5Y9gldXSoRrttn_hon-mzPVofqJFeolAZwYokCmhWrq_0zoE_-i5bNBrqVzatQ2dlkE78pejs3ozUsCVGaN4LxR96NH8F_x1Ccaa1APFOKtu2uga457SluFuJ4v2xVKdTV_2oVIkJU8flViSfh7eNXx29lnPj9ddWp7Qlkgu9xz26CS27SCjUecOarWWn5-Z9ViLVs' }} 
                style={styles.mapImage}
             />
             <View style={styles.locationPin}>
                <MaterialIcons name="location-on" size={32} color={COLORS.primary} />
             </View>
          </View>
          
          <View style={styles.cardContent}>
            <Text style={styles.cardTitle}>
              {currentStep === 2 ? 'Arrived at Location?' : 
               currentStep === 3 ? 'Start Service?' : 'Complete Service?'}
            </Text>
            <Text style={styles.cardDesc}>
              {currentStep === 2 ? 'Please confirm you have arrived at the client\'s location.' : 
               currentStep === 3 ? 'Please confirm you are ready to start the service.' : 'Please confirm the service is completed.'}
            </Text>
          </View>
        </View>

        <TouchableOpacity style={styles.mainButton} onPress={handleAction}>
          <Text style={styles.buttonText}>
             {currentStep === 2 ? 'Confirm Arrival' : 
              currentStep === 3 ? 'Start Service' : 'Complete Service'}
          </Text>
        </TouchableOpacity>

      </ScrollView>

      {/* ✅ Snackbar */}
      <Portal>
        <Snackbar
          visible={snackbar.visible}
          onDismiss={hideSnackbar}
          duration={3000}
          style={{
            backgroundColor: 
              snackbar.type === 'success' ? '#22C55E' : 
              snackbar.type === 'error' ? '#EF4444' : 
              '#3B82F6',
          }}
        >
          {snackbar.message}
        </Snackbar>
      </Portal>
    </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.backgroundLight,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: COLORS.surfaceLight,
  },
  backButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: COLORS.textMain,
  },
  content: {
    padding: 24,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 40,
    position: 'relative',
    paddingHorizontal: 12,
  },
  stepperLine: {
    position: 'absolute',
    top: 16, 
    left: 12,
    right: 12,
    height: 2,
    backgroundColor: '#E2E8F0',
    zIndex: -1,
  },
  stepItem: {
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.backgroundLight,
    paddingHorizontal: 4,
  },
  stepIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: COLORS.backgroundLight,
  },
  stepActive: {
    backgroundColor: COLORS.primary,
  },
  stepCompleted: {
    backgroundColor: '#E2E8F0',
  },
  stepLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#94A3B8',
  },
  stepLabelActive: {
    color: COLORS.primary,
  },
  actionCard: {
    backgroundColor: COLORS.surfaceLight,
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 4,
    marginBottom: 32,
  },
  mapPreview: {
    height: 200,
    width: '100%',
    position: 'relative',
  },
  mapImage: {
    width: '100%',
    height: '100%',
  },
  locationPin: {
    position: 'absolute',
    top: '50%',
    left: '50%',
    marginLeft: -16,
    marginTop: -32,
  },
  cardContent: {
    padding: 24,
    alignItems: 'center',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: COLORS.textMain,
    marginBottom: 8,
  },
  cardDesc: {
    fontSize: 14,
    color: COLORS.textSec,
    textAlign: 'center',
    lineHeight: 20,
  },
  mainButton: {
    backgroundColor: COLORS.primary,
    height: 56,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '700',
    color: 'white',
  },
});

