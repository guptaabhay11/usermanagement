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
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const catch_error_middleware_1 = require("../common/middleware/catch-error.middleware");
const userController = __importStar(require("./user.controller"));
const userValidator = __importStar(require("./user.validation"));
const role_auth_middleware_1 = require("../common/middleware/role-auth.middleware");
const router = (0, express_1.Router)();
router
    .get("/", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), userController.getAllUser) // return all the user, accessable by admin only
    .post("/invite-user", userValidator.inviteUser, catch_error_middleware_1.catchError, userController.createUser) //by sending mail
    .get("/me", catch_error_middleware_1.catchError, userController.getUserById) // get the user details of the logged in user
    .post("/resend-mail", catch_error_middleware_1.catchError, userController.resendEmail) // resend the mail to the user who has not verified their email yet
    .get("/dashboard-stats", userController.getDashboardStats)
    .get("/:id", userController.getUserById)
    .patch("/update/", catch_error_middleware_1.catchError, userController.updateUserController) //update user details
    .post("/register", userValidator.createUser, catch_error_middleware_1.catchError, userController.createUser) //admin register route
    .put("/set-status", userController.changeBlockStatus)
    .post("/login", userValidator.loginUser, catch_error_middleware_1.catchError, userController.loginUser) //login route
    .post("/refresh", userValidator.refreshToken, catch_error_middleware_1.catchError, userController.refresh) //jwt expired route
    .put("/update-kyc-status/:userId", userValidator.updateKYCStatus, catch_error_middleware_1.catchError, userController.updateKYCStatus) //update kyc
    .post("/set-password/:token", catch_error_middleware_1.catchError, userController.setPassword) //send mail to the user who has not set their password yet
    .post("/forgot-password/", catch_error_middleware_1.catchError, userController.forgotPassword)
    .patch("/update-password/:token", catch_error_middleware_1.catchError, userController.updatePassword);
exports.default = router;
