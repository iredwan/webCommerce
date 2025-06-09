import { Router } from "express";
import { UpsertPoliceStationController, GetAllPoliceStationsController, GetPoliceStationsByDistrictIDController } from "../../controllers/DivisionDistrictPSController/PoliceStationController.js";

const router = Router();

router.post("/upsert", UpsertPoliceStationController);
router.get("/all", GetAllPoliceStationsController);
router.get("/by-district/:districtId", GetPoliceStationsByDistrictIDController);

export default router; 