import express from 'express';
import { body } from 'express-validator';
import { createFee, getFees, getFeeById, updateFee, deleteFee, getFeeStats } from '../controllers/feeController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher'), [
  body('student').notEmpty().withMessage('Student is required'),
  body('class').notEmpty().withMessage('Class is required'),
  body('feeType').notEmpty().withMessage('Fee type is required'),
  body('amount').isNumeric().withMessage('Amount must be a number'),
  body('dueDate').notEmpty().withMessage('Due date is required')
], validate, createFee);

router.get('/stats', protect, getFeeStats);

router.get('/', protect, getFees);

router.get('/:id', protect, getFeeById);

router.put('/:id', protect, authorize('admin', 'teacher'), [
  body('amount').optional().isNumeric().withMessage('Amount must be a number')
], validate, updateFee);

router.delete('/:id', protect, authorize('admin'), deleteFee);

export default router;
