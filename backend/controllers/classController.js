import Class from '../models/Class.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createClass = asyncHandler(async (req, res) => {
  const { name, section, classTeacher } = req.body;

  const classExists = await Class.findOne({ name });
  if (classExists) return error(res, 'Class already exists', 400);

  const newClass = await Class.create({ name, section, classTeacher });
  res.status(201).json({ success: true, class: newClass });
});

export const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find()
    .populate('classTeacher', 'user')
    .populate('classTeacher.user', 'name');
  success(res, { classes });
});

export const getClassById = asyncHandler(async (req, res) => {
  const classData = await Class.findById(req.params.id)
    .populate('classTeacher', 'user')
    .populate('classTeacher.user', 'name');
  if (!classData) return error(res, 'Class not found', 404);
  success(res, { class: classData });
});

export const updateClass = asyncHandler(async (req, res) => {
  const { name, section, classTeacher } = req.body;
  const classData = await Class.findByIdAndUpdate(req.params.id, { name, section, classTeacher }, { new: true });
  if (!classData) return error(res, 'Class not found', 404);
  success(res, { class: classData });
});

export const deleteClass = asyncHandler(async (req, res) => {
  const classData = await Class.findByIdAndDelete(req.params.id);
  if (!classData) return error(res, 'Class not found', 404);
  success(res, { message: 'Class deleted successfully' });
});
