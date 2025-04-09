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
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPendingKYC = exports.getPendingOnboarding = exports.getActiveSessions = exports.getRegisteredUsersByDate = exports.completeRegistration = exports.inviteUser = exports.getUserByEmail = exports.getAllUser = exports.getUserById = exports.deleteUser = exports.editUser = exports.updateUser = exports.createUser = void 0;
const user_schema_1 = require("./user.schema");
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.create(Object.assign(Object.assign({}, data), { active: true }));
    return result.toObject();
});
exports.createUser = createUser;
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    return result;
});
exports.updateUser = updateUser;
const editUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.findOneAndUpdate({ _id: id }, data);
    return result;
});
exports.editUser = editUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.deleteOne({ _id: id });
    return result;
});
exports.deleteUser = deleteUser;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.findById(id).lean();
    return result;
});
exports.getUserById = getUserById;
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.find({}).lean();
    return result;
});
exports.getAllUser = getAllUser;
const getUserByEmail = (email_1, ...args_1) => __awaiter(void 0, [email_1, ...args_1], void 0, function* (email, withPassword = false) {
    if (withPassword) {
        const result = yield user_schema_1.UserSchema.findOne({ email }).select('+password').lean();
        return result;
    }
    const result = yield user_schema_1.UserSchema.findOne({ email }).lean();
    return result;
});
exports.getUserByEmail = getUserByEmail;
const inviteUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    //send a mail to the user, the mail should be come form the admin-invite
    //the email should look like this http://localhost:3000/complete-registration
    const result = yield user_schema_1.UserSchema.create(Object.assign(Object.assign({}, data), { active: false }));
    return result.toObject();
});
exports.inviteUser = inviteUser;
const completeRegistration = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.findOneAndUpdate({ _id: id }, data);
    return result;
});
exports.completeRegistration = completeRegistration;
const getRegisteredUsersByDate = (date) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.find({ createdAt: { $gte: new Date(date) } }).lean();
    return result;
});
exports.getRegisteredUsersByDate = getRegisteredUsersByDate;
const getActiveSessions = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.find({ active: true }).lean();
    return result;
});
exports.getActiveSessions = getActiveSessions;
const getPendingOnboarding = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.find({ active: false }).lean();
    return result;
});
exports.getPendingOnboarding = getPendingOnboarding;
const getPendingKYC = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.UserSchema.find({ active: false }).lean(); //UserSchema doesn't have kyc
    return result;
});
exports.getPendingKYC = getPendingKYC;
