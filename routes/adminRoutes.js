import express from 'express';
import {updateGymName, inviteManager, pendingUserApprovalRequestData, approveUser, rejectUser} from '../controllers/adminController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Update gym name (Admin only)
router.put('/update-gym-name', authenticate, requireAdmin, updateGymName);

// Invite manager (Admin only)
router.post('/invite-manager', authenticate, requireAdmin, inviteManager);

// Pending Approvals data
router.get('/pending-user-approvals', authenticate, requireAdmin, pendingUserApprovalRequestData);

// Approve user (Admin only)
router.post('/approve-user/:userId', authenticate, requireAdmin, approveUser);

// Reject user (Admin only)
router.post('/reject-user/:userId', authenticate, requireAdmin, rejectUser);

export default router;