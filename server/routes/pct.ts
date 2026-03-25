import { Router } from "express";
import pctController from "../controllers/pctController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get('/', verifyToken,checkRole(["VCQL", "PTCCT", "BGH"]) ,pctController.getAllPTC)
router.get('/dot-quy-hoach', verifyToken, checkRole(["VCQL", "PTCCT"]), pctController.getDotQuyHoach)
router.post('/',verifyToken, checkRole(["VCQL"]), pctController.createPTC)
router.put('/:id', verifyToken, checkRole(["BGH"]), pctController.approvePTC)
export default router;