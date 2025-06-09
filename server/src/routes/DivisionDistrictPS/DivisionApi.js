import { Router } from "express";
import { UpsertDivisionController, GetAllDivisionsController } from "../../controllers/DivisionDistrictPSController/DivisionController.js";

const router = Router();

router.post("/upsert", UpsertDivisionController);
router.get("/all", GetAllDivisionsController);

export default router;
