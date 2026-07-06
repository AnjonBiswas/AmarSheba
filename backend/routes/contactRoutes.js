import { Router } from 'express';
import { createContactMessage, getContactMessages } from '../controllers/contactController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', asyncHandler(createContactMessage));
router.get('/', authenticate, requireAdmin, asyncHandler(getContactMessages));

export default router;
