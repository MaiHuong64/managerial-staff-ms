import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { getBGHDashboardController, getPTCCTDashboardController } from "./dashboard.controller";

const router = Router();

router.use(verifyToken);

router.get("/bgh", getBGHDashboardController);
router.get("/ptcct", getPTCCTDashboardController);

export default router;
