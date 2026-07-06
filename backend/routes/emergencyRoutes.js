import { Router } from 'express';
import {
  createEmergencyService,
  deleteEmergencyService,
  getEmergencyService,
  listEmergencyServices,
  updateEmergencyService,
} from '../controllers/emergencyController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', asyncHandler(listEmergencyServices));
router.get('/:id', asyncHandler(getEmergencyService));
router.post('/', authenticate, requireAdmin, asyncHandler(createEmergencyService));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateEmergencyService));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteEmergencyService));

export default router;
