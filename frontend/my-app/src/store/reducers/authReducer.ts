import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../services/api";

interface AuthState {
  accessToken: string;
  refreshToken: string;
  isAuthenticated: boolean;
  loading: boolean;
  user: {
    _id: string;
    name: string;
    email: string;
    kycCompleted: boolean;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string;
  } | null;


}


const initialState: AuthState = {
  accessToken: localStorage.getItem('access_token') ?? "",
  refreshToken: localStorage.getItem('refresh_token') ?? "",
  isAuthenticated: Boolean(localStorage.getItem('access_token')),
  loading: true,
  user : null,
};

export const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<{ loading: boolean }>) => {
      state.loading = action.payload.loading;
    },
    setTokens: (
      state,
      action: PayloadAction<{ accessToken: string; refreshToken: string }>
    ) => {
      state.accessToken = action.payload.accessToken;
      state.refreshToken = action.payload.refreshToken;
      state.isAuthenticated = true;
    },
    resetTokens: (state) => {
      state.accessToken = "";
      state.refreshToken = "";
      state.isAuthenticated = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const data = action.payload.data;
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
        state.accessToken = data.accessToken;
        state.refreshToken = data.refreshToken;
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.me.matchFulfilled, (state, action) => {
        state.isAuthenticated = true;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.me.matchRejected, (state) => {
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state) => {
        state.accessToken = '';
        state.refreshToken = '';
        state.isAuthenticated = false;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        state.accessToken = '';
        state.refreshToken = '';
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});



export const { setLoading, setTokens, resetTokens } = authSlice.actions;
export default authSlice.reducer;