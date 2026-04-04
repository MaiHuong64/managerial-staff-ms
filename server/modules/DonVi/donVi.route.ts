import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getAll, getById } from "./donVi.controller";

const router = Router();

router.use(verifyToken);

router.get("/", getAll);
router.get("/:id", getById);

export default router;
