import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import AsyncStorage from "@react-native-async-storage/async-storage";
import api from "@utils/api";
import { hideLoader, showLoader } from "./loaderSlice";
import { resetAndNavigate } from "@utils/NavigationUtils";


export const loginUser = createAsyncThunk(
  "auth/loginUser",
  async (data:any, thunkAPI) => {
    const { dispatch } = thunkAPI;
    try {
       dispatch(showLoader("Signing in..."));
      const res = await api.post("/auth/login", data);

      console.log(res)
      if (!res.data.status) {
        return thunkAPI.rejectWithValue(res.data.message);
      }


      
      await AsyncStorage.setItem("user", JSON.stringify(res.data.user));
      await AsyncStorage.setItem("token", res.data.token);

      resetAndNavigate('Drawer')

      return res.data;
    } catch (err:any) {
      return thunkAPI.rejectWithValue(err.message);
    } finally {
      dispatch(hideLoader());
    }
  }
);


export const loadUser = createAsyncThunk("auth/loadUser", async () => {
  const user = await AsyncStorage.getItem("user");
  const token = await AsyncStorage.getItem("token");

  if (user && token) {
    return { user: JSON.parse(user), token };
  }

  return null;
});


const initialState = {
  user: null,
  token: null,
  loading: false,
  error: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;

      AsyncStorage.removeItem("user");
      AsyncStorage.removeItem("token");
    },
  },

  extraReducers: (builder) => {
    builder
      .addCase(loginUser.pending, (state) => {
        state.loading = true;
        state.error = null;
      })

      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
      })

      .addCase(loginUser.rejected, (state:any, action) => {
        state.loading = false;
        state.error = action.payload;
      })

      .addCase(loadUser.fulfilled, (state:any, action) => {
        if (action.payload) {
          state.user = action.payload.user;
          state.token = action.payload.token;
        }
      });
  },
});

export const { logout } = authSlice.actions;
export default authSlice.reducer;