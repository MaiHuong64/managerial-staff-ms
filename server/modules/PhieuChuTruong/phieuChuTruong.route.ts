import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getAll, getById, approve, create, reject } from "./phieuChuTruong.controller";

const router = Router();

router.use(verifyToken);

router.get("/", getAll);
router.get("/:id", getById);
router.post("/", create);
router.post("/:id/approve", approve);
router.post("/:id/reject", reject);
export default router;