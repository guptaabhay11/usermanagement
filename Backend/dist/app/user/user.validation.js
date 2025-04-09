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
exports.inviteUser = exports.completeRegistration = exports.userIdParam = exports.createKYC = exports.createQualification = exports.userValidator = exports.createProfile = exports.createUser = exports.login = void 0;
const express_validator_1 = require("express-validator");
const mongoose_1 = __importDefault(require("mongoose"));
const userService = __importStar(require("./user.service"));
exports.login = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)('email').notEmpty().withMessage('Email is required').isEmail().withMessage('Email must be valid'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required').isString().withMessage('Password must be a string'),
]);
exports.createUser = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid')
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userService.getUserByEmail(value);
        if (user)
            throw new Error("Email is already exist.");
        return true;
    })),
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required').isString().withMessage('Password must be a string'),
    (0, express_validator_1.body)('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
]);
exports.createProfile = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)('phone')
        .notEmpty().withMessage('Phone is required')
        .isMobilePhone('any').withMessage('Phone must be valid'),
    (0, express_validator_1.body)('address')
        .notEmpty().withMessage('Address is required')
        .isString().withMessage('Address must be a string'),
]);
exports.userValidator = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)('name').notEmpty().withMessage('Name is required').isString().withMessage('Name must be a string'),
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid')
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userService.getUserByEmail(value);
        if (user)
            throw new Error("Email is already exist.");
        return true;
    })),
]);
exports.createQualification = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)('degree')
        .notEmpty().withMessage('Degree is required')
        .isString().withMessage('Degree must be a string'),
    (0, express_validator_1.body)('institution')
        .optional()
        .isString().withMessage('Institution must be a string'),
    (0, express_validator_1.body)('year')
        .optional()
        .isInt({ min: 1900, max: new Date().getFullYear() })
        .withMessage('Year must be a valid number'),
]);
exports.createKYC = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)('documentType')
        .notEmpty().withMessage('Document type is required')
        .isIn(['AADHAR', 'PASSPORT', 'DRIVING_LICENSE']).withMessage('Invalid document type'),
    (0, express_validator_1.body)('documentNumber')
        .notEmpty().withMessage('Document number is required')
        .isString().withMessage('Document number must be a string'),
]);
// Helper validator if needed to validate userId
exports.userIdParam = [
    (0, express_validator_1.body)('userId')
        .notEmpty().withMessage('User ID is required')
        .custom((value) => mongoose_1.default.Types.ObjectId.isValid(value)).withMessage('Invalid User ID')
];
exports.completeRegistration = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)('password').notEmpty().withMessage('Password is required').isString().withMessage('Password must be a string'),
    (0, express_validator_1.body)('confirmPassword').custom((value, { req }) => {
        if (value !== req.body.password) {
            throw new Error('Password confirmation does not match password');
        }
        return true;
    })
]);
exports.inviteUser = (0, express_validator_1.checkExact)([
    (0, express_validator_1.body)('email')
        .notEmpty().withMessage('Email is required')
        .isEmail().withMessage('Email must be valid')
        .custom((value) => __awaiter(void 0, void 0, void 0, function* () {
        const user = yield userService.getUserByEmail(value);
        if (user)
            throw new Error("Email is already exist.");
        return true;
    })),
]);
