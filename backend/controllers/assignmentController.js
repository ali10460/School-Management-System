import { Assignment, Submission } from '../models/Assignment.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createAssignment = asyncHandler(async (req, res) => {
  const { title, description, class: classId, subject, dueDate, totalMarks, attachments } = req.body;
  const assignment = await Assignment.create({
    title, description, class: classId, subject,
    dueDate: new Date(dueDate), totalMarks, attachments, createdBy: req.user._id
  });

  res.status(201).json({ success: true, assignment });
});

export const getAssignments = asyncHandler(async (req, res) => {
  const { class: classFilter, subject: subjectFilter, status } = req.query;
  const query = {};
  if (classFilter) query.class = classFilter;
  if (subjectFilter) query.subject = subjectFilter;

  let assignments = await Assignment.find(query)
    .populate('class', 'name')
    .populate('subject', 'name')
    .populate('createdBy', 'user')
    .populate('createdBy.user', 'name')
    .sort({ dueDate: -1 });

  if (status === 'active') {
    assignments = assignments.filter(a => new Date(a.dueDate) >= new Date());
  } else if (status === 'past') {
    assignments = assignments.filter(a => new Date(a.dueDate) < new Date());
  }

  success(res, { assignments });
});

export const getAssignmentById = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findById(req.params.id)
    .populate('class', 'name')
    .populate('subject', 'name')
    .populate('createdBy', 'user')
    .populate('createdBy.user', 'name');

  if (!assignment) return error(res, 'Assignment not found', 404);
  success(res, { assignment });
});

export const updateAssignment = asyncHandler(async (req, res) => {
  const { title, description, class: classId, subject, dueDate, totalMarks, attachments } = req.body;
  const assignment = await Assignment.findByIdAndUpdate(req.params.id, { title, description, class: classId, subject, dueDate, totalMarks, attachments }, { new: true });
  if (!assignment) return error(res, 'Assignment not found', 404);
  success(res, { assignment });
});

export const deleteAssignment = asyncHandler(async (req, res) => {
  const assignment = await Assignment.findByIdAndDelete(req.params.id);
  if (!assignment) return error(res, 'Assignment not found', 404);

  await Submission.deleteMany({ assignment: req.params.id });
  success(res, { message: 'Assignment deleted successfully' });
});

export const submitAssignment = asyncHandler(async (req, res) => {
  const { submissionText, fileUrl } = req.body;
  const assignment = await Assignment.findById(req.params.id);
  if (!assignment) return error(res, 'Assignment not found', 404);

  const existingSubmission = await Submission.findOne({ assignment: req.params.id, student: req.user._id });
  if (existingSubmission) return error(res, 'You have already submitted this assignment', 400);

  const isLate = new Date() > new Date(assignment.dueDate);
  const submission = await Submission.create({
    assignment: req.params.id, student: req.user._id,
    submissionText, fileUrl, status: isLate ? 'late' : 'submitted'
  });

  res.status(201).json({ success: true, submission });
});

export const getSubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ assignment: req.params.id })
    .populate('student', 'rollNumber')
    .populate('student.user', 'name')
    .sort({ submittedAt: -1 });

  success(res, { submissions });
});

export const gradeSubmission = asyncHandler(async (req, res) => {
  const { marks, feedback } = req.body;
  const submission = await Submission.findByIdAndUpdate(req.params.id, { marks, feedback, status: 'graded', gradedBy: req.user._id }, { new: true })
    .populate('student', 'rollNumber')
    .populate('student.user', 'name');

  if (!submission) return error(res, 'Submission not found', 404);
  success(res, { submission });
});
