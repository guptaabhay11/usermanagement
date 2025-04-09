import bcrypt from 'bcrypt';
import mongoose, { Schema } from "mongoose";
import { type IUser } from "./user.dto";

// Hashing function
const hashPassword = async (password: string) => {
  const hash = await bcrypt.hash(password, 12);
  return hash;
};


const userSchema = new Schema<IUser>({
  name: { type: String, required: true },
  email: { type: String, required: true },
  active: { type: Boolean, default: true },
  blocked: { type: Boolean, default: false },
  role: { type: String, enum: ["USER", "ADMIN"], default: "ADMIN" },
  password: { type: String, required: true, select: false },
}, { timestamps: true });

userSchema.pre("save", async function (next) {
  if (this.password && this.isModified("password")) {
    this.password = await hashPassword(this.password);
  }
  next();
});


const ProfileSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true, unique: true },
  phone: { type: String },
  address: { type: String },
}, { timestamps: true });

const QualificationSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true },
  degree: { type: String, required: true },
  institution: { type: String },
  year: { type: Number }
}, { timestamps: true });

const KYCSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: "user", required: true, unique: true },
  documentType: { type: String, enum: ["AADHAR", "PASSPORT", "DRIVING_LICENSE"] },
  documentNumber: { type: String },

}, { timestamps: true });




export const UserSchema = mongoose.model<IUser>("user", userSchema);
export const ProfileModel = mongoose.model("profile", ProfileSchema);
export const QualificationModel = mongoose.model("qualification", QualificationSchema);
export const KYCModel = mongoose.model("kyc", KYCSchema);
