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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const passport_1 = __importDefault(require("passport"));
const catch_error_middleware_1 = require("../common/middleware/catch-error.middleware");
const role_auth_middleware_1 = require("../common/middleware/role-auth.middleware");
const userController = __importStar(require("./user.controller"));
const userValidator = __importStar(require("./user.validation"));
const router = (0, express_1.Router)();
// ========== Auth & Account Management ==========
router.post("/login", userValidator.login, catch_error_middleware_1.catchError, passport_1.default.authenticate("login", { session: false }), userController.login);
router.post("/register", userValidator.createUser, catch_error_middleware_1.catchError, userController.createUser); // Admin-only route for invitation
router.post("/complete-registration", userValidator.completeRegistration, catch_error_middleware_1.catchError, userController.completeRegistration); // User creates password using invitation
router.post("/logout", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), userController.logout);
// router.post("/forgot-password", userValidator.forgotPassword, catchError, userController.forgotPassword);
router.post("/invite", userValidator.inviteUser, catch_error_middleware_1.catchError, userController.inviteUser);
// ========== User Info ==========
router.get("/me", (0, role_auth_middleware_1.roleAuth)(["USER", "ADMIN"]), userController.getUserInfo);
router.get("/user/:id", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), userController.getUserById);
router.delete("/user/:id", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), userController.deleteUser);
// ========== Admin Analytics ==========
router.get("/analytics/registered", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), userController.getRegisteredUsersByDate);
router.get("/analytics/active-sessions", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), userController.getActiveSessions);
router.get("/analytics/pending-onboarding", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), userController.getPendingOnboarding);
router.get("/analytics/pending-kyc", (0, role_auth_middleware_1.roleAuth)(["ADMIN"]), userController.getPendingKYC);
// router.post("/notify/pending-kyc", roleAuth(["ADMIN"]), userController.sendReminderToCompleteKYC);
// router.post("/notify/pending-onboarding", roleAuth(["ADMIN"]), userController.sendReminderToCompleteOnboarding);
// router.patch("/user/:id/block", roleAuth(["ADMIN"]), userController.blockUser);
// router.patch("/user/:id/unblock", roleAuth(["ADMIN"]), userController.unblockUser);
// ========== Onboarding ==========
// router.post("/onboarding/profile", roleAuth(["USER"]), userValidator.createProfile, catchError, userController.saveProfile);
// router.post("/onboarding/qualification", roleAuth(["USER"]), userValidator.createQualification, catchError, userController.saveQualification);
// router.post("/onboarding/kyc", roleAuth(["USER"]), userValidator.createKYC, catchError, userController.saveKYC);
exports.default = router;
