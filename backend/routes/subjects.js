import express from 'express';
import { body } from 'express-validator';
import { createSubject, getSubjects, getSubjectById, updateSubject, deleteSubject, getSubjectsByTeacher } from '../controllers/subjectController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher'), [
  body('name').notEmpty().withMessage('Subject name is required'),
  body('classAssigned').notEmpty().withMessage('Class is required')
], validate, createSubject);

router.get('/', protect, getSubjects);

router.get('/:id', protect, getSubjectById);

router.put('/:id', protect, authorize('admin', 'teacher'), [
  body('name').optional().notEmpty().withMessage('Subject name cannot be empty'),
  body('classAssigned').optional().notEmpty().withMessage('Class cannot be empty')
], validate, updateSubject);

router.delete('/:id', protect, authorize('admin'), deleteSubject);

router.get('/teacher/:teacherId', protect, getSubjectsByTeacher);

export default router;
