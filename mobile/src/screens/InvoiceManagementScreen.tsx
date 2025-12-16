import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, TextInput, Alert, Modal } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Box, Text, VStack, HStack, Heading, Button, ButtonText } from '@gluestack-ui/themed';
import { Ionicons } from '@expo/vector-icons';
import { useFonts, Manrope_400Regular, Manrope_500Medium, Manrope_600SemiBold, Manrope_700Bold } from '@expo-google-fonts/manrope';
import { useAppNavigation } from '../navigation/hooks';

// Mock 发票数据
const mockInvoices = [
  {
    id: '1',
    orderId: 'ORD-001',
    invoiceNo: 'INV-2024121501',
    amount: 120,
    status: 'issued',
    type: 'personal',
    title: 'Individual',
    date: 'Dec 15, 2024',
    service: 'Deep Tissue Massage',
    email: 'sophia@email.com',
  },
  {
    id: '2',
    orderId: 'ORD-002',
    invoiceNo: 'INV-2024121002',
    amount: 150,
    status: 'pending',
    type: 'company',
    title: 'Acme Corporation',
    date: 'Dec 10, 2024',
    service: 'Swedish Massage',
    email: 'billing@acme.com',
    taxId: '12-3456789',
  },
  {
    id: '3',
    orderId: 'ORD-003',
    invoiceNo: null,
    amount: 90,
    status: 'not_requested',
    type: null,
    title: null,
    date: 'Dec 5, 2024',
    service: 'Relaxation Massage',
    email: null,
  },
];

type TabType = 'all' | 'issued' | 'pending';
type InvoiceType = 'personal' | 'company';

