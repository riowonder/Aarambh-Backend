import express from 'express';
import * as memberController from '../controllers/memberController.js';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth.js';
import upload from '../middleware/multer.js';
import { getBirthdaysThisMonth } from '../controllers/birthdayController.js';

const router = express.Router();

// Add new member
router.post('/add', authenticate, requireManagerOrAdmin, upload.single('image'), memberController.addMember);
router.get('/get-members', authenticate, requireManagerOrAdmin, memberController.getMembers);
router.get('/expired', authenticate, requireManagerOrAdmin, memberController.expiredSubscriptions);
router.post('/expiring-soon', authenticate, requireManagerOrAdmin, memberController.expiringSoon);

// Add search route 
router.get('/search', authenticate, requireManagerOrAdmin, memberController.searchMembers);

// Birthdays route should be before the dynamic '/:id' route to avoid being captured as an id
router.get('/get-birthdays', authenticate, requireManagerOrAdmin, getBirthdaysThisMonth);

router.get('/:id', authenticate, requireManagerOrAdmin, memberController.getMemberById);
router.put('/:id', authenticate, requireManagerOrAdmin, upload.single('image'), memberController.updateMember);

// Subscription routes
router.post('/:userId/subscription', authenticate, requireManagerOrAdmin, memberController.addSubscription);
router.get('/:userId/subscriptions', authenticate, requireManagerOrAdmin, memberController.getSubscriptions);
router.put('/subscription/:subscriptionId', authenticate, requireManagerOrAdmin, memberController.updateSubscription);
router.delete('/subscription/:subscriptionId', authenticate, requireManagerOrAdmin, memberController.deleteSubscription);


export default router;