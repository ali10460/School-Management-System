import Subject from '../models/Subject.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, classAssigned, teacher, creditHours } = req.body;
  const subject = await Subject.create({ name, code, classAssigned, teacher, creditHours });
  res.status(201).json({ success: true, subject });
});

export const getSubjects = asyncHandler(async (req, res) => {
  const { class: classFilter } = req.query;
  const query = {};
  if (classFilter) query.classAssigned = classFilter;

  const subjects = await Subject.find(query)
    .populate('classAssigned', 'name')
    .populate('teacher', 'user')
    .populate('teacher.user', 'name');
  success(res, { subjects });
});

export const getSubjectById = asyncHandler(async (req, res) => {
  const subject = await Subject.findById(req.params.id)
    .populate('classAssigned', 'name')
    .populate('teacher', 'user')
    .populate('teacher.user', 'name');
  if (!subject) return error(res, 'Subject not found', 404);
  success(res, { subject });
});

export const updateSubject = asyncHandler(async (req, res) => {
  const { name, code, classAssigned, teacher, creditHours } = req.body;
  const subject = await Subject.findByIdAndUpdate(req.params.id, { name, code, classAssigned, teacher, creditHours }, { new: true });
  if (!subject) return error(res, 'Subject not found', 404);
  success(res, { subject });
});

export const deleteSubject = asyncHandler(async (req, res) => {
  const subject = await Subject.findByIdAndDelete(req.params.id);
  if (!subject) return error(res, 'Subject not found', 404);
  success(res, { message: 'Subject deleted successfully' });
});

export const getSubjectsByTeacher = asyncHandler(async (req, res) => {
  const subjects = await Subject.find({ teacher: req.params.teacherId })
    .populate('classAssigned', 'name');
  success(res, { subjects });
});
