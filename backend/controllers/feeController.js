import Fee from '../models/Fee.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createFee = asyncHandler(async (req, res) => {
  const { student, class: classId, feeType, amount, dueDate, month, year, remarks } = req.body;

  const fee = await Fee.create({
    student, class: classId, feeType, amount, dueDate: new Date(dueDate),
    month, year, remarks, recordedBy: req.user._id, status: 'unpaid', paidAmount: 0
  });

  const populatedFee = await Fee.findById(fee._id)
    .populate('student', 'rollNumber')
    .populate('student.user', 'name')
    .populate('class', 'name');

  res.status(201).json({ success: true, fee: populatedFee });
});

export const getFees = asyncHandler(async (req, res) => {
  const { class: classFilter, student: studentFilter, status, month, year, page = 1, limit = 20 } = req.query;
  const query = {};

  if (classFilter) query.class = classFilter;
  if (studentFilter) query.student = studentFilter;
  if (status) query.status = status;
  if (month) query.month = parseInt(month);
  if (year) query.year = parseInt(year);

  const [fees, total] = await Promise.all([
    Fee.find(query)
      .populate('student', 'rollNumber')
      .populate('student.user', 'name')
      .populate('class', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit)),
    Fee.countDocuments(query)
  ]);

  success(res, { fees, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

export const getFeeById = asyncHandler(async (req, res) => {
  const fee = await Fee.findById(req.params.id)
    .populate('student', 'rollNumber')
    .populate('student.user', 'name email phone')
    .populate('class', 'name');

  if (!fee) return error(res, 'Fee record not found', 404);
  success(res, { fee });
});

export const updateFee = asyncHandler(async (req, res) => {
  let fee = await Fee.findById(req.params.id);
  if (!fee) return error(res, 'Fee record not found', 404);

  const { paidAmount, paymentMode, paymentDate, status, remarks } = req.body;

  if (paidAmount !== undefined) fee.paidAmount = paidAmount;
  if (paymentMode) fee.paymentMode = paymentMode;
  if (paymentDate) fee.paymentDate = new Date(paymentDate);
  if (remarks !== undefined) fee.remarks = remarks;

  if (paidAmount !== undefined || status) {
    if (status) {
      fee.status = status;
    } else if (paidAmount >= fee.amount) {
      fee.status = 'paid';
      if (!fee.paymentDate) fee.paymentDate = new Date();
    } else if (paidAmount > 0) {
      fee.status = 'partial';
      if (!fee.paymentDate) fee.paymentDate = new Date();
    } else {
      const now = new Date();
      fee.status = now > fee.dueDate ? 'overdue' : 'unpaid';
    }
  }

  if (fee.paidAmount >= fee.amount && fee.status !== 'paid') {
    fee.status = 'paid';
    if (!fee.paymentDate) fee.paymentDate = new Date();
  }

  await fee.save();

  const updatedFee = await Fee.findById(fee._id)
    .populate('student', 'rollNumber')
    .populate('student.user', 'name')
    .populate('class', 'name');

  success(res, { fee: updatedFee });
});

export const deleteFee = asyncHandler(async (req, res) => {
  const fee = await Fee.findByIdAndDelete(req.params.id);
  if (!fee) return error(res, 'Fee record not found', 404);
  success(res, { message: 'Fee record deleted successfully' });
});

export const getFeeStats = asyncHandler(async (req, res) => {
  const { class: classFilter, month, year } = req.query;
  const match = {};
  if (classFilter) match.class = classFilter;
  if (month) match.month = parseInt(month);
  if (year) match.year = parseInt(year);

  const stats = await Fee.aggregate([
    { $match: match },
    { $group: {
      _id: null,
      totalAmount: { $sum: '$amount' },
      totalCollected: { $sum: '$paidAmount' },
      totalPending: { $sum: { $subtract: ['$amount', '$paidAmount'] } },
      count: { $sum: 1 },
      paidCount: { $sum: { $cond: [{ $eq: ['$status', 'paid'] }, 1, 0] } },
      unpaidCount: { $sum: { $cond: [{ $eq: ['$status', 'unpaid'] }, 1, 0] } },
      partialCount: { $sum: { $cond: [{ $eq: ['$status', 'partial'] }, 1, 0] } },
      overdueCount: { $sum: { $cond: [{ $eq: ['$status', 'overdue'] }, 1, 0] } }
    }}
  ]);

  success(res, {
    stats: stats[0] || {
      totalAmount: 0, totalCollected: 0, totalPending: 0,
      count: 0, paidCount: 0, unpaidCount: 0, partialCount: 0, overdueCount: 0
    }
  });
});
