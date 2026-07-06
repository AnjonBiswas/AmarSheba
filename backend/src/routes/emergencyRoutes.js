import { Router } from 'express';
import {
  createEmergencyService,
  deleteEmergencyService,
  getEmergencyService,
  listEmergencyServices,
  updateEmergencyService,
} from '../controllers/emergencyController.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();

router.get('/', listEmergencyServices);
router.get('/:id', getEmergencyService);
router.post('/', requireAdmin, createEmergencyService);
router.put('/:id', requireAdmin, updateEmergencyService);
router.delete('/:id', requireAdmin, deleteEmergencyService);

export default router;
