
import { type BaseSchema } from "../common/dto/base.dto";

export interface IUser extends BaseSchema {
        name: string;
        email: string;
        isBlocked?: boolean;
        isVerified: boolean;
        isActive: boolean;
        role: "USER" | "ADMIN";
        kyc: {
                completed: Boolean, // same as before
                images: string[],   // new field for storing Cloudinary URLs
                status?: 'pending' | 'verified' | 'rejected', // optional
                reviewedAt?: Date
              },
        password?: string
        refreshToken:string
        profileCompleted?: boolean;
        qualificationAdded?: boolean;
}


export interface IAdmin extends BaseSchema {
        name: string;
        email: string;
        password: string;
}