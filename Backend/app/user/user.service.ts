
import { type IUser } from "./user.dto";
import { UserSchema } from "./user.schema";
export const createUser = async (data: IUser) => {
    const result = await UserSchema.create({ ...data, active: true });
    return result.toObject();
};


export const updateUser = async (id: string, data: IUser) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    return result;
};

export const editUser = async (id: string, data: Partial<IUser>) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data);
    return result;
};

export const deleteUser = async (id: string) => {
    const result = await UserSchema.deleteOne({ _id: id });
    return result;
};

export const getUserById = async (id: string) => {
    const result = await UserSchema.findById(id).lean();
    return result;
};

export const getAllUser = async () => {
    const result = await UserSchema.find({}).lean();
    return result;
};
export const getUserByEmail = async (email: string, withPassword = false) => {
    if (withPassword) {
        const result = await UserSchema.findOne({ email }).select('+password').lean();
        return result;
    }
    const result = await UserSchema.findOne({ email }).lean();
    return result;
}

export const inviteUser = async (data: IUser) => {

    //send a mail to the user, the mail should be come form the admin-invite
    //the email should look like this http://localhost:3000/complete-registration
    const result = await UserSchema.create({ ...data, active: false });
    return result.toObject();
};

export const completeRegistration = async (id: string, data: Partial<IUser>) => {
    const result = await UserSchema.findOneAndUpdate({ _id: id }, data);
    return result;
};

export const getRegisteredUsersByDate = async (date: string) => {
    const result = await UserSchema.find({ createdAt: { $gte: new Date(date) } }).lean();
    return result;
}

export const getActiveSessions = async () => {
    const result = await UserSchema.find({ active: true }).lean();
    return result;
}

export const getPendingOnboarding = async () => {
    const result = await UserSchema.find({ active: false }).lean();
    return result;
}

export const getPendingKYC = async () => {
    const result = await UserSchema.find({ active: false }).lean(); //UserSchema doesn't have kyc
    return result;
}