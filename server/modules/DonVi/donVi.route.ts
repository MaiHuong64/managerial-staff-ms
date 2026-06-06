import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import * as DonViController from "./donVi.controller";

const router = Router();

router.use(verifyToken);

router.get("/", DonViController.getAllDonVi);
router.get("/:id", DonViController.getDonViById);
router.post("/", DonViController.createDonVi);
router.put("/:id", DonViController.updateDonVi);
router.delete("/:id", DonViController.deleteDonVi);
    
export default router;
