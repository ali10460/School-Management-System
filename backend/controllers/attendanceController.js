import Attendance from '../models/Attendance.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createAttendance = asyncHandler(async (req, res) => {
  const { student, class: classId, date, status, notes } = req.body;
  const attendance = await Attendance.create({
    student, class: classId, date: new Date(date), status, notes, markedBy: req.user._id
  });
  res.status(201).json({ success: true, attendance });
});

export const createBulkAttendance = asyncHandler(async (req, res) => {
  const { class: classId, date, records } = req.body;

  const attendanceRecords = records.map(record => ({
    student: record.student, class: classId, date: new Date(date),
    status: record.status, notes: record.notes, markedBy: req.user._id
  }));

  await Attendance.deleteMany({ class: classId, date: new Date(date) });
  const attendances = await Attendance.insertMany(attendanceRecords);

  res.status(201).json({ success: true, attendances });
});

export const getAttendance = asyncHandler(async (req, res) => {
  const { class: classFilter, student: studentFilter, date, startDate, endDate } = req.query;
  const query = {};

  if (classFilter) query.class = classFilter;
  if (studentFilter) query.student = studentFilter;
  if (date) query.date = new Date(date);
  if (startDate && endDate) {
    query.date = { $gte: new Date(startDate), $lte: new Date(endDate) };
  }

  const attendances = await Attendance.find(query)
    .populate('student', 'rollNumber')
    .populate('student.user', 'name')
    .populate('class', 'name')
    .sort({ date: -1 });

  success(res, { attendances });
});

export const getAttendanceReport = asyncHandler(async (req, res) => {
  const { class: classFilter, student: studentFilter, month, year } = req.query;

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0);

  const matchQuery = { date: { $gte: startDate, $lte: endDate } };
  if (classFilter) matchQuery.class = classFilter;
  if (studentFilter) matchQuery.student = studentFilter;

  const report = await Attendance.aggregate([
    { $match: matchQuery },
    { $group: {
      _id: '$student',
      present: { $sum: { $cond: [{ $eq: ['$status', 'present'] }, 1, 0] } },
      absent: { $sum: { $cond: [{ $eq: ['$status', 'absent'] }, 1, 0] } },
      late: { $sum: { $cond: [{ $eq: ['$status', 'late'] }, 1, 0] } }
    }},
    { $lookup: { from: 'students', localField: '_id', foreignField: '_id', as: 'studentData' } },
    { $unwind: '$studentData' },
    { $lookup: { from: 'users', localField: 'studentData.user', foreignField: '_id', as: 'userData' } },
    { $unwind: '$userData' },
    { $project: {
      _id: 1, name: '$userData.name', rollNumber: '$studentData.rollNumber',
      present: 1, absent: 1, late: 1,
      total: { $add: ['$present', '$absent', '$late'] }
    }}
  ]);

  success(res, { report });
});

export const getAttendanceById = asyncHandler(async (req, res) => {
  const attendance = await Attendance.findById(req.params.id)
    .populate('student', 'rollNumber')
    .populate('student.user', 'name')
    .populate('class', 'name')
    .populate('markedBy', 'user')
    .populate('markedBy.user', 'name');

  if (!attendance) return error(res, 'Attendance not found', 404);
  success(res, { attendance });
});
