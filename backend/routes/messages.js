import express from 'express';
import { protect } from '../middleware/auth.js';
import { getConversations, getUsers, getMessages, createConversation } from '../controllers/messageController.js';

const router = express.Router();

router.get('/conversations', protect, getConversations);
router.get('/users', protect, getUsers);
router.get('/:conversationId', protect, getMessages);
router.post('/conversation', protect, createConversation);

export default router;
