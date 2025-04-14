import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../services/api";
import { jwtDecode } from "jwt-decode";

interface TokenPayload {
  id: string;  // Matches your JWT token
  role: string;
  iat: number;
  exp: number;
}

interface AuthState {
  accessToken: string;
  refreshToken: string;
  isAuthenticated: boolean;
  loading: boolean;
  user: {
    id: string;  // Changed from _id to id
    role: string;
    name: string;
    email: string;
    kycCompleted: boolean;
    isActive: boolean;
    isVerified: boolean;
    createdAt: Date | null;
  } | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem('access_token') ?? "",
  refreshToken: localStorage.getItem('refresh_token') ?? "",
  isAuthenticated: Boolean(localStorage.getItem('access_token')),
  loading: true,
  user: null,
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
      const { accessToken, refreshToken } = action.payload;
      
      // Decode token to get user info
      const decoded = jwtDecode<TokenPayload>(accessToken);
      
      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.user = {
        id: decoded.id,  // Using id instead of _id
        role: decoded.role,
        name: '',       // These will be populated by me endpoint
        email: '',
        kycCompleted: false,
        isActive: true,
        isVerified: false,
        createdAt: new Date()
      };
      
      localStorage.setItem('access_token', accessToken);
      localStorage.setItem('refresh_token', refreshToken);
    },
    resetTokens: (state) => {
      state.accessToken = "";
      state.refreshToken = "";
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
    },
    setUser: (state, action: PayloadAction<AuthState['user']>) => {
      state.user = action.payload;
    }
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const data = action.payload.data;
        const decoded = jwtDecode<TokenPayload>(data.accessToken);
        
        state.accessToken = data.accessToken;
        state.refreshToken = data.refreshToken;
        state.isAuthenticated = true;
        state.user = {
          id: decoded.id,
          role: decoded.role,
          name: '',
          email: '',
          kycCompleted: false,
          isActive: true,
          isVerified: false,
          createdAt: new Date()
        };
        state.loading = false;
        
        localStorage.setItem('access_token', data.accessToken);
        localStorage.setItem('refresh_token', data.refreshToken);
      })
      .addMatcher(authApi.endpoints.me.matchFulfilled, (state, action) => {
        const userData = action.payload.data;
        state.user = {
          id: userData._id,  // Handle both _id and id
          role: userData.role,
          name: userData.name,
          email: userData.email,
          kycCompleted: userData.kycCompleted,
          isActive: userData.isActive,
          isVerified: userData.isVerified,
          createdAt: userData.createdAt ?? new Date()
        };
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
        state.user = null;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.logout.matchFulfilled, (state) => {
        state.accessToken = '';
        state.refreshToken = '';
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      });
  },
});

export const { setLoading, setTokens, resetTokens, setUser } = authSlice.actions;
export default authSlice.reducer;