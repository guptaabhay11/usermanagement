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
exports.uploadFile = exports.updateKYCStatus = exports.inviteUser = exports.resendEmailService = exports.getDashboardStats = exports.blockUser = exports.updatePassword = exports.generateRefreshToken = exports.generateAccessToken = exports.getUserByEmail = exports.getAllUser = exports.getUserById = exports.getMe = exports.deleteUser = exports.editUser = exports.updateUser = exports.createUser = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const user_schema_1 = __importDefault(require("./user.schema"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const user_schema_2 = __importDefault(require("./user.schema"));
const cloudinary_1 = require("cloudinary");
const sendEmail_1 = require("../common/helper/sendEmail");
const createUser = (data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.create(Object.assign(Object.assign({}, data), { active: true }));
    return result;
});
exports.createUser = createUser;
const updateUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    console.log("Searching for user with ID:", id);
    const result = yield user_schema_1.default.findOneAndUpdate({ _id: id }, data, {
        new: true,
    });
    return result;
});
exports.updateUser = updateUser;
const editUser = (id, data) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.findOneAndUpdate({ _id: id }, data);
    return result;
});
exports.editUser = editUser;
const deleteUser = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.deleteOne({ _id: id });
    return result;
});
exports.deleteUser = deleteUser;
const getMe = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id; // Assuming you have authentication middleware
        if (!userId) {
            return res.status(401).json({ success: false, message: 'Unauthorized' });
        }
        const role = yield (0, exports.getUserById)(userId); // Assuming this fetches the user role
        res.status(200).json({
            success: true,
            data: { role },
            message: 'Role fetched successfully'
        });
    }
    catch (error) {
        res.status(400).json({
            success: false,
            message: error.message || 'Error fetching user role'
        });
    }
});
exports.getMe = getMe;
const getUserById = (id) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.findById(id);
    console.log(id);
    console.log(result);
    return result;
});
exports.getUserById = getUserById;
const getAllUser = () => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.find({}).lean();
    return result;
});
exports.getAllUser = getAllUser;
const getUserByEmail = (email) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield user_schema_1.default.findOne({ email }).lean();
    return result;
});
exports.getUserByEmail = getUserByEmail;
const generateAccessToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_SECRET, { expiresIn: "15m" });
};
exports.generateAccessToken = generateAccessToken;
const generateRefreshToken = (id, role) => {
    return jsonwebtoken_1.default.sign({ id, role }, process.env.JWT_REFRESH_SECRET, { expiresIn: "7d" });
};
exports.generateRefreshToken = generateRefreshToken;
const updatePassword = (email, newPassword) => __awaiter(void 0, void 0, void 0, function* () {
    const hashedPassword = yield bcrypt_1.default.hash(newPassword, 12);
    const user = yield user_schema_1.default.findOneAndUpdate({ email }, { password: hashedPassword }, { new: true } // Return the updated document
    );
    if (!user) {
        throw new Error("User not found");
    }
    return user;
});
exports.updatePassword = updatePassword;
const blockUser = function (id, isBlocked) {
    return __awaiter(this, void 0, void 0, function* () {
        if (!id) {
            throw new Error("User not found");
        }
        const user = yield user_schema_1.default.findByIdAndUpdate({ _id: id }, { isBlocked: isBlocked }, { new: true, }).select("-password");
        return user;
    });
};
exports.blockUser = blockUser;
const getDashboardStats = (startDate, endDate) => __awaiter(void 0, void 0, void 0, function* () {
    const start = new Date(startDate);
    const end = new Date(endDate);
    // Users registered within the date range
    const registeredUsers = yield user_schema_1.default.find({
        createdAt: { $gte: start, $lte: end },
    });
    // Active sessions
    const activeSessions = yield user_schema_2.default.countDocuments({ isActive: true });
    //Pending onboarding
    const pendingOnboarding = yield user_schema_1.default.countDocuments({ onboardingStatus: "pending" });
    // Pending KYC
    const pendingKYC = yield user_schema_1.default.countDocuments({ kycCompleted: false });
    return {
        registeredUserCount: registeredUsers.length,
        registeredUsers, // Optional: Include user data
        activeSessionCount: activeSessions,
        pendingOnboardingCount: pendingOnboarding,
        pendingKYCCount: pendingKYC,
    };
});
exports.getDashboardStats = getDashboardStats;
const resendEmailService = (email, subject, emailBody) => __awaiter(void 0, void 0, void 0, function* () {
    if (!email) {
        throw new Error("Email address is required");
    }
    // Find the user
    const user = yield user_schema_1.default.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    try {
        // Send the email
        const mailSent = yield (0, sendEmail_1.sendEmail)({
            email: email,
            url: ``,
            sub: subject,
            html: emailBody
        });
        return { success: true, message: "Email sent successfully" };
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
});
exports.resendEmailService = resendEmailService;
const inviteUser = (email, subject, emailBody) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findOne({ email });
    if (user) {
        throw new Error("User already exist!");
    }
    try {
        // Send the email
        const mailSent = yield (0, sendEmail_1.sendEmail)({
            email: email,
            url: ``,
            sub: subject,
            html: emailBody
        });
        console.log("sent mail", mailSent);
        return { success: true, message: "Email sent successfully" };
    }
    catch (error) {
        console.error("Error sending email:", error);
        throw new Error("Failed to send email");
    }
});
exports.inviteUser = inviteUser;
const updateKYCStatus = (id, updateData) => __awaiter(void 0, void 0, void 0, function* () {
    const user = yield user_schema_1.default.findByIdAndUpdate(id, updateData, { new: true }).select("-password");
    console.log(id);
    return user;
});
exports.updateKYCStatus = updateKYCStatus;
const uploadFile = (fileBuffer, userId) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise((resolve, reject) => {
        const uploadStream = cloudinary_1.v2.uploader.upload_stream({
            resource_type: 'image',
            folder: `usermanagement/${userId || 'temp'}`,
        }, (error, result) => {
            if (error) {
                console.error('Cloudinary upload error:', error);
                reject(error);
            }
            else if (!result) {
                reject(new Error('Cloudinary upload returned no result'));
            }
            else {
                resolve(result.secure_url);
            }
        });
        uploadStream.end(fileBuffer);
    });
});
exports.uploadFile = uploadFile;
