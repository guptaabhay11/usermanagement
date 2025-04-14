
import { type BaseSchema } from "../common/dto/base.dto";

export interface IUser extends BaseSchema {
        name: string;
        email: string;
        isBlocked?: boolean;
        isVerified: boolean;
        isActive: boolean;
        role: "USER" | "ADMIN";
        kycCompleted?: boolean
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