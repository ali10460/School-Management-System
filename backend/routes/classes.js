import express from 'express';
import { body } from 'express-validator';
import { createClass, getClasses, getClassById, updateClass, deleteClass } from '../controllers/classController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Class name is required')
], validate, createClass);

router.get('/', protect, getClasses);

router.get('/:id', protect, getClassById);

router.put('/:id', protect, authorize('admin'), [
  body('name').optional().notEmpty().withMessage('Class name cannot be empty')
], validate, updateClass);

router.delete('/:id', protect, authorize('admin'), deleteClass);

export default router;
