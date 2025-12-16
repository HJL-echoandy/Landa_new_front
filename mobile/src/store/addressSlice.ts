import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface Address {
  id: string;
  label: string; // Home, Work, etc.
  street: string;
  building: string;
  city: string;
  province: string;
  postalCode: string;
  contactPerson: string;
  phoneNumber: string;
  isDefault: boolean;
  latitude?: number;
  longitude?: number;
}

export interface AddressState {
  addresses: Address[];
  selectedAddressId: string | null;
  isLoading: boolean;
  error: string | null;
}

const initialState: AddressState = {
  addresses: [],
  selectedAddressId: null,
  isLoading: false,
  error: null,
};

const addressSlice = createSlice({
  name: 'address',
  initialState,
  reducers: {
    setAddressLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
    },
    setAddresses(state, action: PayloadAction<Address[]>) {
      state.addresses = action.payload;
      state.isLoading = false;
      state.error = null;
      // Auto-select default address
      const defaultAddr = action.payload.find((a) => a.isDefault);
      if (defaultAddr) {
        state.selectedAddressId = defaultAddr.id;
      } else if (action.payload.length > 0) {
        state.selectedAddressId = action.payload[0].id;
      }
    },
    addAddress(state, action: PayloadAction<Address>) {
      // If new address is default, unset other defaults
      if (action.payload.isDefault) {
        state.addresses.forEach((a) => {
          a.isDefault = false;
        });
      }
      state.addresses.push(action.payload);
      if (action.payload.isDefault || state.addresses.length === 1) {
        state.selectedAddressId = action.payload.id;
      }
    },
    updateAddress(state, action: PayloadAction<Address>) {
      const index = state.addresses.findIndex((a) => a.id === action.payload.id);
      if (index !== -1) {
        // If updated address is default, unset other defaults
        if (action.payload.isDefault) {
          state.addresses.forEach((a) => {
            a.isDefault = false;
          });
        }
        state.addresses[index] = action.payload;
      }
    },
    deleteAddress(state, action: PayloadAction<string>) {
      state.addresses = state.addresses.filter((a) => a.id !== action.payload);
      if (state.selectedAddressId === action.payload) {
        const defaultAddr = state.addresses.find((a) => a.isDefault);
        state.selectedAddressId = defaultAddr?.id || state.addresses[0]?.id || null;
      }
    },
    selectAddress(state, action: PayloadAction<string>) {
      state.selectedAddressId = action.payload;
    },
    setAddressError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },
    clearAddresses(state) {
      state.addresses = [];
      state.selectedAddressId = null;
      state.isLoading = false;
      state.error = null;
    },
  },
});

export const {
  setAddressLoading,
  setAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  selectAddress,
  setAddressError,
  clearAddresses,
} = addressSlice.actions;
export default addressSlice.reducer;

