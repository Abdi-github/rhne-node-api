import { Router } from "express";
import * as permissionController from "./permission.controller";

const router = Router();

router.get("/", permissionController.getPermissions);

export default router;
