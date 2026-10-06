import { NextFunction, Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as tb from "./thongBao.controller";

const router = Router();

router.get("/", verifyToken, tb.getThongBaoByVcId);
router.get("/unread-count", verifyToken, tb.getMyUnreadCount);
router.patch("/read-all", verifyToken, tb.readAll);
router.patch("/:id/read", verifyToken, tb.readOne);

router.post("/test-notify", verifyToken, tb.testNotify);

export default router;