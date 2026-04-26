import express from "express";
import * as authController from "../controllers/authController.js";
import upload from "../middleware/multer.js";

const router = express.Router();

// Login route
router.post("/login", authController.login);

// Signup route
router.post("/signup", authController.signup); 

// OTP verification route
router.post("/verify-otp", authController.otpVerification);

// Reset password: send OTP
router.post("/reset-password", authController.resetPassword); 

// Reset password: verify OTP
router.post("/reset-password/verify-otp", authController.resetPswdOTP);

// Change password (after OTP verification)
router.post("/change-password", authController.changePassword);

// Reset password for User
router.post("/user-reset-password", authController.userResetPassword);

// Reset password OTP for User
router.post("/user-reset-password-otp", authController.userResetPswdOTP);

// Change password for User
router.post("/user-change-password", authController.userChangePassword);

// Check if user is authenticated
router.get("/is-authenticated", authController.isAuthenticated);

// User register route
router.post("/user-register", upload.single("image"), authController.userRegister);

// User login route
router.post("/user-login", authController.userLogin);

// Logout route
router.post("/logout", authController.logout);

export default router;
