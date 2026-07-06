import { Router } from 'express';
import { getApplications, updateApplication } from '../controllers/applicationsController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', authenticate, requireAdmin, asyncHandler(getApplications));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateApplication));

export default router;
