"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const Schema = mongoose_1.default.Schema;
const hashPassword = (password) => __awaiter(void 0, void 0, void 0, function* () {
    const hash = yield bcrypt_1.default.hash(password, 12);
    return hash;
});
const UserSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String },
    isBlocked: { type: Boolean, default: false },
    isVerified: { type: Boolean, default: false },
    kycCompleted: { type: Boolean, default: false },
    isActive: { type: Boolean, default: false },
    role: { type: String, enum: ["USER", "ADMIN"], default: "USER" },
    refreshToken: { type: String, default: "" },
}, { timestamps: true });
const AdminSchema = new Schema({
    email: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    password: { type: String, required: true }
});
// Pre-save middleware to hash the password if it is set or modified
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        if (this.isModified("password") && this.password) {
            this.password = yield hashPassword(this.password);
        }
        next();
    });
});
exports.default = mongoose_1.default.model("User", UserSchema);
exports.Admin = mongoose_1.default.model("Admin", AdminSchema);
