import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as PhuongAnNSController from "./phuongAnNhanSu.controller";

const router = Router();

router.use(verifyToken);
router.get("/candidates", PhuongAnNSController.getCandidates);
router.get("/", PhuongAnNSController.getAll);
router.get("/:id", PhuongAnNSController.getById);
router.post('/', PhuongAnNSController.create);
router.patch('/:id/trinh', PhuongAnNSController.submit);

router.patch('/:id/duyet', PhuongAnNSController.approve);
router.patch('/:id/tu-choi', PhuongAnNSController.reject);

export default router;