export default function InvoiceManagementScreen() {
  const navigation = useAppNavigation();
  const [activeTab, setActiveTab] = useState<TabType>('all');
  const [showRequestModal, setShowRequestModal] = useState(false);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // 发票申请表单
  const [invoiceType, setInvoiceType] = useState<InvoiceType>('personal');
  const [companyName, setCompanyName] = useState('');
  const [taxId, setTaxId] = useState('');
  const [email, setEmail] = useState('');

  const [fontsLoaded] = useFonts({
    Manrope_400Regular,
    Manrope_500Medium,
    Manrope_600SemiBold,
    Manrope_700Bold,
  });

  if (!fontsLoaded) return null;

  const filteredInvoices = activeTab === 'all' 
    ? mockInvoices
    : mockInvoices.filter(inv => {
        if (activeTab === 'issued') return inv.status === 'issued';
        if (activeTab === 'pending') return inv.status === 'pending' || inv.status === 'not_requested';
        return true;
      });

  const handleRequestInvoice = (orderId: string) => {
    setSelectedOrderId(orderId);
    setShowRequestModal(true);
  };

  const handleSubmitRequest = () => {
    if (!email.trim()) {
      Alert.alert('Error', 'Please enter an email address');
      return;
    }
    if (invoiceType === 'company' && (!companyName.trim() || !taxId.trim())) {
      Alert.alert('Error', 'Please enter company name and tax ID');
      return;
    }
    
    // TODO: 调用 API 提交发票申请
    Alert.alert('Success', 'Invoice request submitted! You will receive it via email within 24 hours.');
    setShowRequestModal(false);
    resetForm();
  };

  const resetForm = () => {
    setInvoiceType('personal');
    setCompanyName('');
    setTaxId('');
    setEmail('');
    setSelectedOrderId(null);
  };

  const handleViewInvoice = (invoice: typeof mockInvoices[0]) => {
    if (invoice.status === 'issued') {
      // TODO: 打开发票 PDF 或详情页
      Alert.alert('View Invoice', `Opening invoice ${invoice.invoiceNo}...`);
    }
  };

  const handleDownloadInvoice = (invoice: typeof mockInvoices[0]) => {
    // TODO: 下载发票 PDF
    Alert.alert('Download', `Downloading invoice ${invoice.invoiceNo}...`);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'issued':
        return '#10b981';
      case 'pending':
        return '#f59e0b';
      case 'not_requested':
        return '#6b7280';
      default:
        return '#6b7280';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'issued':
        return 'Issued';
      case 'pending':
        return 'Processing';
      case 'not_requested':
        return 'Not Requested';
      default:
        return status;
    }
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#f8f6f6' }}>
      {/* Header */}
      <Box px="$4" py="$3" backgroundColor="#f8f6f6">
        <HStack alignItems="center" justifyContent="space-between">
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Box p="$2">
              <Ionicons name="arrow-back" size={24} color="#211115" />
            </Box>
          </TouchableOpacity>
          <Heading size="lg" style={{ fontFamily: 'Manrope_700Bold', color: '#211115' }}>
            Invoice Management
          </Heading>
          <Box width={40} />
        </HStack>
      </Box>

      {/* Tabs */}
      <Box px="$4" py="$2">
        <HStack space="sm">
          {(['all', 'issued', 'pending'] as TabType[]).map(tab => (
            <TouchableOpacity
              key={tab}
              onPress={() => setActiveTab(tab)}
              style={{
                flex: 1,
                paddingVertical: 10,
                borderRadius: 8,
                backgroundColor: activeTab === tab ? '#10b981' : 'rgba(16, 185, 129, 0.1)',
                alignItems: 'center',
              }}
            >
              <Text
                style={{
                  fontFamily: activeTab === tab ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                  fontSize: 14,
                  color: activeTab === tab ? 'white' : '#10b981',
                }}
              >
                {tab === 'all' ? 'All' : tab === 'issued' ? 'Issued' : 'Pending'}
              </Text>
            </TouchableOpacity>
          ))}
        </HStack>
      </Box>

      {/* Invoice List */}
      <ScrollView showsVerticalScrollIndicator={false}>
        <Box px="$4" pb="$20">
          {filteredInvoices.length > 0 ? (
            <VStack space="md" mt="$4">
              {filteredInvoices.map(invoice => (
                <Box
                  key={invoice.id}
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
                  {/* Header */}
                  <HStack justifyContent="space-between" alignItems="flex-start" mb="$3">
                    <VStack>
                      <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16, color: '#211115' }}>
                        {invoice.service}
                      </Text>
                      <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(33, 17, 21, 0.5)' }}>
                        Order #{invoice.orderId} · {invoice.date}
                      </Text>
                    </VStack>
                    <Box
                      backgroundColor={`${getStatusColor(invoice.status)}15`}
                      borderRadius={12}
                      px="$2"
                      py="$1"
                    >
                      <Text
                        style={{
                          fontFamily: 'Manrope_500Medium',
                          fontSize: 12,
                          color: getStatusColor(invoice.status),
                        }}
                      >
                        {getStatusLabel(invoice.status)}
                      </Text>
                    </Box>
                  </HStack>

                  {/* Amount */}
                  <HStack justifyContent="space-between" alignItems="center" mb="$3">
                    <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)' }}>
                      Amount
                    </Text>
                    <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 20, color: '#211115' }}>
                      ${invoice.amount}
                    </Text>
                  </HStack>

                  {/* Invoice Info (if issued) */}
                  {invoice.status === 'issued' && (
                    <Box backgroundColor="rgba(16, 185, 129, 0.05)" borderRadius={8} p="$3" mb="$3">
                      <HStack justifyContent="space-between" mb="$1">
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(33, 17, 21, 0.5)' }}>
                          Invoice No.
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12, color: '#211115' }}>
                          {invoice.invoiceNo}
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between" mb="$1">
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(33, 17, 21, 0.5)' }}>
                          Title
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12, color: '#211115' }}>
                          {invoice.title}
                        </Text>
                      </HStack>
                      <HStack justifyContent="space-between">
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 12, color: 'rgba(33, 17, 21, 0.5)' }}>
                          Sent to
                        </Text>
                        <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 12, color: '#211115' }}>
                          {invoice.email}
                        </Text>
                      </HStack>
                    </Box>
                  )}

                  {/* Actions */}
                  <HStack space="sm">
                    {invoice.status === 'not_requested' && (
                      <TouchableOpacity 
                        style={{ flex: 1 }} 
                        onPress={() => handleRequestInvoice(invoice.orderId)}
                      >
                        <Box
                          backgroundColor="#10b981"
                          borderRadius={8}
                          py="$2"
                          alignItems="center"
                        >
                          <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: 'white' }}>
                            Request Invoice
                          </Text>
                        </Box>
                      </TouchableOpacity>
                    )}
                    {invoice.status === 'issued' && (
                      <>
                        <TouchableOpacity 
                          style={{ flex: 1 }} 
                          onPress={() => handleViewInvoice(invoice)}
                        >
                          <Box
                            backgroundColor="rgba(16, 185, 129, 0.1)"
                            borderRadius={8}
                            py="$2"
                            alignItems="center"
                          >
                            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: '#10b981' }}>
                              View
                            </Text>
                          </Box>
                        </TouchableOpacity>
                        <TouchableOpacity 
                          style={{ flex: 1 }} 
                          onPress={() => handleDownloadInvoice(invoice)}
                        >
                          <Box
                            backgroundColor="#10b981"
                            borderRadius={8}
                            py="$2"
                            alignItems="center"
                            flexDirection="row"
                            justifyContent="center"
                          >
                            <Ionicons name="download-outline" size={16} color="white" />
                            <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 14, color: 'white', marginLeft: 4 }}>
                              Download
                            </Text>
                          </Box>
                        </TouchableOpacity>
                      </>
                    )}
                    {invoice.status === 'pending' && (
                      <Box flex={1} py="$2" alignItems="center">
                        <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: '#f59e0b' }}>
                          Processing... Usually takes 24 hours
                        </Text>
                      </Box>
                    )}
                  </HStack>
                </Box>
              ))}
            </VStack>
          ) : (
            <Box alignItems="center" py="$12">
              <Box
                backgroundColor="rgba(16, 185, 129, 0.1)"
                borderRadius={40}
                width={80}
                height={80}
                alignItems="center"
                justifyContent="center"
                mb="$4"
              >
                <Ionicons name="receipt-outline" size={40} color="rgba(16, 185, 129, 0.5)" />
              </Box>
              <Text style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 18, color: '#211115', marginBottom: 8 }}>
                No invoices found
              </Text>
              <Text style={{ fontFamily: 'Manrope_400Regular', fontSize: 14, color: 'rgba(33, 17, 21, 0.6)', textAlign: 'center' }}>
                Your invoices will appear here
              </Text>
            </Box>
          )}
        </Box>
      </ScrollView>

      {/* Request Invoice Modal */}
      <Modal
        visible={showRequestModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowRequestModal(false)}
      >
        <Box flex={1} backgroundColor="rgba(0,0,0,0.5)" justifyContent="flex-end">
          <Box backgroundColor="white" borderTopLeftRadius={24} borderTopRightRadius={24} p="$6">
            <HStack justifyContent="space-between" alignItems="center" mb="$6">
              <Text style={{ fontFamily: 'Manrope_700Bold', fontSize: 20, color: '#211115' }}>
                Request Invoice
              </Text>
              <TouchableOpacity onPress={() => { setShowRequestModal(false); resetForm(); }}>
                <Ionicons name="close" size={24} color="#211115" />
              </TouchableOpacity>
            </HStack>

            {/* Invoice Type */}
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#211115', marginBottom: 8 }}>
              Invoice Type
            </Text>
            <HStack space="sm" mb="$4">
              {(['personal', 'company'] as InvoiceType[]).map(type => (
                <TouchableOpacity
                  key={type}
                  style={{ flex: 1 }}
                  onPress={() => setInvoiceType(type)}
                >
                  <Box
                    backgroundColor={invoiceType === type ? 'rgba(16, 185, 129, 0.1)' : 'white'}
                    borderWidth={1}
                    borderColor={invoiceType === type ? '#10b981' : '#e3e8ee'}
                    borderRadius={8}
                    py="$3"
                    alignItems="center"
                  >
                    <Ionicons 
                      name={type === 'personal' ? 'person-outline' : 'business-outline'} 
                      size={20} 
                      color={invoiceType === type ? '#10b981' : '#6b7280'} 
                    />
                    <Text
                      style={{
                        fontFamily: invoiceType === type ? 'Manrope_600SemiBold' : 'Manrope_400Regular',
                        fontSize: 14,
                        color: invoiceType === type ? '#10b981' : '#6b7280',
                        marginTop: 4,
                      }}
                    >
                      {type === 'personal' ? 'Personal' : 'Company'}
                    </Text>
                  </Box>
                </TouchableOpacity>
              ))}
            </HStack>

            {/* Company Fields */}
            {invoiceType === 'company' && (
              <>
                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#211115', marginBottom: 8 }}>
                  Company Name *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: '#f8f6f6',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontFamily: 'Manrope_400Regular',
                    fontSize: 14,
                    color: '#211115',
                    marginBottom: 16,
                  }}
                  placeholder="Enter company name"
                  placeholderTextColor="rgba(33, 17, 21, 0.4)"
                  value={companyName}
                  onChangeText={setCompanyName}
                />

                <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#211115', marginBottom: 8 }}>
                  Tax ID *
                </Text>
                <TextInput
                  style={{
                    backgroundColor: '#f8f6f6',
                    borderRadius: 8,
                    paddingHorizontal: 12,
                    paddingVertical: 12,
                    fontFamily: 'Manrope_400Regular',
                    fontSize: 14,
                    color: '#211115',
                    marginBottom: 16,
                  }}
                  placeholder="Enter tax ID"
                  placeholderTextColor="rgba(33, 17, 21, 0.4)"
                  value={taxId}
                  onChangeText={setTaxId}
                />
              </>
            )}

            {/* Email */}
            <Text style={{ fontFamily: 'Manrope_500Medium', fontSize: 14, color: '#211115', marginBottom: 8 }}>
              Email Address *
            </Text>
            <TextInput
              style={{
                backgroundColor: '#f8f6f6',
                borderRadius: 8,
                paddingHorizontal: 12,
                paddingVertical: 12,
                fontFamily: 'Manrope_400Regular',
                fontSize: 14,
                color: '#211115',
                marginBottom: 24,
              }}
              placeholder="Enter email to receive invoice"
              placeholderTextColor="rgba(33, 17, 21, 0.4)"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
            />

            {/* Submit Button */}
            <Button
              size="lg"
              onPress={handleSubmitRequest}
              style={{
                backgroundColor: '#10b981',
                borderRadius: 12,
                height: 52,
              }}
            >
              <ButtonText style={{ fontFamily: 'Manrope_600SemiBold', fontSize: 16 }}>
                Submit Request
              </ButtonText>
            </Button>
          </Box>
        </Box>
      </Modal>
    </SafeAreaView>
  );
}

