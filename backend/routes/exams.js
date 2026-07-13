import express from 'express';
import { body } from 'express-validator';
import { createExam, getExams, getExamById, updateExam, deleteExam, createGrades, getGrades } from '../controllers/examController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher'), [
  body('name').notEmpty().withMessage('Exam name is required'),
  body('type').isIn(['midterm', 'final', 'quiz', 'unit-test']).withMessage('Invalid exam type'),
  body('class').notEmpty().withMessage('Class is required'),
  body('subject').notEmpty().withMessage('Subject is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('totalMarks').isNumeric().withMessage('Total marks must be a number'),
  body('passingMarks').isNumeric().withMessage('Passing marks must be a number')
], validate, createExam);

router.get('/', protect, getExams);

router.get('/:id', protect, getExamById);

router.put('/:id', protect, authorize('admin', 'teacher'), [
  body('name').optional().notEmpty().withMessage('Exam name cannot be empty'),
  body('type').optional().isIn(['midterm', 'final', 'quiz', 'unit-test']).withMessage('Invalid exam type')
], validate, updateExam);

router.delete('/:id', protect, authorize('admin'), deleteExam);

router.post('/:id/grades', protect, authorize('admin', 'teacher'), createGrades);

router.get('/:id/grades', protect, getGrades);

export default router;
