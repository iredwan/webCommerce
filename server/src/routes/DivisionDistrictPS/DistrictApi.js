import { Router } from "express";
import { UpsertDistrictController, GetAllDistrictsController, GetDistrictsByDivisionIDController } from "../../controllers/DivisionDistrictPSController/DistrictController.js";

const router = Router();

router.post("/upsert", UpsertDistrictController);
router.get("/all", GetAllDistrictsController);
router.get("/by-division/:divisionId", GetDistrictsByDivisionIDController);

export default router; 