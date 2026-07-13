import User from '../models/User.js';
import jwt from 'jsonwebtoken';

import { asyncHandler } from '../utils/asyncHandler.js';
import { success, error } from '../utils/response.js';

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRE });
};


export const register = asyncHandler(async(req, res) => {
    const { name, email, phone, password, role } = req.body;

    if (role === 'admin') return error(res, 'Cannot register as admin', 400);

    const existingUser = await User.findOne({ email });
    if (existingUser) return error(res, 'User already exists with this email', 400);

    const user = await User.create({ name, email, phone, password, role });
    const token = generateToken(user._id);

    res.status(201).json({
        success: true,
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
});

export const login = asyncHandler(async(req, res) => {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !(await user.matchPassword(password))) {
        return error(res, 'Invalid email or password', 401);
    }

    const token = generateToken(user._id);

    success(res, {
        token,
        user: { id: user._id, name: user.name, email: user.email, role: user.role, profilePicture: user.profilePicture }
    });
});

export const getMe = asyncHandler(async(req, res) => {
    const user = await User.findById(req.user._id);
    success(res, { user });
});

export const updateProfile = asyncHandler(async(req, res) => {
    const { name, phone, profilePicture } = req.body;
    const user = await User.findByIdAndUpdate(
        req.user._id, { name, phone, profilePicture }, { new: true, runValidators: true }
    );
    success(res, { user });
});

export const updatePassword = asyncHandler(async(req, res) => {
    const { currentPassword, newPassword } = req.body;
    const user = await User.findById(req.user._id);

    if (!(await user.matchPassword(currentPassword))) {
        return error(res, 'Current password is incorrect', 400);
    }

    user.password = newPassword;
    await user.save();
    success(res, { message: 'Password updated successfully' });
});



