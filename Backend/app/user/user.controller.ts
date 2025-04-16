import User from "./user.schema";
import * as userService from "./user.service";
import { createResponse } from "../common/helper/response.helper";
import asyncHandler from "express-async-handler";
import { response, type Request, type Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import transporter from "../node-mailer/config";
import { sendEmail } from "../common/helper/sendEmail";
import { IUser } from "./user.dto";
import userSchema from "./user.schema";
import sharp from "sharp";
import { AuthenticatedRequest, authenticateUser } from "./auth.middleware";



export const createUser = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const existingUser = await userService.getUserByEmail(email);
    
    if (existingUser) {
         res.status(409).send(createResponse(null, "User already exists"));

    }

    const result = await userService.createUser(req.body);
    
    const token = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "60m" });
    const fullUrl = `http://localhost:3000/set-password/${token}`;

    console.log(fullUrl)

    const mailSent = await sendEmail({
        email: email,
        url: fullUrl,
        sub: "Set Password",
        html: `In order to set your password please follow this link: <a href="${fullUrl}">${fullUrl}</a>`
    });

    if (mailSent) {
        res.send(createResponse(result, "User created successfully"));
    } else {
        res.send(createResponse(result, "Error while sending email"));
    }
});



export const loginUser = asyncHandler(async (req: Request, res: Response) => {
    const { email, password } = req.body;

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

 
  const user = await User.findOne({ email });
  if (!user) {
    throw new Error("User not found");
  }


  if (user.isBlocked) {
    throw new Error("User is blocked");
  }


  const isPasswordValid = await bcrypt.compare(password, user.password || "");
  if (!isPasswordValid) {
    throw new Error("Invalid password");
  }

  
  const accessToken = userService.generateAccessToken(user.id, user.role);
  const refreshToken = userService.generateRefreshToken(user.id, user.role);

  
  user.refreshToken = refreshToken;
  user.isActive = true;
  await user.save();

  res.cookie("AccessToken", accessToken, {
    httpOnly: true, // Ensures the cookie can't be accessed by client-side JavaScript
    maxAge: 15 * 60 * 1000, // Set the cookie expiry time (15 minutes in milliseconds)
  });

  const result = { accessToken, refreshToken };
  console.log(result);

  res.send(createResponse(result, "Login successful"));

})

export const refreshToken = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    try {
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { userId: string, role: string };
      const accessToken = userService.generateAccessToken(decoded.userId, decoded.role);
      throw new Error("User not found");
    } catch (err) {
      throw new Error("Invalid refresh token");
    }
})

interface JwtPayload {
    userId: string;  // Assuming the JWT payload has the userId
  }
  

  interface MyDecodedToken {
    id: string;
    role: string;
    iat: number;
    exp: number;
  }
  export const updateUserController = async (req: Request, res: Response): Promise<void> => {
    try {
      // Step 1: Extract the JWT token from the Authorization header
      const token = req.headers['authorization']?.split(' ')[1];  // Assumes the token is in the format "Bearer <token>"
  
      if (!token) {
         res.status(403).json(createResponse(null, "No token provided"));
         return
      }
  
      // Step 2: Decode and verify the token to get the userId
      let decoded: JwtPayload;
      try {
        decoded = jwt.verify(token, process.env.JWT_SECRET_KEY as string) as JwtPayload;
      } catch (err) {
         res.status(401).json(createResponse(null, "Invalid or expired token"));
         return
      }
  
      const userId = decoded.userId;  // Now you have the userId from the decoded token
      console.log("User ID from Authorization Header:", userId);
  
      // Step 3: Prepare the fields to update
      const updateFields: any = {};
  
      if (req.body.hasOwnProperty("kycCompleted")) {
        updateFields.kycCompleted = req.body.kycCompleted;
      }
      if (req.body.hasOwnProperty("isActive")) {
        updateFields.isActive = req.body.isActive;
      }
  
      // Step 4: Call the service to update user KYC status or account status
      const result = await userService.updateKYCStatus(userId, updateFields);
  
      // Step 5: Send a successful response
      res.send(createResponse(result, "User updated successfully"));
    } catch (error) {
      console.error("❌ Error in updateUserController:", error);
      res.status(500).send(createResponse(null, "Internal Server Error"));
    }
  };  
export const editUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.editUser(req.params.id, req.body);
    res.send(createResponse(result, "User updated sucssefully"))
});

export const deleteUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.deleteUser(req.params.id);
    res.send(createResponse(result, "User deleted sucssefully"))
});

