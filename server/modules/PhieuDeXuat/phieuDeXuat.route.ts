import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getAllPhieu, getById, approve, create, reject } from "./phieuDeXuat.controller";

const router = Router();

router.use(verifyToken);

router.get("/", getAllPhieu);
router.get("/:id", getById);
router.post("/", create);
router.post("/:id/approve", approve);
router.post("/:id/reject", reject);
export default router;