import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    rollNumber: {
        type: String,
        required: [true, 'Roll number is required'],
        unique: true,
        validate: {
            validator(v) {
                return /^[1-9]\d*$/.test(v);
            },
            message: 'Roll number must be a positive integer greater than 0'
        }
    },
    class: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Class',
        required: [true, 'Class is required']
    },
    section: {
        type: String,
        validate: {
            validator(v) {
                if (v == null || v === '') return true;
                return /^[A-Za-z0-9]+$/.test(v);
            },
            message: 'Section must be alphanumeric'
        }
    },
    parentName: {
        type: String,
        validate: {
            validator(v) {
                if (v == null || v === '') return true;
                return /^[A-Za-z\s]+$/.test(v);
            },
            message: 'Parent name must contain only letters'
        }
    },
    parentPhone: {
        type: String,
        validate: {
            validator(v) {
                if (v == null || v === '') return true;
                return /^\d+$/.test(v);
            },
            message: 'Please enter a valid numeric phone number'
        }
    },
    parentEmail: {
        type: String,
        validate: {
            validator(v) {
                if (v == null || v === '') return true;
                return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
            },
            message: 'Please enter a valid email address'
        }
    },
    address: {
        type: String,
        validate: {
            validator(v) {
                if (v == null || v === '') return true;
                return v.trim().length >= 5 && /[a-zA-Z]/.test(v);
            },
            message: 'Address must be at least 5 characters and contain letters'
        }
    },
    dateOfBirth: { type: Date },
    gender: { type: String, enum: ['male', 'female', 'other'] },
    bloodGroup: { type: String },
    emergencyContact: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

studentSchema.index({ class: 1 });

const Student = mongoose.model('Student', studentSchema);
export default Student;
