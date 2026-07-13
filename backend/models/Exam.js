import mongoose from 'mongoose';

const examSchema = new mongoose.Schema({
  name: { type: String, required: true },
  type: { type: String, enum: ['midterm', 'final', 'quiz', 'unit-test'], required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  date: { type: Date, required: true },
  totalMarks: { type: Number, required: true },
  passingMarks: { type: Number, required: true },
  duration: { type: Number },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

examSchema.index({ class: 1, subject: 1 });

const Exam = mongoose.model('Exam', examSchema);
export default Exam;
