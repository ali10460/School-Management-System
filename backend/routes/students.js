import express from 'express';
import { body } from 'express-validator';
import { createStudent, getStudents, getStudentById, updateStudent, deleteStudent } from '../controllers/studentController.js';
import { protect, authorize } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';

const router = express.Router();

const nameRegex = /^[A-Za-z\s]+$/;
const phoneRegex = /^\d+$/;
const positiveIntRegex = /^[1-9]\d*$/;
const alphanumericRegex = /^[A-Za-z0-9]+$/;

router.post('/', protect, authorize('admin'), [
    body('name')
        .trim()
        .notEmpty().withMessage('Name is required')
        .matches(nameRegex).withMessage('Name must contain only letters'),
    body('email')
        .trim()
        .isEmail().withMessage('Please enter a valid email address'),
    body('phone')
        .trim()
        .notEmpty().withMessage('Phone number is required')
        .matches(phoneRegex).withMessage('Please enter a valid phone number'),
    body('password')
        .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('rollNumber')
        .trim()
        .notEmpty().withMessage('Roll number is required')
        .matches(positiveIntRegex).withMessage('Roll number must be a positive number'),
    body('class')
        .notEmpty().withMessage('Class is required'),
    body('section')
        .optional({ values: 'falsy' })
        .trim()
        .matches(alphanumericRegex).withMessage('Section must be alphanumeric'),
    body('parentName')
        .optional({ values: 'falsy' })
        .trim()
        .matches(nameRegex).withMessage('Parent name must contain only letters'),
    body('parentPhone')
        .optional({ values: 'falsy' })
        .trim()
        .matches(phoneRegex).withMessage('Please enter a valid parent phone number'),
    body('parentEmail')
        .optional({ values: 'falsy' })
        .trim()
        .isEmail().withMessage('Please enter a valid parent email address'),
    body('address')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
        .matches(/[a-zA-Z]/).withMessage('Address must contain letters'),
], validate, createStudent);

router.get('/', protect, getStudents);

router.get('/:id', protect, getStudentById);

router.put('/:id', protect, authorize('admin'), [
    body('name')
        .optional()
        .trim()
        .notEmpty().withMessage('Name cannot be empty')
        .matches(nameRegex).withMessage('Name must contain only letters'),
    body('email')
        .optional()
        .trim()
        .isEmail().withMessage('Please enter a valid email address'),
    body('phone')
        .optional()
        .trim()
        .notEmpty().withMessage('Phone number cannot be empty')
        .matches(phoneRegex).withMessage('Please enter a valid phone number'),
    body('rollNumber')
        .optional()
        .trim()
        .notEmpty().withMessage('Roll number cannot be empty')
        .matches(positiveIntRegex).withMessage('Roll number must be a positive number'),
    body('class')
        .optional()
        .notEmpty().withMessage('Class cannot be empty'),
    body('section')
        .optional({ values: 'falsy' })
        .trim()
        .matches(alphanumericRegex).withMessage('Section must be alphanumeric'),
    body('parentName')
        .optional({ values: 'falsy' })
        .trim()
        .matches(nameRegex).withMessage('Parent name must contain only letters'),
    body('parentPhone')
        .optional({ values: 'falsy' })
        .trim()
        .matches(phoneRegex).withMessage('Please enter a valid parent phone number'),
    body('parentEmail')
        .optional({ values: 'falsy' })
        .trim()
        .isEmail().withMessage('Please enter a valid parent email address'),
    body('address')
        .optional({ values: 'falsy' })
        .trim()
        .isLength({ min: 5 }).withMessage('Address must be at least 5 characters')
        .matches(/[a-zA-Z]/).withMessage('Address must contain letters'),
], validate, updateStudent);

router.delete('/:id', protect, authorize('admin'), deleteStudent);

export default router;
