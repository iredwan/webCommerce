import express from "express";
import { upload } from "../utility/fileUtils.js";
import { fileUpload } from "../controllers/FileUploadController.js";
import { protect } from "../middlewares/AuthMiddleware.js";

const router = express.Router();

// file routes
router.post(
    "/file-upload",
    protect,
    upload.array("file", 20),
    fileUpload
  );
  
  export default router;