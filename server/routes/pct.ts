import { Router } from "express";
import pctController from "../controllers/pctController";
import { checkRole, verifyToken } from "../middleware/authMiddleware";

const router = Router();

router.get('/', verifyToken,checkRole(["VCQL", "PTCCT", "BGH"]) ,pctController.getAllPTC)
router.post('/', verifyToken, checkRole(["VCQL"]), pctController.createPTC)

export default router;