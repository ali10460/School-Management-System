import mongoose from 'mongoose';

const teacherSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subjects: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Subject' }],
    qualification: { type: String },
    joiningDate: { type: Date, default: Date.now },
    salary: { type: Number },
    experience: { type: String },
    department: { type: String },
    designation: { type: String },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }

});

teacherSchema.index({ subjects: 1 });

const Teacher = mongoose.model('Teacher', teacherSchema);
export default Teacher;