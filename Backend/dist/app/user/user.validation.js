"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateKYCStatus = exports.inviteUser = exports.refreshToken = exports.loginUser = exports.editUser = exports.updateUser = exports.createUser = void 0;
const express_validator_1 = require("express-validator");
exports.createUser = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('name is required').isString().withMessage('name must be a string'),
    (0, express_validator_1.body)('email').notEmpty().withMessage('email is required').isString().withMessage('email must be a string'),
    (0, express_validator_1.body)('active').isBoolean().withMessage('active must be a boolean'),
];
exports.updateUser = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('name is required').isString().withMessage('name must be a string'),
    (0, express_validator_1.body)('email').notEmpty().withMessage('email is required').isString().withMessage('email must be a string'),
    (0, express_validator_1.body)('active').isBoolean().withMessage('active must be a boolean'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('password is required').isString().withMessage('password must be a string'),
];
exports.editUser = [
    (0, express_validator_1.body)('name').isString().withMessage('name must be a string'),
    (0, express_validator_1.body)('email').isString().withMessage('email must be a string'),
    (0, express_validator_1.body)('active').isBoolean().withMessage('active must be a boolean'),
    (0, express_validator_1.body)('password').isString().withMessage('password must be a string'),
];
exports.loginUser = [
    (0, express_validator_1.body)('email').notEmpty().withMessage('email is required').isString().withMessage('email must be a string'),
    (0, express_validator_1.body)('password').notEmpty().withMessage('password is required').isString().withMessage('password must be a string'),
];
exports.refreshToken = [
    (0, express_validator_1.body)("refreshToken").notEmpty().withMessage("Refresh token is required"),
];
exports.inviteUser = [
    (0, express_validator_1.body)('name').notEmpty().withMessage('name is required').isString().withMessage('name must be a string'),
    (0, express_validator_1.body)('email').notEmpty().withMessage('email is required').isString().withMessage('email must be a string'),
];
exports.updateKYCStatus = [
    (0, express_validator_1.body)('isVerified').isBoolean().withMessage('isVerified must be a boolean'),
    (0, express_validator_1.body)('kycCompleted').isBoolean().withMessage('kycCompleted must be a boolean'),
];
