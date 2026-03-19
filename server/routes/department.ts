import { Router } from "express";
import departmentController from "../controllers/departmentController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";
const router = Router();

router.get('/', verifyToken, checkRole(['PTCCT, BGH']), departmentController.getAllDepartment);
router.get('/:id', verifyToken, checkRole(['PTCCT, BGH']), departmentController.getDepartmentById);
router.post('/', verifyToken, checkRole(['PTCCT, BGH']), departmentController.createDepartment);
router.put('/:id', verifyToken, checkRole(['PTCCT, BGH']), departmentController.updateDepartment);
router.delete('/:id', verifyToken, checkRole(['PTCCT, BGH']), departmentController.deleteDepartment);

export default router;