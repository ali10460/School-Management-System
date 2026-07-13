import Teacher from '../models/Teacher.js';
import User from '../models/User.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createTeacher = asyncHandler(async (req, res) => {

  const { name, email, phone, password, subjects, qualification, salary, experience, department, designation } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser){

    return error(res, 'User already exists with this email', 400);
  }

  const user = await User.create({ name, email, phone, password, role: 'teacher' });
  const teacher = await Teacher.create({ user: user._id, subjects, qualification, salary, experience, department, designation });

  res.status(201).json({ success: true, teacher, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
});



export const getTeachers = asyncHandler(async (req, res) => {
  const { page = 1, limit = 10, search } = req.query;
  const query = {};

  if (search) {
    const users = await User.find({ name: { $regex: search, $options: 'i' }, role: 'teacher' }).select('_id');
    query.user = { $in: users.map(u => u._id) };
  }
  const [teachers, total] = await Promise.all([
    Teacher.find(query)
      .populate('user', 'name email phone profilePicture')
      .populate('subjects', 'name code')
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    Teacher.countDocuments(query)
  ]);

  success(res, { teachers, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});




export const getTeacherById = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id)
    .populate('user', 'name email phone profilePicture')
    .populate('subjects', 'name code classAssigned');
  if (!teacher){
    return error(res, 'Teacher not found', 404);
  }
  success(res, { teacher });
});



export const updateTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return error(res, 'Teacher not found', 404);

  const { name, email, phone, subjects, qualification, salary, experience, department, designation } = req.body;

  await Promise.all([
    User.findByIdAndUpdate(teacher.user, { name, email, phone }),
    Teacher.findByIdAndUpdate(req.params.id, { subjects, qualification, salary, experience, department, designation, updatedAt: Date.now() })
  ]);

  const updatedTeacher = await Teacher.findById(req.params.id)
    .populate('user', 'name email phone profilePicture')
    .populate('subjects', 'name code');
  success(res, { teacher: updatedTeacher });
});

export const deleteTeacher = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findById(req.params.id);
  if (!teacher) return error(res, 'Teacher not found', 404);

  await Promise.all([
    User.findByIdAndDelete(teacher.user),
    Teacher.findByIdAndDelete(req.params.id)
  ]);

  success(res, { message: 'Teacher deleted successfully' });
});

export const getMySubjects = asyncHandler(async (req, res) => {
  const teacher = await Teacher.findOne({ user: req.user._id })
    .populate('subjects', 'name code classAssigned');
  if (!teacher) return error(res, 'Teacher profile not found', 404);
  success(res, { subjects: teacher.subjects });
});
