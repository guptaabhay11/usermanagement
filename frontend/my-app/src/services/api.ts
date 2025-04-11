import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";

const baseUrl = "backedn url";

export const authApi = createApi({
  reducerPath: "authApi",
  baseQuery: fetchBaseQuery({
    baseUrl,
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;
      if (token) headers.set("Authorization", `Bearer ${token}`);
      return headers;
    },
  }),
  endpoints: (builder) => ({
    me: builder.query<ApiResponse<User>, void>({
      query: () => `/users/me`,
    }),

    login: builder.mutation<ApiResponse<{ accessToken: string; refreshToken: string }>, { email: string; password: string }>({
      query: (body) => ({ url: `/users/login`, method: "POST", body }),
    }),

    register: builder.mutation<ApiResponse<User>, Omit<User, "_id" | "active" | "role"> & { confirmPassword: string }>({
      query: (body) => ({ url: `/users/register`, method: "POST", body }),
    }),

    inviteUser: builder.mutation<ApiResponse<User>, { email: string }>({
      query: (body) => ({ url: `/users/invite-user`, method: "POST", body }),
    }),

    resendEmail: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({ url: `/users/resend-mail`, method: "POST", body }),
    }),

    getDashboardStats: builder.query<ApiResponse<any>, void>({
      query: () => `/users/dashboard-stats`,
    }),

    getUserById: builder.query<ApiResponse<User>, string>({
      query: (id) => `/users/${id}`,
    }),

    changeBlockStatus: builder.mutation<ApiResponse<User>, { userId: string; blocked: boolean }>({
      query: (body) => ({ url: `/users/set-status`, method: "PUT", body }),
    }),

    refresh: builder.mutation<ApiResponse<{ accessToken: string }>, { refreshToken: string }>({
      query: (body) => ({ url: `/users/refresh`, method: "POST", body }),
    }),

    updateKYCStatus: builder.mutation<ApiResponse<User>, { userId: string; kycStatus: string }>({
      query: ({ userId, ...body }) => ({ url: `/users/update-kyc-status/${userId}`, method: "PUT", body }),
    }),

    setPassword: builder.mutation<ApiResponse<User>, { token: string; password: string; confirmPassword: string }>({
      query: ({ token, ...body }) => ({ url: `/users/set-password/${token}`, method: "POST", body }),
    }),

    forgotPassword: builder.mutation<ApiResponse<{ message: string }>, { email: string }>({
      query: (body) => ({ url: `/users/forgot-password`, method: "POST", body }),
    }),

    updatePassword: builder.mutation<ApiResponse<User>, { token: string; password: string; confirmPassword: string }>({
      query: ({ token, ...body }) => ({ url: `/users/update-password/${token}`, method: "PATCH", body }),
    }),

    logout: builder.mutation<void, void>({
      query: () => ({ url: `/users/logout`, method: "POST" }),
    }),
  }),
});

export const {
  useMeQuery,
  useLoginMutation,
  useRegisterMutation,
  useInviteUserMutation,
  useResendEmailMutation,
  useGetDashboardStatsQuery,
  useGetUserByIdQuery,
  useChangeBlockStatusMutation,
  useRefreshMutation,
  useUpdateKYCStatusMutation,
  useSetPasswordMutation,
  useForgotPasswordMutation,
  useUpdatePasswordMutation,
  useLogoutMutation,
} = authApi;
