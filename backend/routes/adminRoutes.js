import { Router } from 'express';
import { getAdminOverview } from '../controllers/adminController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/overview', authenticate, requireAdmin, asyncHandler(getAdminOverview));

export default router;
