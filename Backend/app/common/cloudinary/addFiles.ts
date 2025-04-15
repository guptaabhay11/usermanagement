import { Response, NextFunction } from 'express';
import multer, { Multer } from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import sharp from 'sharp';
import { AuthenticatedRequest } from '../../user/auth.middleware';
import userSchema from '../../user/user.schema'; // Import your User model

require('dotenv').config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

console.log(process.env.CLOUDINARY_API_KEY);

const storage = multer.memoryStorage();
export const upload: Multer = multer({ storage });

export const uploadToCloudinary = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const files = req.files as Express.Multer.File[];

    if (!files || files.length === 0) {
      res.status(400).json({ error: 'No files provided' });
      return;
    }

    const userId = req.auth?.id;
    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    const uploadPromises = files.map(async (file) => {
      const resizedBuffer = await sharp(file.buffer)
        .resize({ width: 800, height: 600 })
        .toBuffer();

      return new Promise<{ url: string; uploadedAt: Date }>((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          {
            resource_type: 'image',
            folder: `usermanagement/${userId}`,
          },
          (err, result) => {
            if (err || !result) {
              console.error('Cloudinary upload error:', err);
              return reject(err || new Error('Upload failed'));
            }
            resolve({
              url: result.secure_url,
              uploadedAt: new Date(),
            });
          }
        );
        uploadStream.end(resizedBuffer);
      });
    });

    const uploadedImages = await Promise.all(uploadPromises);

    // Push all images into the user's KYC images array
    const updatedUser = await userSchema.findByIdAndUpdate(
      userId,
      {
        $push: {
          'kyc.images': {
            $each: uploadedImages,
          },
        },
      },
      { new: true }
    ).select('-password');

    res.status(200).json({
      success: true,
      message: 'KYC documents uploaded and user record updated successfully',
      data: updatedUser,
    });

    next(); // Proceed to the next middleware/controller if needed
  } catch (error: any) {
    console.error('Error in uploadToCloudinary middleware:', error);
    res.status(500).json({ error: 'Image upload failed', details: error.message });
  }
};
