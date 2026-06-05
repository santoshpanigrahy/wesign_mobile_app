import {createSlice, PayloadAction} from '@reduxjs/toolkit';
import {SubscriptionStatus} from '../../types/subscription';

interface PaymentState {
  isSubscribed: boolean;
  currentSubscription: any | null;
  purchaseLoading: boolean;
  subscriptionHistory: any[];
  activePlanSku: string | null;
  subscriptionStatus: SubscriptionStatus | null;
  subscriptionExpiryDate: string | null;
  renewalDate: string | null;
  pendingPlanChange: {
    newSku: string;
    effectiveDate: string;
    isUpgrade: boolean;
  } | null;
  lastSyncTime: string | null;
}

const initialState: PaymentState = {
  isSubscribed: false,
  currentSubscription: null,
  purchaseLoading: false,
  subscriptionHistory: [],
  activePlanSku: null,
  subscriptionStatus: null,
  subscriptionExpiryDate: null,
  renewalDate: null,
  pendingPlanChange: null,
  lastSyncTime: null,
};

const paymentSlice = createSlice({
  name: 'payment',
  initialState,
  reducers: {
    setSubscriptionStatus: (state, action: PayloadAction<boolean>) => {
      state.isSubscribed = action.payload;
    },
    setCurrentSubscription: (state, action: PayloadAction<any>) => {
      state.currentSubscription = action.payload;
      // Add to history if not already present
      if (
        action.payload &&
        !state.subscriptionHistory.find(
          sub => sub.transactionId === action.payload.transactionId,
        )
      ) {
        state.subscriptionHistory.push(action.payload);
      }
    },
    setPurchaseLoading: (state, action: PayloadAction<boolean>) => {
      state.purchaseLoading = action.payload;
    },
    setActivePlanSku: (state, action: PayloadAction<string | null>) => {
      state.activePlanSku = action.payload;
    },
    setSubscriptionStatusEnum: (
      state,
      action: PayloadAction<SubscriptionStatus | null>,
    ) => {
      state.subscriptionStatus = action.payload;
    },
    setSubscriptionDates: (
      state,
      action: PayloadAction<{
        expiryDate: string | null;
        renewalDate: string | null;
      }>,
    ) => {
      state.subscriptionExpiryDate = action.payload.expiryDate;
      state.renewalDate = action.payload.renewalDate;
    },
    setPendingPlanChange: (
      state,
      action: PayloadAction<{
        newSku: string;
        effectiveDate: string;
        isUpgrade: boolean;
      } | null>,
    ) => {
      state.pendingPlanChange = action.payload;
    },
    setLastSyncTime: (state, action: PayloadAction<string>) => {
      state.lastSyncTime = action.payload;
    },
    clearSubscription: state => {
      state.isSubscribed = false;
      state.currentSubscription = null;
      state.activePlanSku = null;
      state.subscriptionStatus = null;
      state.subscriptionExpiryDate = null;
      state.renewalDate = null;
      state.pendingPlanChange = null;
    },
    resetPaymentState: () => initialState,
  },
});

export const {
  setSubscriptionStatus,
  setCurrentSubscription,
  setPurchaseLoading,
  setActivePlanSku,
  setSubscriptionStatusEnum,
  setSubscriptionDates,
  setPendingPlanChange,
  setLastSyncTime,
  clearSubscription,
  resetPaymentState,
} = paymentSlice.actions;

export default paymentSlice.reducer;
