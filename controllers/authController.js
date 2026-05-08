import Admin from "../models/admin.js";
import redis from "../config/redisClient.js";
import bcrypt from "bcrypt";
import { generateTokenAndSetCookie } from "../utils/token.js";
import { verifyOTP, sendResetPasswordMail, sendmail, sendUserResetPasswordMail } from "../utils/otp.js";
import jwt from "jsonwebtoken";
import Manager from "../models/manager.js";
import cloudinary from '../config/cloudinary.js';
import fs from 'fs';
import path from 'path';
import os from 'os';
import User from '../models/user.js'

// ...existing code...

// Login controller
export const login = async (req, res) => {
    try {
        const { data, password } = req.body;

        // Check if admin exists by email or username
        const admin = await Admin.findOne({
            $or: [
                { email: data },
                { name: data }
            ]
        });

        if (!admin) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        // Check password
        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: "Invalid credentials"
            });
        }

        generateTokenAndSetCookie(admin, res);

        // Create payload to send to frontend
        const payload = {
            name: admin.name,
            gym_name: admin.gym_name,
            email: admin.email,
            role: admin.role
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: payload
        });

    } catch (error) {
        console.error("Login error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during login"
        });
    }
};


export const signup = async (req, res) => {
    try {
        const { name, gym_name, email, password } = req.body;

        // Check if admin already exists
        const existingAdmin = await Admin.findOne({ email });
        if (existingAdmin) {
            return res.status(400).json({
                success: false,
                message: "Admin already exists"
            });
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Store data in Redis with 10 min expiry
        const signupData = {
            name,
            gym_name,
            email,
            password: hashedPassword,
        };

        // Use consistent key: signup_data
        await redis.setex(
            `user:${email}:signup_data`,
            600, // 10 minutes in seconds
            JSON.stringify(signupData)
        );

        // **Rate limiting OTP requests**
        const otpRequestedRecently = await redis.get(`user:${email}:otp_requested`);
        if (otpRequestedRecently) {
            return res.status(429).json({
                success: false,
                message: "You can request a new OTP after 1 minute."
            });
        }

        // Send OTP email
        await sendmail(email);

        // Set OTP request timestamp
        await redis.setex(
            `user:${email}:otp_requested`,
            60, // 1 minute in seconds
            "true"
        );

        return res.status(200).json({
            success: true,
            message: "OTP sent to email for verification"
        });

    } catch (error) {
        console.error("Signup error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during signup"
        });
    }
}


export const otpVerification = async (req, res) => {
    try {
        const { inputOtp, email } = req.body;

        // Fetch OTP from Redis (per-user storage)
        const OTP = await redis.get(`user:${email}:otp`);

        // Check if OTP exists
        if (!OTP) {
            return res.status(400).json({ success: false, message: "OTP expired or not found. Request a new OTP." });
        }

        // Validate OTP 
        const isValid = await verifyOTP(OTP, inputOtp);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Incorrect OTP, try again" });
        }

        // Get user data stored during signup
        const signupData = await redis.get(`user:${email}:signup_data`);

        if (!signupData) {
            return res.status(400).json({
                success: false,
                message: "Signup data not found. Please try signing up again."
            });
        }

        const parsedSignupData = JSON.parse(signupData);

        // Create new admin
        const newAdmin = new Admin({
            name: parsedSignupData.name,
            gym_name: parsedSignupData.gym_name,
            email: parsedSignupData.email,
            password: parsedSignupData.password
        });

        await newAdmin.save();

        // Generate token and set cookie
        generateTokenAndSetCookie(newAdmin, res);

        // Clear Redis data
        await redis.del(`user:${email}:otp`);
        await redis.del(`user:${email}:otp_requested`);
        await redis.del(`user:${email}:signup_data`);

        // Create payload to send to frontend
        const payload = {
            name: newAdmin.name,
            gym_name: newAdmin.gym_name,
            email: newAdmin.email,
            role: newAdmin.role
        }

        return res.status(200).json({
            success: true,
            message: "OTP verified successfully",
            user: payload
        });

    } catch (error) {
        console.error("OTP verification error:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred during OTP verification"
        });
    }
}


