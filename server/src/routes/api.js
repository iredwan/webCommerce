// import express from "express";
// import * as UsersController from "../controllers/UsersController.js";
// import * as ProfileController from "../controllers/ProfileControllers.js";
// import * as CategoryController from "../controllers/CategoryController.js";
// import * as FileUploadController from "../controllers/FileUploadController.js";
// import AuthMiddleware from "../middlewares/AuthMiddleware.js"
// import { checkRole } from "../middlewares/roleMiddleware.js";
// import upload from "../middlewares/FileUploads.js"

// const router = express.Router();

// // Admin User router
// router.get('/user-otp',UsersController.UserOTP)
// router.get('/pws-update-otp',UsersController.passwordUpdateOTP)

// router.get('/VerifyLogin',UsersController.VerifyLogin)
// router.get('/user-logout',AuthMiddleware,UsersController.UserLogout)




// //Profile Register
// router.post('/profile-register' ,AuthMiddleware,checkRole(["user"]), ProfileController.profileRegister); // Create Profile

// router.post('/profile-login',ProfileController.profileLogin); // Create Profile

// router.get('/single-profile/:id',AuthMiddleware,checkRole(["user"]), ProfileController.getProfile); // Get single Profile by ID

// router.get('/all-profiles',AuthMiddleware,checkRole(["admin", "editor"]), ProfileController.getAllProfiles); // Get all Profiles

// router.put('/update-profile/:id',AuthMiddleware,checkRole(["admin", "editor","user"]), ProfileController.updateProfile); // Update Profile

// router.delete('/delete-profile/:id',AuthMiddleware,checkRole(["admin"]), ProfileController.deleteProfile); // Delete Profile

// router.get('/profile-logout/:id',AuthMiddleware,checkRole(["user"]), ProfileController.profileLogout); // Get single Profile by ID




// // Category Routes
// router.post('/create-category',AuthMiddleware,checkRole(["admin"]), CategoryController.createCategory); // Create category

// router.get('/single-category/:id', CategoryController.getCategory); // Get single category by ID

// router.get('/all-categories', CategoryController.getAllCategories); // Get all categories

// router.put('/update-category/:id',AuthMiddleware,checkRole(["admin", "editor"]), CategoryController.updateCategory); // Update category

// router.delete('/delete-category/:id',AuthMiddleware,checkRole(["admin"]), CategoryController.deleteCategory); // Delete category

// // file router
// router.post("/file-upload", upload.array("file", 20), FileUploadController.fileUpload)



// export default router;
