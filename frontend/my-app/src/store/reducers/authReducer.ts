import type { PayloadAction } from "@reduxjs/toolkit";
import { createSlice } from "@reduxjs/toolkit";
import { authApi } from "../../services/api";
import { jwtDecode } from "jwt-decode";
import type { KYCStatus } from "../../types"; // Adjust path if needed

interface TokenPayload {
  id: string;
  role: "ADMIN" | "USER";
  iat: number;
  exp: number;
}

interface KYC {
  completed: boolean;
  images: Array<{
    url: string;
    uploadedAt: string;
  }>;
  status: KYCStatus;
  reviewedAt?: string;
}

interface AuthState {
  accessToken: string;
  refreshToken: string;
  isAuthenticated: boolean;
  loading: boolean;
  user: {
    id: string;
    role: "ADMIN" | "USER";
    name: string;
    email: string;
    kyc: KYC;
    isActive: boolean;
    isVerified: boolean;
    createdAt: string | null;
  } | null;
}

const initialState: AuthState = {
  accessToken: localStorage.getItem("access_token") ?? "",
  refreshToken: localStorage.getItem("refresh_token") ?? "",
  isAuthenticated: Boolean(localStorage.getItem("access_token")),
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
      const decoded = jwtDecode<TokenPayload>(accessToken);

      state.accessToken = accessToken;
      state.refreshToken = refreshToken;
      state.isAuthenticated = true;
      state.user = {
        id: decoded.id,
        role: decoded.role,
        name: "",
        email: "",
        kyc: {
          completed: false,
          images: [],
          status: "pending" as KYCStatus,
          reviewedAt: undefined,
        },
        isActive: false,
        isVerified: false,
        createdAt: null,
      };

      localStorage.setItem("access_token", accessToken);
      localStorage.setItem("refresh_token", refreshToken);
    },
    resetTokens: (state) => {
      state.accessToken = "";
      state.refreshToken = "";
      state.isAuthenticated = false;
      state.user = null;
      localStorage.removeItem("access_token");
      localStorage.removeItem("refresh_token");
    },
    setUser: (state, action: PayloadAction<AuthState["user"]>) => {
      state.user = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addMatcher(authApi.endpoints.login.matchPending, (state) => {
        state.loading = true;
      })
      .addMatcher(authApi.endpoints.login.matchFulfilled, (state, action) => {
        const { accessToken, refreshToken } = action.payload.data;
        const decoded = jwtDecode<TokenPayload>(accessToken);

        state.accessToken = accessToken;
        state.refreshToken = refreshToken;
        state.isAuthenticated = true;
        state.user = {
          id: decoded.id,
          role: decoded.role,
          name: "",
          email: "",
          kyc: {
            completed: false,
            images: [],
            status: "pending" as KYCStatus,
            reviewedAt: undefined,
          },
          isActive: false,
          isVerified: false,
          createdAt: null,
        };
        state.loading = false;

        localStorage.setItem("access_token", accessToken);
        localStorage.setItem("refresh_token", refreshToken);
      })
      .addMatcher(authApi.endpoints.login.matchRejected, (state) => {
        state.accessToken = "";
        state.refreshToken = "";
        state.isAuthenticated = false;
        state.user = null;
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.me.matchFulfilled, (state, action) => {
        const userData = action.payload.data;
        state.user = {
          id: userData._id,
          role: userData.role,
          name: userData.name,
          email: userData.email,
          kyc: {
            completed: userData.kyc.completed,
            images: userData.kyc.images.map((img: any) => ({
              url: img.url,
              uploadedAt: new Date(img.uploadedAt).toISOString(),
            })),
            status: userData.kyc.status as KYCStatus,
            reviewedAt: userData.kyc.reviewedAt
              ? new Date(userData.kyc.reviewedAt).toISOString()
              : undefined,
          },
          isActive: userData.isActive,
          isVerified: userData.isVerified,
          createdAt: userData.createdAt ? new Date(userData.createdAt).toISOString() : null,
        };
        state.loading = false;
      })
      .addMatcher(authApi.endpoints.me.matchRejected, (state) => {
        state.isAuthenticated = false;
        state.loading = false;
      });
  },
});

export const { setLoading, setTokens, resetTokens, setUser } = authSlice.actions;
export default authSlice.reducer;
