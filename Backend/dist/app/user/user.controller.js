"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
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
exports.logout = exports.saveKycDocs = exports.updateKYCStatus = exports.updatePassword = exports.forgotPassword = exports.resendEmail = exports.getDashboardStats = exports.changeBlockStatus = exports.setPassword = exports.refresh = exports.getAllUser = exports.getMe = exports.getUserById = exports.deleteUser = exports.editUser = exports.updateUserController = exports.refreshToken = exports.loginUser = exports.createUser = void 0;
const user_schema_1 = __importDefault(require("./user.schema"));
const userService = __importStar(require("./user.service"));
const response_helper_1 = require("../common/helper/response.helper");
const express_async_handler_1 = __importDefault(require("express-async-handler"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const sendEmail_1 = require("../common/helper/sendEmail");
const user_schema_2 = __importDefault(require("./user.schema"));
exports.createUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    const existingUser = yield userService.getUserByEmail(email);
    if (existingUser) {
        res.status(409).send((0, response_helper_1.createResponse)(null, "User already exists"));
    }
    const result = yield userService.createUser(req.body);
    const token = jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: "60m" });
    const fullUrl = `http://localhost:3000/set-password/${token}`;
    console.log(fullUrl);
    const mailSent = yield (0, sendEmail_1.sendEmail)({
        email: email,
        url: fullUrl,
        sub: "Set Password",
        html: `In order to set your password please follow this link: <a href="${fullUrl}">${fullUrl}</a>`
    });
    if (mailSent) {
        res.send((0, response_helper_1.createResponse)(result, "User created successfully"));
    }
    else {
        res.send((0, response_helper_1.createResponse)(result, "Error while sending email"));
    }
}));
exports.loginUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        throw new Error("Email and password are required");
    }
    const user = yield user_schema_1.default.findOne({ email });
    if (!user) {
        throw new Error("User not found");
    }
    if (user.isBlocked) {
        throw new Error("User is blocked");
    }
    const isPasswordValid = yield bcrypt_1.default.compare(password, user.password || "");
    if (!isPasswordValid) {
        throw new Error("Invalid password");
    }
    const accessToken = userService.generateAccessToken(user.id, user.role);
    const refreshToken = userService.generateRefreshToken(user.id, user.role);
    user.refreshToken = refreshToken;
    user.isActive = true;
    yield user.save();
    res.cookie("AccessToken", accessToken, {
        httpOnly: true, // Ensures the cookie can't be accessed by client-side JavaScript
        maxAge: 15 * 60 * 1000, // Set the cookie expiry time (15 minutes in milliseconds)
    });
    const result = { accessToken, refreshToken };
    console.log(result);
    res.send((0, response_helper_1.createResponse)(result, "Login successful"));
}));
exports.refreshToken = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        const accessToken = userService.generateAccessToken(decoded.userId, decoded.role);
        throw new Error("User not found");
    }
    catch (err) {
        throw new Error("Invalid refresh token");
    }
}));
const updateUserController = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        // Step 1: Extract the JWT token from the Authorization header
        const token = (_a = req.headers['authorization']) === null || _a === void 0 ? void 0 : _a.split(' ')[1]; // Assumes the token is in the format "Bearer <token>"
        if (!token) {
            res.status(403).json((0, response_helper_1.createResponse)(null, "No token provided"));
            return;
        }
        // Step 2: Decode and verify the token to get the userId
        let decoded;
        try {
            decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET_KEY);
        }
        catch (err) {
            res.status(401).json((0, response_helper_1.createResponse)(null, "Invalid or expired token"));
            return;
        }
        const userId = decoded.userId; // Now you have the userId from the decoded token
        console.log("User ID from Authorization Header:", userId);
        // Step 3: Prepare the fields to update
        const updateFields = {};
        if (req.body.hasOwnProperty("kycCompleted")) {
            updateFields.kycCompleted = req.body.kycCompleted;
        }
        if (req.body.hasOwnProperty("isActive")) {
            updateFields.isActive = req.body.isActive;
        }
        // Step 4: Call the service to update user KYC status or account status
        const result = yield userService.updateKYCStatus(userId, updateFields);
        // Step 5: Send a successful response
        res.send((0, response_helper_1.createResponse)(result, "User updated successfully"));
    }
    catch (error) {
        console.error("❌ Error in updateUserController:", error);
        res.status(500).send((0, response_helper_1.createResponse)(null, "Internal Server Error"));
    }
});
exports.updateUserController = updateUserController;
exports.editUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.editUser(req.params.id, req.body);
    res.send((0, response_helper_1.createResponse)(result, "User updated sucssefully"));
}));
exports.deleteUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.deleteUser(req.params.id);
    res.send((0, response_helper_1.createResponse)(result, "User deleted sucssefully"));
}));
exports.getUserById = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.getUserById(req.params.id);
    res.send((0, response_helper_1.createResponse)(result));
}));
exports.getMe = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // 1. Check for Authorization header
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            res.status(401).json({
                success: false,
                message: "Authorization token required in format: Bearer <token>"
            });
            return;
        }
        const token = authHeader.split(' ')[1];
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        if (!(decoded === null || decoded === void 0 ? void 0 : decoded.id)) {
            res.status(401).json({
                success: false,
                message: "Invalid token payload"
            });
            return;
        }
        const user = yield userService.getUserById(decoded.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }
        // 6. Return user data
        res.json((0, response_helper_1.createResponse)(user));
        return;
    }
    catch (error) {
        console.error("Error in getMe:", error);
        // Handle specific JWT errors
        if (error instanceof jsonwebtoken_1.default.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
            return;
        }
        if (error instanceof jsonwebtoken_1.default.TokenExpiredError) {
            res.status(401).json({
                success: false,
                message: "Token expired"
            });
            return;
        }
        res.status(500).json({
            success: false,
            message: "Internal server error"
        });
        return;
    }
}));
exports.getAllUser = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const result = yield userService.getAllUser();
    res.send((0, response_helper_1.createResponse)(result));
}));
exports.refresh = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { refreshToken } = req.body;
    if (!refreshToken) {
        throw new Error("Refresh token is required");
    }
    try {
        // Verify the refresh token
        const decoded = jsonwebtoken_1.default.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
        console.log("Decoded Token:", decoded);
        // Find the user by ID and refresh token
        const user = yield user_schema_1.default.findOne({ _id: decoded.id.toString(), refreshToken });
        console.log("Database Query Result:", user);
        if (!user) {
            throw new Error("User not found");
        }
        // Generate new tokens
        const newAccessToken = userService.generateAccessToken(user.id, user.role);
        const newRefreshToken = userService.generateRefreshToken(user.id, user.role);
        // Update the refresh token in the database (rotate token)
        user.refreshToken = newRefreshToken;
        yield user.save();
        // Set the new access token as an HTTP-only cookie
        res.cookie("AccessToken", newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production", // Use HTTPS in production
            maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
        });
        res.status(200).send((0, response_helper_1.createResponse)({ accessToken: newAccessToken, refreshToken: newRefreshToken }, "Tokens refreshed successfully"));
    }
    catch (error) {
        console.error("Refresh Token Error:", error);
        throw new Error("Invalid refresh token");
    }
}));
exports.setPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) {
        res.status(400).send({
            message: "Password is required",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        // Update the user's password
        const updatedUser = yield userService.updatePassword(email, password);
        res.status(200).send({
            message: "Password updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(400).send({
            message: "Invalid or expired token",
        });
    }
}));
exports.changeBlockStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { userId, isBlocked } = req.body;
    // Initialize an array to hold validation errors
    const validationErrors = [];
    // Validate input
    if (!userId || typeof userId !== "string") {
        validationErrors.push({
            type: "field",
            msg: "userId must be a non-empty string.",
            path: "userId",
            location: "body"
        });
    }
    if (typeof isBlocked !== "boolean") {
        validationErrors.push({
            type: "field",
            msg: "isBlocked must be a boolean.",
            path: "isBlocked",
            location: "body"
        });
    }
    // If there are validation errors, return them
    if (validationErrors.length > 0) {
        res.status(400).json({
            success: false,
            error_code: 400,
            message: "Validation error!",
            data: {
                errors: validationErrors
            }
        });
        return; // Ensure to return here to avoid further execution
    }
    // Block or unblock the user
    const user = yield userService.blockUser(userId, isBlocked);
    if (!user) {
        res.status(404).json({
            success: false,
            error_code: 404,
            message: "User  not found.",
        });
        return; // Ensure to return here to avoid further execution
    }
    // Send success response
    res.json({
        success: true,
        message: `User  ${isBlocked ? "blocked" : "unblocked"} successfully.`,
        data: user,
    });
}));
exports.getDashboardStats = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { startDate, endDate } = req.query;
    // Validate input
    if (!startDate || !endDate) {
        res.status(400).json({
            success: false,
            message: "Please provide both startDate and endDate as query parameters.",
        });
        return;
    }
    const stats = yield userService.getDashboardStats(startDate, endDate);
    res.json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data: stats,
    });
}));
exports.resendEmail = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    if (!email) {
        res.status(400).json({ success: false, message: "Email is required" });
        return;
    }
    const subject = "onboarding and KYC pending";
    const messageBody = "Dear user please complete your onboarding process and complete your KYC verification";
    const result = yield userService.resendEmailService(email, subject, messageBody);
    res.json(result);
}));
exports.forgotPassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    let url = jsonwebtoken_1.default.sign({ email }, process.env.JWT_SECRET, { expiresIn: "15m" });
    console.log("forget password url", url);
    const mailSent = yield (0, sendEmail_1.sendEmail)({
        email: email,
        url: `http://localhost:5000/api/users/update-password/${url}`,
        sub: "Set Password",
        html: `In order to set your password please follow this link ${url}`
    });
    if (mailSent) {
        res.send((0, response_helper_1.createResponse)("Mail send successfully"));
    }
    else {
        res.send((0, response_helper_1.createResponse)("Error while sending email"));
    }
}));
exports.updatePassword = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token } = req.params;
    const { password } = req.body;
    if (!password) {
        res.status(400).send({
            message: "Password is required",
        });
        return;
    }
    try {
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        const email = decoded.email;
        // Update the user's password
        const updatedUser = yield userService.updatePassword(email, password);
        res.status(200).send({
            message: "Password updated successfully",
            user: updatedUser,
        });
    }
    catch (error) {
        res.status(400).send({
            message: "Invalid or expired token",
        });
    }
}));
exports.updateKYCStatus = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    const { userId } = req.params;
    const { isActive, kyc } = req.body;
    const existingUser = yield user_schema_1.default.findById(userId);
    if (!existingUser) {
        res.status(404).json({
            success: false,
            message: 'User not found.',
        });
        return;
    }
    const updatedUser = yield userService.updateUser(userId, {
        isActive: typeof isActive !== 'undefined' ? isActive : existingUser.isActive,
        kyc: {
            completed: (_a = kyc === null || kyc === void 0 ? void 0 : kyc.completed) !== null && _a !== void 0 ? _a : existingUser.kyc.completed,
            status: (_b = kyc === null || kyc === void 0 ? void 0 : kyc.status) !== null && _b !== void 0 ? _b : existingUser.kyc.status,
            images: existingUser.kyc.images, // Preserve current images unless changed
        },
    });
    res.json({
        success: true,
        message: 'User KYC and active status updated successfully',
        data: updatedUser,
    });
}));
const saveKycDocs = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const userId = (_a = req.auth) === null || _a === void 0 ? void 0 : _a.id;
        const cloudinaryUrls = req.body.cloudinaryUrls;
        if (!userId) {
            res.status(401).json({ success: false, message: "User ID missing from token" });
            return;
        }
        if (!cloudinaryUrls || !Array.isArray(cloudinaryUrls) || cloudinaryUrls.length === 0) {
            res.status(400).json({ success: false, message: "No files uploaded" });
            return;
        }
        const kycImages = cloudinaryUrls.map((url) => ({
            url,
            uploadedAt: new Date(),
        }));
        const updatedUser = yield user_schema_2.default.findByIdAndUpdate(userId, {
            $set: {
                'kyc.images': kycImages,
                'kyc.completed': true,
                'kyc.status': 'pending',
            },
        }, { new: true }).select("-password");
        if (!updatedUser) {
            res.status(404).json({ success: false, message: "User not found." });
            return;
        }
        res.status(200).json({
            success: true,
            message: "KYC documents uploaded successfully",
            data: updatedUser,
        });
    }
    catch (error) {
        console.error("Error saving KYC documents:", error);
        res.status(500).json({
            success: false,
            message: error.message || "Internal server error",
        });
    }
});
exports.saveKycDocs = saveKycDocs;
exports.logout = (0, express_async_handler_1.default)((req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ success: true, message: "User logged out successfully" });
}));
