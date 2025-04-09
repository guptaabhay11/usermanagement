import { body, checkExact } from 'express-validator';
import mongoose from 'mongoose';
import * as userService from './user.service';


export const login = checkExact([
    body('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be valid'),
    body('password').notEmpty().withMessage('Password is required').isString().withMessage('Password must be a string'),
]);

export const createUser = checkExact([
    body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid')
        .custom(async (value) => {
            const user = await userService.getUserByEmail(value)
            if (user) throw new Error("Email is already exist.")
            return true
        }),
    body('password').notEmpty().withMessage('Password is required').isString().withMessage('Password must be a string'),
    body('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
]);

export const createProfile = checkExact([
  body('phone')
    .notEmpty().withMessage('Phone is required')
    .isMobilePhone('any').withMessage('Phone must be valid'),
  body('address')
    .notEmpty().withMessage('Address is required')
    .isString().withMessage('Address must be a string'),
]);

export const userValidator = checkExact([
    body('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
    body('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid')
        .custom(async (value) => {
            const user = await userService.getUserByEmail(value)
            if (user) throw new Error("Email is already exist.")
            return true
        }),
])


export const createQualification = checkExact([
  body('degree')
    .notEmpty().withMessage('Degree is required')
    .isString().withMessage('Degree must be a string'),
  body('institution')
    .optional()
    .isString().withMessage('Institution must be a string'),
  body('year')
    .optional()
    .isInt({ min: 1900, max: new Date().getFullYear() })
    .withMessage('Year must be a valid number'),
]);


export const createKYC = checkExact([
  body('documentType')
    .notEmpty().withMessage('Document type is required')
    .isIn(['AADHAR', 'PASSPORT', 'DRIVING_LICENSE']).withMessage('Invalid document type'),
  body('documentNumber')
    .notEmpty().withMessage('Document number is required')
    .isString().withMessage('Document number must be a string'),
]);

// Helper validator if needed to validate userId
export const userIdParam = [
  body('userId')
    .notEmpty().withMessage('User ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value)).withMessage('Invalid User ID')
];

export const completeRegistration = checkExact([
  body('password').notEmpty().withMessage('Password is required').isString().withMessage('Password must be a string'),
  body('confirmPassword').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Password confirmation does not match password');
    }
    return true;
  })
]);


export const inviteUser = checkExact([
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Email must be valid')
    .custom(async (value) => {
      const user = await userService.getUserByEmail(value)
      if (user) throw new Error("Email is already exist.")
      return true
    }),
]);