import Student from '../models/Student.js';
import User from '../models/User.js';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

export const createStudent = asyncHandler(async(req, res) => {
    const { name, email, phone, password, rollNumber, class: classId, section, parentName, parentPhone, parentEmail, address, dateOfBirth, gender, bloodGroup, emergencyContact } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) return error(res, 'User already exists with this email', 400);

    const existingRoll = await Student.findOne({ rollNumber });
    if (existingRoll) return error(res, 'Roll number already exists', 400);

    const user = await User.create({ name, email, phone, password, role: 'student' });
    const student = await Student.create({ user: user._id, rollNumber, class: classId, section, parentName, parentPhone, parentEmail, address, dateOfBirth, gender, bloodGroup, emergencyContact });

    res.status(201).json({
        success: true,
        student,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
});

export const getStudents = asyncHandler(async(req, res) => {
    const { page = 1, limit = 10, search, class: classFilter, section: sectionFilter } = req.query;
    const query = {};

    if (search) {
        const users = await User.find({ name: { $regex: search, $options: 'i' }, role: 'student' }).select('_id');
        query.user = { $in: users.map(u => u._id) };
    }
    if (classFilter) query.class = classFilter;
    if (sectionFilter) query.section = sectionFilter;

    const [students, total] = await Promise.all([
        Student.find(query)
        .populate('user', 'name email phone profilePicture')
        .populate('class', 'name section')
        .skip((page - 1) * limit)
        .limit(parseInt(limit)),
        Student.countDocuments(query)
    ]);

    success(res, { students, total, page: parseInt(page), pages: Math.ceil(total / limit) });
});

export const getStudentById = asyncHandler(async(req, res) => {
    const student = await Student.findById(req.params.id)
        .populate('user', 'name email phone profilePicture')
        .populate('class', 'name section');
    if (!student) return error(res, 'Student not found', 404);
    success(res, { student });
});

export const updateStudent = asyncHandler(async(req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return error(res, 'Student not found', 404);

    const { name, email, phone, rollNumber, class: classId, section, parentName, parentPhone, parentEmail, address, dateOfBirth, gender, bloodGroup, emergencyContact } = req.body;

    await Promise.all([
        User.findByIdAndUpdate(student.user, { name, email, phone }),
        Student.findByIdAndUpdate(req.params.id, { rollNumber, class: classId, section, parentName, parentPhone, parentEmail, address, dateOfBirth, gender, bloodGroup, emergencyContact, updatedAt: Date.now() })
    ]);

    const updatedStudent = await Student.findById(req.params.id)
        .populate('user', 'name email phone profilePicture')
        .populate('class', 'name section');
    success(res, { student: updatedStudent });
});

export const deleteStudent = asyncHandler(async(req, res) => {
    const student = await Student.findById(req.params.id);
    if (!student) return error(res, 'Student not found', 404);

    await Promise.all([
        User.findByIdAndDelete(student.user),
        Student.findByIdAndDelete(req.params.id)
    ]);

    success(res, { message: 'Student deleted successfully' });
});