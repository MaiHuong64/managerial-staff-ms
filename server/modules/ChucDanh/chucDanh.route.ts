import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getAll } from "./chucDanh.controller";

const router = Router();

router.use(verifyToken);

router.get("/", getAll);

export default router;
