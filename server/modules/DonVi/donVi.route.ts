import { Router } from "express";
import { verifyToken } from "../../middleware/auth.middleware";
import { createDonViController, deleteDonViController, getAllDonViController, getDonViByIdController, updateDonViController } from "./donVi.controller";

const router = Router();

// router.use(verifyToken);

router.get("/", getAllDonViController);
router.get("/:id", getDonViByIdController);
router.post("/", createDonViController);
router.put("/:id", updateDonViController);
router.delete("/:id", deleteDonViController);
    
export default router;
