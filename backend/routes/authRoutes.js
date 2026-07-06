import { Router } from 'express';
import { getProfile, login, register, resendOtp, verifyOtp } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/register', asyncHandler(register));
router.post('/login', asyncHandler(login));
router.post('/verify-otp', asyncHandler(verifyOtp));
router.post('/resend-otp', asyncHandler(resendOtp));
router.get('/me', authenticate, getProfile);

export default router;
