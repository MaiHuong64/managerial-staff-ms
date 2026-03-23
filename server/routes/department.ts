import { Router } from "express";
import departmentController from "../controllers/departmentController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/', verifyToken, checkRole(['PTCCT', 'BGH']), departmentController.getAllDepartment);
router.get('/:id', verifyToken, checkRole(['PTCCT', 'BGH']), departmentController.getDepartmentById);

export default router;