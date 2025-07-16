import fs from "fs";
import path from "path";
import multer from "multer";

// Ensure uploads directory exists
const uploadsDir = "./uploads/";
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const fileStorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, "api-img" + Date.now() + "-" + "blood-cell-bd.png");
  },
});

let upload = multer({ storage: fileStorageEngine });

export { upload };

export const deleteFile = async (fileName) => {
  try {
    const filePath = path.join("uploads", fileName); 
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath); 
      return { status: true,};
    } else {
      throw new Error("File not found");
    }
  } catch (error) {
    return { status: false, error: error.message };
  }
};