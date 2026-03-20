import { Router } from "express";
import {
    createPersonnelPlan,
    getPersonnelPlans,
    getPersonnelPlanDetail
} from "../controllers/personnelPlanController";

const router = Router();

router.post("/:id/personnel-proposal", createPersonnelPlan);
router.get("/:id/personnel-plans", getPersonnelPlans);
router.get("/:id/personnel-plans/:planId",getPersonnelPlanDetail);

export default router;
