import { Router } from "express";
import staffController from "../controllers/staffController";
import { verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/profile', verifyToken, staffController.getProfileStaff);
router.get('/', verifyToken, staffController.getAllStaff);
router.get('/:id', verifyToken, staffController.getStaffById);
router.post('/', verifyToken, staffController.createStaff);
router.put('/:id', verifyToken, staffController.updateStaff);
router.delete('/:id', verifyToken, staffController.deleteStaff);
export default router;