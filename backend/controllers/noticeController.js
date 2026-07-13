import Notice from '../models/Notice.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createNotice = asyncHandler(async (req, res) => {
  const { title, content, targetRole, targetClass, priority, attachments } = req.body;
  const notice = await Notice.create({
    title, content, postedBy: req.user._id,
    targetRole: targetRole || 'all', targetClass, priority, attachments
  });

  res.status(201).json({ success: true, notice });
});

export const getNotices = asyncHandler(async (req, res) => {
  const { role, class: classFilter } = req.query;
  let query = {};

  if (role === 'student') {
    query = { $or: [{ targetRole: 'all' }, { targetRole: 'student' }] };
  } else if (role === 'teacher') {
    query = { $or: [{ targetRole: 'all' }, { targetRole: 'teacher' }] };
  }

  if (classFilter) {
    query.$or = [{ targetClass: classFilter }, { targetClass: null }];
  }

  const notices = await Notice.find(query)
    .populate('postedBy', 'name')
    .populate('targetClass', 'name')
    .sort({ createdAt: -1 });

  success(res, { notices });
});

export const getNoticeById = asyncHandler(async (req, res) => {
  const notice = await Notice.findById(req.params.id)
    .populate('postedBy', 'name')
    .populate('targetClass', 'name');

  if (!notice) return error(res, 'Notice not found', 404);
  success(res, { notice });
});

export const updateNotice = asyncHandler(async (req, res) => {
  const { title, content, targetRole, targetClass, priority, attachments } = req.body;
  const notice = await Notice.findByIdAndUpdate(req.params.id, { title, content, targetRole, targetClass, priority, attachments }, { new: true });
  if (!notice) return error(res, 'Notice not found', 404);
  success(res, { notice });
});

export const deleteNotice = asyncHandler(async (req, res) => {
  const notice = await Notice.findByIdAndDelete(req.params.id);
  if (!notice) return error(res, 'Notice not found', 404);
  success(res, { message: 'Notice deleted successfully' });
});