export const changePassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if admin exists
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found with this email"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update admin password
        const updatedAdmin = await Admin.findByIdAndUpdate(
            admin._id,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedAdmin) {
            return res.status(400).json({
                success: false,
                message: "Failed to update password"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Error in changing password:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating password"
        });
    }
}


export const resetPswdOTP = async (req, res) => {
    try {
        const { otp, email } = req.body;

        // Fetch OTP from Redis (per-user storage)
        const OTP = await redis.get(`admin:${email}:otp`); // Changed user to admin

        // Check if OTP exists
        if (!OTP) {
            return res.status(400).json({ success: false, message: "OTP expired or not found. Request a new OTP." });
        }

        // Validate OTP 
        const isValid = await verifyOTP(OTP, otp);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Incorrect OTP, try again" });
        }

        // OTP is valid, remove the entries from redis
        await redis.del(`admin:${email}:otp`);
        await redis.del(`admin:${email}:otp_requested`); // Allow new OTP requests after verification

        // Store email temporarily for password change
        await redis.setex('admin:data', 300, email); // Store for 5 minutes

        return res.status(200).json({
            success: true,
            message: "OTP verification successful"
        });

    } catch (err) {
        console.log("Error in reset password OTP : ", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


export const resetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if admin exists
        const admin = await Admin.findOne({ email: email.toLowerCase() });
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not registered"
            });
        }

        // Send OTP
        await sendResetPasswordMail(email);
        console.log(`Mail sent to email for password reset: ${email}`);

        // Save email in redis to access it later to change the password (we'll need it to find the admin)
        await redis.setex(`admin:data`, 300, email); // Expires in 5 minutes

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully!"
        });

    } catch (err) {
        console.log("Error in Reset Password:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const isAuthenticated = async (req, res) => {
    try {
        const token = req.cookies.ZM_Cookie;
        if (!token) {
            return res.status(401).json({ success: false, message: "Unauthorized" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Check if it's an admin
        let user = await Admin.findById(decoded.id);
        if (user) {
            return res.status(200).json({
                success: true,
                message: "Authenticated",
                user: {
                    name: user.name,
                    gym_name: user.gym_name,
                    email: user.email,
                    role: user.role,
                    gym_id: user._id
                }
            });
        }

        // Check if it's a manager
        user = await Manager.findById(decoded.id);
        if (user) {
            const admin = await Admin.findById(user.gym_id);
            if (!admin) {
                return res.status(401).json({ success: false, message: "Associated gym not found" });
            }

            return res.status(200).json({
                success: true,
                message: "Authenticated",
                user: {
                    name: user.name,
                    gym_name: admin.gym_name,
                    email: user.email,
                    role: user.role,
                    gym_id: user.gym_id
                }
            });
        }

        // Check if it's a user
        let appUser = await User.findById(decoded.id);
        if (appUser) {
            return res.status(200).json({
                success: true,
                message: "Authenticated",
                user: {
                    name: appUser.name,
                    email: appUser.email,
                    role: 'user', // Hardcoded as userSchema does not have a role field
                    gym_id: appUser.gym_id
                }
            });
        }

        return res.status(401).json({ success: false, message: "Unauthorized" });

    } catch (err) {
        console.log("Error in isAuthenticated: ", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


export const logout = async (req, res) => {
    try {
        res.clearCookie("ZM_Cookie", {
            httpOnly: true,
            secure: true, // Set manually to true for HTTPS
            sameSite: "None", // Set manually to None for cross-site
            path: "/"
        });
        return res.status(200).json({ success: true, message: "Logged out successfully" });
    } catch (err) {
        return res.status(500).json({ success: false, message: "Logout failed" });
    }
}


export const userLogin = async (req, res) => {
    try {
        const { phone, dob } = req.body;
        if (!phone || !dob) {
            return res.status(400).json({ success: false, message: "Phone and dob are required" });
        }

        // Parse provided dob into a UTC start and end range (so we compare by date regardless of format/timezone)
        let startOfDayUTC, endOfDayUTC;
        try {
            // If format is DD/MM/YYYY (common from frontend), parse accordingly
            if (typeof dob === 'string' && dob.includes('/')) {
                const parts = dob.split('/').map(p => p.trim());
                if (parts.length !== 3) throw new Error('Invalid dob format');
                const [dd, mm, yyyy] = parts;
                const day = parseInt(dd, 10);
                const month = parseInt(mm, 10) - 1; // zero-based
                const year = parseInt(yyyy, 10);
                if (Number.isNaN(day) || Number.isNaN(month) || Number.isNaN(year)) throw new Error('Invalid dob numbers');
                startOfDayUTC = new Date(Date.UTC(year, month, day));
            } else {
                // Try parsing ISO or other date strings
                const parsed = new Date(dob);
                if (Number.isNaN(parsed.getTime())) throw new Error('Invalid dob format');
                startOfDayUTC = new Date(Date.UTC(parsed.getUTCFullYear(), parsed.getUTCMonth(), parsed.getUTCDate()));
            }

            endOfDayUTC = new Date(startOfDayUTC.getTime() + 24 * 60 * 60 * 1000);
        } catch (parseErr) {
            return res.status(400).json({ success: false, message: 'Invalid date of birth format' });
        }

        // Find user by phone and dob within the same UTC day (handles stored Date objects)
        const user = await User.findOne({
            phone_number: phone.trim(),
            dob: { $gte: startOfDayUTC, $lt: endOfDayUTC }
        });
        if (!user) {
            return res.status(404).json({ success: false, message: "User not found" });
        }

        if (user.is_approved === false) {
            return res.status(403).json({ success: false, message: "User is not approved" });
        }

        generateTokenAndSetCookie(user, res);

        // Create payload to send to frontend
        const payload = {
            name: user.name,
            email: user.email,
            userId: user._id,
            role: 'user', // Hardcoded as userSchema does not have a role field
            gym_id: user.gym_id
        }

        return res.status(200).json({
            success: true,
            message: "Login successful",
            user: payload
        });

    } catch (err) {
        console.log("Error in User Login: ", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


export const userRegister = async (req, res) => {
    try {
        const { name, email, dob, aadhar, phone, blood_group, age, address, height, weight, gender } = req.body;

        console.log(req.body);

        // Check if user already exists
        const existingUser = await User.findOne({ phone_number: phone });
        if (existingUser) {
            return res.status(409).json({ success: false, message: "User already exists" });
        }

        // get the gym_id  (fix this, decrypt the hash before comparing......)
        // const gym_details = await Admin.findOne({ security_hash: process.env.ADMIN_SECURITY_HASH }).select("_id");
        // const gym_id = gym_details._id;

        const gym_id = process.env.GYM_ID; // Use the gym ID from environment variable

        // Upload image to Cloudinary (if provided)
        let imageUrl = '';
        if (req.file) {
            try {
                const tempPath = path.join(os.tmpdir(), `${Date.now()}-${req.file.originalname}`);
                fs.writeFileSync(tempPath, req.file.buffer);
                const result = await cloudinary.uploader.upload(tempPath, {
                    folder: 'gym-members',
                });
                imageUrl = result.secure_url;
                fs.unlinkSync(tempPath);
            } catch (imgErr) {
                console.error('Image upload error:', imgErr);
                return res.status(500).json({ success: false, message: 'Failed to upload image.' });
            }
        }

        // Parse dob into Date (support DD/MM/YYYY or ISO)
        let formattedDob = null;
        if (dob) {
            try {
                if (typeof dob === 'string' && dob.includes('/')) {
                    const parts = dob.split('/').map(p => p.trim());
                    if (parts.length === 3) {
                        const [dd, mm, yyyy] = parts;
                        const day = parseInt(dd, 10);
                        const month = parseInt(mm, 10) - 1;
                        const year = parseInt(yyyy, 10);
                        if (!Number.isNaN(day) && !Number.isNaN(month) && !Number.isNaN(year)) {
                            formattedDob = new Date(Date.UTC(year, month, day));
                        }
                    }
                } else {
                    const parsed = new Date(dob);
                    if (!Number.isNaN(parsed.getTime())) {
                        formattedDob = parsed;
                    }
                }
            } catch (parseErr) {
                formattedDob = null;
            }
        }

        // Create new user
        const newUserData = {
            name,
            gym_id,
            dob: formattedDob,
            phone_number: phone,
            blood_group,
            height,
            weight,
            gender,
            age,
            address,
            image: imageUrl
        };

        if(email && email.trim() !== "") {
            newUserData.email = email.toLowerCase();
        }

        // newUserData.email = "";

        // ✅ Only add aadhar if it exists
        if (aadhar && aadhar.trim() !== "") {
            newUserData.aadhar_number = aadhar;
        }

        const newUser = new User(newUserData);

        await newUser.save();

        return res.status(201).json({
            success: true,
            message: "User registered successfully",
            user: {
                id: newUser._id,
                name: newUser.name,
                email: newUser.email,
                gym_id: newUser.gym_id,
            }
        });

    } catch (err) {
        console.log("Error in User Registration: ", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}

export const userChangePassword = async (req, res) => {
    try {
        const { email, newPassword } = req.body;

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found with this email"
            });
        }

        // Hash the new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update user password
        const updatedUser = await User.findByIdAndUpdate(
            user._id,
            { password: hashedPassword },
            { new: true }
        );

        if (!updatedUser) {
            return res.status(400).json({
                success: false,
                message: "Failed to update password"
            });
        }

        return res.status(200).json({
            success: true,
            message: "Password updated successfully"
        });

    } catch (error) {
        console.error("Error in changing user password:", error);
        return res.status(500).json({
            success: false,
            message: "An error occurred while updating password"
        });
    }
}


export const userResetPswdOTP = async (req, res) => {
    try {
        const { otp, email } = req.body;

        // Fetch OTP from Redis (per-user storage)
        const OTP = await redis.get(`user:${email}:otp`);

        // Check if OTP exists
        if (!OTP) {
            return res.status(400).json({ success: false, message: "OTP expired or not found. Request a new OTP." });
        }

        // Validate OTP 
        const isValid = await verifyOTP(OTP, otp);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Incorrect OTP, try again" });
        }

        // OTP is valid, remove the entries from redis
        await redis.del(`user:${email}:otp`);
        await redis.del(`user:${email}:otp_requested`);

        // Store email temporarily for password change
        await redis.setex('user:data', 300, email); // Store for 5 minutes

        return res.status(200).json({
            success: true,
            message: "OTP verification successful"
        });

    } catch (err) {
        console.log("Error in user reset password OTP : ", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}


export const userResetPassword = async (req, res) => {
    try {
        const { email } = req.body;

        // Check if user exists
        const user = await User.findOne({ email: email.toLowerCase() });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not registered"
            });
        }

        // Send OTP
        await sendUserResetPasswordMail(email);
        console.log(`Mail sent to user email for password reset: ${email}`);

        // Save email in redis to access it later to change the password
        await redis.setex(`user:data`, 300, email); // Expires in 5 minutes

        return res.status(200).json({
            success: true,
            message: "OTP sent successfully!"
        });

    } catch (err) {
        console.log("Error in User Reset Password:", err);
        return res.status(500).json({
            success: false,
            message: err.message
        });
    }
}
