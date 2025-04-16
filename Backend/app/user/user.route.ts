
import { RequestHandler, Router } from "express";
import { catchError } from "../common/middleware/catch-error.middleware";
import * as userController from "./user.controller";
import * as userValidator from "./user.validation";
import { roleAuth } from "../common/middleware/role-auth.middleware";
import { upload } from "../common/cloudinary/addFiles";
import { authenticateUser } from "./auth.middleware";
import {uploadToCloudinary} from "../common/cloudinary/addFiles"


const router = Router();

router
        .get("/", roleAuth(["ADMIN"]), userController.getAllUser) // return all the user, accessable by admin only
        .post("/invite-user", userValidator.inviteUser, catchError, userController.createUser) //by sending mail
        .get("/me", catchError, userController.getMe) // get the user details of the logged in user
        
        .post("/resend-mail", catchError, userController.resendEmail) // resend the mail to the user who has not verified their email yet
        .get("/dashboard-stats", userController.getDashboardStats)
        .get("/:id", userController.getUserById)

        .patch("/update/", catchError, userController.updateUserController) //update user details
       
        .post("/register", userValidator.createUser, catchError, userController.createUser) //admin register route
        .put("/set-status", userController.changeBlockStatus)
        .post("/logout", userController.logout) //logout route
        
        
        .post("/login", userValidator.loginUser, catchError, userController.loginUser) //login route
        .post("/refresh", userValidator.refreshToken, catchError, userController.refresh) //jwt expired route
        .patch("/update-kyc-status/:userId",userValidator.updateKYCStatus,catchError, userController.updateKYCStatus) //update kyc

        
        .post("/set-password/:token",catchError ,userController.setPassword) //send mail to the user who has not set their password yet
        .post("/forgot-password/", catchError, userController.forgotPassword)
        .patch("/update-password/:token", catchError, userController.updatePassword)



        .post(
                '/upload-kyc',
                authenticateUser,
                upload.array('files'),
                uploadToCloudinary,
              );

        
export default router;