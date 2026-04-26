import express from 'express';
import { getUserDetails, getUserSubscriptions } from '../controllers/userController.js';

const router = express.Router();


router.post('/profile', getUserDetails);

router.post('/subscriptions', getUserSubscriptions);

export default router;