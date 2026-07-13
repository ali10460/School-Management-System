import express from 'express';
import { body } from 'express-validator';
import { createNotice, getNotices, getNoticeById, updateNotice, deleteNotice } from '../controllers/noticeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('content').notEmpty().withMessage('Content is required')
], validate, createNotice);

router.get('/', protect, getNotices);

router.get('/:id', protect, getNoticeById);

router.put('/:id', protect, authorize('admin', 'teacher'), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty'),
  body('content').optional().notEmpty().withMessage('Content cannot be empty')
], validate, updateNotice);

router.delete('/:id', protect, authorize('admin'), deleteNotice);

export default router;
