import { Router } from "express";
import passport from "passport";
import { catchError } from "../common/middleware/catch-error.middleware";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";

const router = Router();

// ========== Auth & Account Management ==========
router.post("/login", userValidator.login, catchError, passport.authenticate("login", { session: false }), userController.login);
router.post("/register", userValidator.createUser, catchError, userController.createUser); // Admin-only route for invitation
router.post("/complete-registration", userValidator.completeRegistration, catchError, userController.completeRegistration); // User creates password using invitation
router.post("/logout", roleAuth(["USER", "ADMIN"]), userController.logout);
// router.post("/forgot-password", userValidator.forgotPassword, catchError, userController.forgotPassword);
router.post("/invite", userValidator.inviteUser, catchError, userController.inviteUser);
// ========== User Info ==========
router.get("/me", roleAuth(["USER", "ADMIN"]), userController.getUserInfo);
router.get("/user/:id", roleAuth(["ADMIN"]), userController.getUserById);
router.delete("/user/:id", roleAuth(["ADMIN"]), userController.deleteUser);

// ========== Admin Analytics ==========
router.get("/analytics/registered", roleAuth(["ADMIN"]), userController.getRegisteredUsersByDate);
router.get("/analytics/active-sessions", roleAuth(["ADMIN"]), userController.getActiveSessions);
router.get("/analytics/pending-onboarding", roleAuth(["ADMIN"]), userController.getPendingOnboarding);
router.get("/analytics/pending-kyc", roleAuth(["ADMIN"]), userController.getPendingKYC);
// router.post("/notify/pending-kyc", roleAuth(["ADMIN"]), userController.sendReminderToCompleteKYC);
// router.post("/notify/pending-onboarding", roleAuth(["ADMIN"]), userController.sendReminderToCompleteOnboarding);
// router.patch("/user/:id/block", roleAuth(["ADMIN"]), userController.blockUser);
// router.patch("/user/:id/unblock", roleAuth(["ADMIN"]), userController.unblockUser);

// ========== Onboarding ==========
// router.post("/onboarding/profile", roleAuth(["USER"]), userValidator.createProfile, catchError, userController.saveProfile);
// router.post("/onboarding/qualification", roleAuth(["USER"]), userValidator.createQualification, catchError, userController.saveQualification);
// router.post("/onboarding/kyc", roleAuth(["USER"]), userValidator.createKYC, catchError, userController.saveKYC);

export default router;
