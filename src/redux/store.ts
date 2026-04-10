import { configureStore } from "@reduxjs/toolkit";
import authReducer from "@slices/authSlice";
import envelopeReducer from "@slices/envelopeSlice";
import loaderReducer from "@slices/loaderSlice";

export const store = configureStore({
  reducer: {
    auth: authReducer,
    envelope: envelopeReducer,
    loader:loaderReducer,
  },
});