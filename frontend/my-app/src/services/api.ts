import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import { RootState } from "../store/store";
import {User, ApiResponse} from '../types'


const baseUrl = "http://localhost:5000/api";

export const authApi = createApi({
  reducerPath: "api",
  baseQuery: fetchBaseQuery({
    baseUrl,
    credentials: "include", 

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

    register: builder.mutation<ApiResponse<User>, 
  {
    name: string;
    email: string;
    password: string;
    confirmPassword: string;
  }
>({
  query: (body) => ({
    url: '/users/register',
    method: 'POST',
    body: {
      name: body.name,
      email: body.email,
      password: body.password
      // Don't send confirmPassword to the server
    }
  }),
}),

updateUser: builder.mutation<ApiResponse<User>, { userId: string; [key: string]: any }>({
  query: ({ userId, ...body }) => ({
    url: `/users/update/${userId}`,
    method: "PATCH",
    body,
  }),
}),

    inviteUser: builder.mutation<ApiResponse<User>, { email: string, name: string }>({
      query: (body) => ({ url: `/users/invite-user`, method: "POST", body }),
    }),

    resendEmail: builder.mutation<ApiResponse<null>, { email: string }>({
      query: (body) => ({ url: `/users/resend-mail`, method: "POST", body }),
    }),

    getDashboardStats: builder.query<ApiResponse<any>, void>({
      query: () => `/users/dashboard-stats`,
    }),

    getAllUsers: builder.query<ApiResponse<User[]>, void>({
      query: () => '/users',
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
      query: ({ userId, ...body }) => ({ url: `/users/update-kyc-status/${userId}`, method: "PATCH", body }),
    }),

    setPassword: builder.mutation<ApiResponse<User>, { token: string; password: string; confirmPassword: string }>({
      query: ({ token, ...body }) => ({
        url: `/users/set-password/${token}`,
        method: "POST",
        body
      }),
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
  useUpdateUserMutation,
  useChangeBlockStatusMutation,
  useRefreshMutation,
  useUpdateKYCStatusMutation,
  useSetPasswordMutation,
  useForgotPasswordMutation,
  useUpdatePasswordMutation,
  useLogoutMutation,
  useGetAllUsersQuery,
} = authApi;
