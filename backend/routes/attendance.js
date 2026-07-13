import express from 'express';
import { body } from 'express-validator';
import { createAttendance, createBulkAttendance, getAttendance, getAttendanceReport, getAttendanceById } from '../controllers/attendanceController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

router.post('/', protect, authorize('admin', 'teacher'), [
  body('student').notEmpty().withMessage('Student is required'),
  body('class').notEmpty().withMessage('Class is required'),
  body('date').notEmpty().withMessage('Date is required'),
  body('status').isIn(['present', 'absent', 'late']).withMessage('Invalid status')
], validate, createAttendance);

router.post('/bulk', protect, authorize('admin', 'teacher'), createBulkAttendance);

router.get('/', protect, getAttendance);

router.get('/report', protect, getAttendanceReport);

router.get('/:id', protect, getAttendanceById);

export default router;
