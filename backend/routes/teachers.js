import express from 'express';
import { body } from 'express-validator';
import { createTeacher, getTeachers, getTeacherById, updateTeacher, deleteTeacher, getMySubjects } from '../controllers/teacherController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, authorize('admin'), [
  body('name').notEmpty().withMessage('Name is required'),
  body('email').isEmail().withMessage('Please enter a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
], validate, createTeacher);

router.get('/', protect, getTeachers);

router.get('/:id', protect, getTeacherById);

router.put('/:id', protect, authorize('admin'), [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('email').optional().isEmail().withMessage('Please enter a valid email')
], validate, updateTeacher);

router.delete('/:id', protect, authorize('admin'), deleteTeacher);

router.get('/my/subjects', protect, authorize('teacher'), getMySubjects);

export default router;
