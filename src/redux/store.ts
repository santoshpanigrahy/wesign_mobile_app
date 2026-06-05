import {configureStore} from '@reduxjs/toolkit';
import authReducer from '@slices/authSlice';
import envelopeReducer from '@slices/envelopeSlice';
import loaderReducer from '@slices/loaderSlice';
import paymentReducer from '@slices/paymentSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    envelope: envelopeReducer,
    loader: loaderReducer,
    payment: paymentReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
