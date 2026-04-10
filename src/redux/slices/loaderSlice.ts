import { createSlice } from '@reduxjs/toolkit';

const loaderSlice = createSlice({
  name: 'loader',
  initialState: {
    loading: false,
    text: '',
  },
  reducers: {
    showLoader: (state, action) => {
      state.loading = true;
      state.text = action.payload || '';
    },
    hideLoader: (state) => {
      state.loading = false;
      state.text = '';
    },
  },
});

export const { showLoader, hideLoader } = loaderSlice.actions;
export default loaderSlice.reducer;