export const getUserById = asyncHandler(async (req: Request, res: Response) => {
  const result = await userService.getUserById(req.params.id);
  res.send(createResponse(result))
});

  export const getMe = asyncHandler(async (req: Request, res: Response) => {
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
        
     
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as {
            id: string;
            role: string;
        };

        if (!decoded?.id) {
            res.status(401).json({
                success: false,
                message: "Invalid token payload"
            });
            return;
        }

        const user = await userService.getUserById(decoded.id);
        if (!user) {
            res.status(404).json({
                success: false,
                message: "User not found"
            });
            return;
        }

        // 6. Return user data
        res.json(createResponse(user));
        return;

    } catch (error) {
        console.error("Error in getMe:", error);
        
        // Handle specific JWT errors
        if (error instanceof jwt.JsonWebTokenError) {
            res.status(401).json({
                success: false,
                message: "Invalid or expired token"
            });
            return;
        }
        
        if (error instanceof jwt.TokenExpiredError) {
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
});


export const getAllUser = asyncHandler(async (req: Request, res: Response) => {
    const result = await userService.getAllUser();
    res.send(createResponse(result))
});


export const refresh = asyncHandler(async (req: Request, res: Response) => {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      throw new Error("Refresh token is required");
    }

    try {
      // Verify the refresh token
      const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET as string) as { id: string };

      console.log("Decoded Token:", decoded);

      // Find the user by ID and refresh token
      const user = await User.findOne({ _id: decoded.id.toString(), refreshToken });
      console.log("Database Query Result:", user);

      if (!user) {
        throw new Error("User not found");
      }

      // Generate new tokens
      const newAccessToken = userService.generateAccessToken(user.id, user.role);
      const newRefreshToken = userService.generateRefreshToken(user.id, user.role);

      // Update the refresh token in the database (rotate token)
      user.refreshToken = newRefreshToken;
      await user.save();

      // Set the new access token as an HTTP-only cookie
      res.cookie("AccessToken", newAccessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", // Use HTTPS in production
        maxAge: 15 * 60 * 1000, // 15 minutes in milliseconds
      });

      res.status(200).send(createResponse({ accessToken: newAccessToken, refreshToken: newRefreshToken }, "Tokens refreshed successfully"));
    } catch (error) {
      console.error("Refresh Token Error:", error);
      throw new Error("Invalid refresh token");
    }
})










export const setPassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        res.status(400).send({
            message: "Password is required",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
        const email = decoded.email;

        // Update the user's password
        const updatedUser = await userService.updatePassword(email, password);

        res.status(200).send({
            message: "Password updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).send({
            message: "Invalid or expired token",
        });
    }
});


export const changeBlockStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const { userId, isBlocked } = req.body;

    // Initialize an array to hold validation errors
    const validationErrors: { type: string; msg: string; path: string; location: string }[] = [];

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
    const user = await userService.blockUser (userId, isBlocked);

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
});


export const getDashboardStats = asyncHandler(async (req: Request, res: Response) => {
    const { startDate, endDate } = req.query;

    // Validate input
    if (!startDate || !endDate) {
        res.status(400).json({
            success: false,
            message: "Please provide both startDate and endDate as query parameters.",
        });
        return;
    }

    const stats = await userService.getDashboardStats(startDate as string, endDate as string);

    res.json({
        success: true,
        message: "Dashboard statistics fetched successfully",
        data: stats,
    });
});

export const resendEmail = asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;

    if (!email) {
         res.status(400).json({ success: false, message: "Email is required" });
         return
    }

    const subject = "onboarding and KYC pending";
    const messageBody = "Dear user please complete your onboarding process and complete your KYC verification";

    const result = await userService.resendEmailService(email, subject, messageBody);
    res.json(result);
});


export const forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const {email} = req.body
    let url = jwt.sign({ email }, process.env.JWT_SECRET as string, { expiresIn: "15m" })
    console.log("forget password url", url)
    const mailSent = await sendEmail({
        email: email,
        url: `http://localhost:5000/api/users/update-password/${url}`,
        sub: "Set Password",
        html: `In order to set your password please follow this link ${url}`
    })

    if(mailSent){
    res.send(createResponse( "Mail send successfully"))
    }else{
        res.send(createResponse("Error while sending email"))
    }
    
});

export const updatePassword = asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.params;
    const { password } = req.body;

    if (!password) {
        res.status(400).send({
            message: "Password is required",
        });
        return;
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
        const email = decoded.email;

        // Update the user's password
        const updatedUser = await userService.updatePassword(email, password);

        res.status(200).send({
            message: "Password updated successfully",
            user: updatedUser,
        });
    } catch (error) {
        res.status(400).send({
            message: "Invalid or expired token",
        });
    }
})


export const updateKYCStatus = asyncHandler(async (req: Request, res: Response) => {
  const { userId } = req.params;
  const { isActive, kyc } = req.body;

  const existingUser = await User.findById(userId);
  if (!existingUser) {
     res.status(404).json({
      success: false,
      message: 'User not found.',
    });
    return
  }

  const updatedUser = await userService.updateUser(userId, {
    isActive: typeof isActive !== 'undefined' ? isActive : existingUser.isActive,
    kyc: {
      completed: kyc?.completed ?? existingUser.kyc.completed,
      status: kyc?.status ?? existingUser.kyc.status,
      images: existingUser.kyc.images, // Preserve current images unless changed
    },
  });

  res.json({
    success: true,
    message: 'User KYC and active status updated successfully',
    data: updatedUser,
  });
});




export const saveKycDocs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.auth?.id;
    const cloudinaryUrls = req.body.cloudinaryUrls;

    if (!userId) {
      res.status(401).json({ success: false, message: "User ID missing from token" });
      return;
    }

    if (!cloudinaryUrls || !Array.isArray(cloudinaryUrls) || cloudinaryUrls.length === 0) {
      res.status(400).json({ success: false, message: "No files uploaded" });
      return;
    }

    const kycImages = cloudinaryUrls.map((url: string) => ({
      url,
      uploadedAt: new Date(),
    }));

    const updatedUser = await userSchema.findByIdAndUpdate(
      userId,
      {
        $set: {
          'kyc.images': kycImages,
          'kyc.completed': true,
          'kyc.status': 'pending',
        },
      },
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      res.status(404).json({ success: false, message: "User not found." });
      return;
    }

    res.status(200).json({
      success: true,
      message: "KYC documents uploaded successfully",
      data: updatedUser,
    });
  } catch (error: any) {
    console.error("Error saving KYC documents:", error);
    res.status(500).json({
      success: false,
      message: error.message || "Internal server error",
    });
  }
};


export const logout = asyncHandler(async (req: Request, res: Response) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });
    res.status(200).json({ success: true, message: "User logged out successfully" })});