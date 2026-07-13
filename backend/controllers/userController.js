import User from '../models/User.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const getUsers = asyncHandler(async (req, res) => {
  const users = await User.find().select('-password');
  success(res, { users });
});

export const getUserStats = asyncHandler(async (req, res) => {
  const [adminCount, teacherCount, studentCount] = await Promise.all([
    User.countDocuments({ role: 'admin' }),
    User.countDocuments({ role: 'teacher' }),
    User.countDocuments({ role: 'student' })
  ]);
  success(res, { stats: { adminCount, teacherCount, studentCount } });
});

export const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select('-password');
  if (!user) return error(res, 'User not found', 404);
  success(res, { user });
});

export const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return error(res, 'User not found', 404);
  success(res, { message: 'User deleted successfully' });
});
