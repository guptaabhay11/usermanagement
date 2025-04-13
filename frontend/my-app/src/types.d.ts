declare module "*.svg" {
  import React = require("react");
  export const ReactComponent: React.FC<React.SVGProps<SVGSVGElement>>;
  const src: string;
  export default src;
}

interface User {
  _id: string;
  name: string;
  email: string;
  password?: string;
  isBlocked: boolean;
  isVerified: boolean;
  kycCompleted: boolean;
  isActive: boolean;
  role: "USER" | "ADMIN";
  refreshToken: string;
  createdAt?: Date;
  updatedAt?: Date;
}

interface ApiResponse<T> {
  data: T;
  message: string;
  success: boolean;  // Fixed typo from "sucess" to "success"
}