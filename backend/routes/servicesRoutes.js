import { Router } from 'express';
import {
  createService,
  deleteService,
  getServiceById,
  getServices,
  updateService,
} from '../controllers/servicesController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', asyncHandler(getServices));
router.get('/:id', asyncHandler(getServiceById));
router.post('/', authenticate, requireAdmin, asyncHandler(createService));
router.put('/:id', authenticate, requireAdmin, asyncHandler(updateService));
router.delete('/:id', authenticate, requireAdmin, asyncHandler(deleteService));

export default router;
