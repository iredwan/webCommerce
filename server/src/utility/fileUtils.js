import fs from "fs";
import path from "path";

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