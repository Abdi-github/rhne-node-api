import { Router } from "express";
import * as dashboardController from "./dashboard.controller";

const router = Router();

// GET /api/v1/admin/dashboard/stats
router.get("/stats", dashboardController.getStats);

export default router;
