import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { createChucDanhController, deleteChucDanhController, getAll, updateChucDanhController } from "./chucDanh.controller";

const router = Router();

router.use(verifyToken);

router.get("/", getAll);
router.post("/", createChucDanhController);
router.put("/:id", updateChucDanhController);
router.delete("/:id", deleteChucDanhController);
export default router;
