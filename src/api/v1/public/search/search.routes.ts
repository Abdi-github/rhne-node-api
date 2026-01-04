import { Router } from "express";
import { validate } from "@middleware/validate.middleware";
import { searchQuerySchema } from "./search.validation";
import * as searchController from "./search.controller";

const router = Router();

router.get("/", validate(searchQuerySchema), searchController.search);

export default router;
