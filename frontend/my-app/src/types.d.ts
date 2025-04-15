declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  isBlocked: boolean;
  isVerified: boolean;
  kyc: {
    completed: boolean;
    images: Array<{
      url: string;
      uploadedAt: Date;
    }>;
    status: 'pending' | 'verified' | 'rejected';
    reviewedAt?: Date;
  };
  isActive: boolean;
  role: "USER" | "ADMIN";
  refreshToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export type KYCStatus = "pending" | "verified" | "rejected"

export interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;
}