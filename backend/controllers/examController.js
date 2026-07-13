import Exam from '../models/Exam.js';
import Grade from '../models/Grade.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createExam = asyncHandler(async(req, res) => {
    const { name, type, class: classId, subject, date, totalMarks, passingMarks, duration } = req.body;

    const exam = await Exam.create({
        name,
        type,
        class: classId,
        subject,
        date: new Date(date),
        totalMarks,
        passingMarks,
        duration,
        createdBy: req.user._id
    });

    res.status(201).json({ success: true, exam });
});

export const getExams = asyncHandler(async(req, res) => {
    const { class: classFilter, subject: subjectFilter } = req.query;
    const query = {};
    if (classFilter) query.class = classFilter;
    if (subjectFilter) query.subject = subjectFilter;

    const exams = await Exam.find(query)
        .populate('class', 'name')
        .populate('subject', 'name')
        .populate('createdBy', 'user')
        .populate('createdBy.user', 'name')
        .sort({ date: -1 });

    success(res, { exams });
});

export const getExamById = asyncHandler(async(req, res) => {
    const exam = await Exam.findById(req.params.id)
        .populate('class', 'name')
        .populate('subject', 'name')
        .populate('createdBy', 'user')
        .populate('createdBy.user', 'name');

    if (!exam) return error(res, 'Exam not found', 404);
    success(res, { exam });
});

export const updateExam = asyncHandler(async(req, res) => {
    const { name, type, class: classId, subject, date, totalMarks, passingMarks, duration } = req.body;
    const exam = await Exam.findByIdAndUpdate(req.params.id, { name, type, class: classId, subject, date, totalMarks, passingMarks, duration }, { new: true });
    if (!exam) return error(res, 'Exam not found', 404);
    success(res, { exam });
});

export const deleteExam = asyncHandler(async(req, res) => {
    const exam = await Exam.findByIdAndDelete(req.params.id);
    if (!exam) return error(res, 'Exam not found', 404);

    await Grade.deleteMany({ exam: req.params.id });
    success(res, { message: 'Exam deleted successfully' });
});

export const createGrades = asyncHandler(async(req, res) => {
    const { grades } = req.body;
    const exam = await Exam.findById(req.params.id);
    if (!exam) return error(res, 'Exam not found', 404);

    const gradeRecords = grades.map(g => {
        const { grade, percentage } = Grade.calculateGrade(g.marks, exam.totalMarks);
        return {
            student: g.student,
            exam: req.params.id,
            subject: exam.subject,
            marks: g.marks,
            grade,
            percentage,
            remarks: g.remarks,
            gradedBy: req.user._id
        };
    });

    await Grade.deleteMany({ exam: req.params.id });
    const savedGrades = await Grade.insertMany(gradeRecords);

    res.status(201).json({ success: true, grades: savedGrades });
});

export const getGrades = asyncHandler(async(req, res) => {
    const grades = await Grade.find({ exam: req.params.id })
        .populate('student', 'rollNumber')
        .populate('student.user', 'name')
        .populate('gradedBy', 'user')
        .populate('gradedBy.user', 'name')
        .sort({ marks: -1 });

    success(res, { grades });
});