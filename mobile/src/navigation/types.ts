export type MainTabParamList = {
  Home: undefined;
  Orders: undefined;
  Messages: undefined;
  Profile: undefined;
};

export type RootStackParamList = {
  Start: undefined;
  Login: undefined;
  Signup: undefined;
  Main: undefined;

  // 搜索
  SearchResults: { query?: string };

  Chat: { contactName?: string; contactImage?: string; orderId?: string; contactId?: string; contactAvatar?: string; contactType?: string };

  OrderDetails: {
    orderId: string;
    service: string;
    therapist: string;
    date: string;
    time: string;
    address: string;
    status: 'Pending' | 'Completed' | 'Cancelled' | 'En Route';
    subtotal: number;
    discount?: number;
    pointsUsed?: number;
    total: number;
  };

  Review: { therapistName: string; therapistImage?: string; serviceName: string; orderId: string };
  InService: { serviceName: string; duration: number; therapistName: string; orderId: string };
  ServiceStartNotification: { therapistName: string; therapistImage?: string; serviceName: string; orderId: string; duration?: number };

  AddressManagement: undefined;
  MyFavorites: undefined;
  Appointments: undefined;
  Coupons: { selectMode?: boolean; orderAmount?: number };
  Points: undefined;
  InvoiceManagement: undefined;
  CustomerService: undefined;
  TherapistProfile: { therapistId: string };
  MassageServiceDetail: { serviceId: number; serviceName?: string };

  Booking: {
    therapistId: string;
    therapistName: string;
    therapistAvatar: string;
    therapistRating: number;
    therapistReviews: number;
    therapistPrice: number;
    serviceName: string;
    serviceId: string;
  };

  OrderConfirmation: {
    service?: string;
    duration?: string;
    price?: number;
    address?: string;
    date?: string;
    time?: string;
    therapist?: string;
    subtotal?: number;
    discount?: number;
    total?: number;
  };

  PaymentCenter: {
    amount?: number;
    orderId?: string;
    orderDetails?: {
      service?: string;
      therapist?: string;
      date?: string;
      time?: string;
      address?: string;
      subtotal?: number;
      discount?: number;
      total?: number;
    };
    showFailedState?: boolean;
  };
};


