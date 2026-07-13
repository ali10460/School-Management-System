import express from 'express';
import { body } from 'express-validator';
import { createAssignment, getAssignments, getAssignmentById, updateAssignment, deleteAssignment, submitAssignment, getSubmissions, gradeSubmission } from '../controllers/assignmentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher'), [
  body('title').notEmpty().withMessage('Title is required'),
  body('class').notEmpty().withMessage('Class is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('dueDate').notEmpty().withMessage('Due date is required')
], validate, createAssignment);

router.get('/', protect, getAssignments);

router.get('/:id', protect, getAssignmentById);

router.put('/:id', protect, authorize('admin', 'teacher'), [
  body('title').optional().notEmpty().withMessage('Title cannot be empty')
], validate, updateAssignment);

router.delete('/:id', protect, authorize('admin'), deleteAssignment);

router.post('/:id/submit', protect, authorize('student'), submitAssignment);

router.get('/:id/submissions', protect, authorize('admin', 'teacher'), getSubmissions);

router.put('/submission/:id/grade', protect, authorize('admin', 'teacher'), gradeSubmission);

export default router;
