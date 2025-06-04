import { Router } from "express";
import { UpsertWebColor, GetWebColor } from "../controllers/WebColorController.js";

const router = Router();

router.post("/upsert", UpsertWebColor);
router.get("/get", GetWebColor);

export default router;
