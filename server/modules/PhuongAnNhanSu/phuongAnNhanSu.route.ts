import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getAll, getById, approve, create, reject } from "./phuongAnNhanSu.controller";

const router = Router();

router.use(verifyToken);
router.get("/", getAll);
router.get("/:id", getById);
router.post('/', create);
router.patch('/:id/duyet', approve);
router.patch('/:id/tu-choi', reject);

export default router;
