import {createSlice, createAsyncThunk} from '@reduxjs/toolkit';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '@utils/api';
import {hideLoader, showLoader} from './loaderSlice';
import {navigate, resetAndNavigate} from '@utils/NavigationUtils';
import {Platform} from 'react-native';

export const loginUser = createAsyncThunk(
  'auth/loginUser',
  async (data: any, thunkAPI) => {
    const {dispatch} = thunkAPI;
    try {
      dispatch(showLoader('Signing in...'));
      const res = await api.post('/auth/login', data);

      // Handle case where user doesn't have a subscription
      if (
        !res.data.status &&
        res.data.status_code === 400 &&
        res.data.user_data
      ) {
        // User exists but no subscription - save user and redirect to Payment
        const userData = res.data.user_data;
        const token = res.data.token;

        await AsyncStorage.setItem('user', JSON.stringify(userData));

        // if (Platform.OS === 'ios') {
        //   resetAndNavigate('Payment', {fromLogin: true});
        // } else {
        resetAndNavigate('Pricing', {fromRegister: true});
        // }

        return {user: userData, token: token};
      }

      if (!res.data.status) {
        return thunkAPI.rejectWithValue(res.data.message);
      }

      await AsyncStorage.setItem('user', JSON.stringify(res.data.user));
      await AsyncStorage.setItem(
        'subscription',
        JSON.stringify(res.data.subscription),
      );
      await AsyncStorage.setItem('token', res.data.token);

      navigate('Drawer');

      return res.data;
    } catch (err: any) {
      return thunkAPI.rejectWithValue(err.message);
    } finally {
      dispatch(hideLoader());
    }
  },
);

export const loadUser = createAsyncThunk('auth/loadUser', async () => {
  const user = await AsyncStorage.getItem('user');
  const token = await AsyncStorage.getItem('token');
  const subscription = await AsyncStorage.getItem('subscription');

  if (user && token) {
    return {
      user: JSON.parse(user),
      token,
      subscription: JSON.parse(subscription),
    };
  }

  return null;
});

const initialState = {
  user: null,
  token: null,
  subscription: null,
  loading: false,
  error: null,
  version: null,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,

  reducers: {
    logout: state => {
      state.user = null;
      state.token = null;

      AsyncStorage.removeItem('user');
      AsyncStorage.removeItem('token');
      AsyncStorage.removeItem('subscription');
    },
    setUser: (state, action) => {
      state.user = action.payload;
    },
    setVersion: (state, action) => {
      state.version = action.payload;
    },
    setSubscription: (state, action) => {
      state.subscription = action.payload;
    },
    updateUser: (state, action) => {
      if (state.user) {
        state.user = {
          ...state.user,
          ...action.payload,
        };
      }
    },
    updateSubscriptionLocally: (state, action) => {
      if (state.subscription) {
        state.subscription = {
          ...state.subscription,
          ...action.payload,
        };
      }
    },
    updateToken: (state, action) => {
      state.token = action.payload;
    },
  },

  extraReducers: builder => {
    builder
      .addCase(loginUser.pending, state => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.subscription = action.payload.subscription;
        state.token = action.payload.token;
      })

      .addCase(loginUser.rejected, (state: any, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loadUser.fulfilled, (state: any, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.subscription = action.payload.subscription;
          state.token = action.payload.token;
        }
      });
  },
});

export const {
  logout,
  updateUser,
  updateToken,
  setUser,
  setVersion,
  setSubscription,
  updateSubscriptionLocally,
} = authSlice.actions;
export default authSlice.reducer;
