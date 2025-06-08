import express from 'express';
import { userRegister, userRegisterWithRef, userLogin, userLogout, getUserByID, getAllUsers, updateUser, deleteUser, getUser } from '../controllers/UserControllers.js';
import { protect, restrictTo } from '../middlewares/AuthMiddleware.js';
const router = express.Router();

router.post('/login', userLogin);

router.post('/register', protect, userRegister);
router.post('/register-with-ref', protect, restrictTo('admin', 'manager', 'seller'), userRegisterWithRef);
router.get('/get-user', protect, restrictTo('admin', 'manager', 'seller'), getUser);
router.get('/get-user-by-id/:id', protect, restrictTo('admin', 'manager', 'seller'), getUserByID);
router.get('/get-all-users', protect, restrictTo('admin', 'manager', 'seller'), getAllUsers);
router.put('/update-user/:id', protect, restrictTo('admin', 'manager', 'seller'), updateUser);
router.delete('/delete-user/:id', protect, restrictTo('admin', 'manager', 'seller'), deleteUser);
router.post('/logout', protect, userLogout);

export default router;
