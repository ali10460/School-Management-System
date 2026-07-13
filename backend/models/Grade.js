import mongoose from 'mongoose';

const gradeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  exam: { type: mongoose.Schema.Types.ObjectId, ref: 'Exam', required: true },
  subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
  marks: { type: Number, required: true },
  grade: { type: String },
  percentage: { type: Number },
  remarks: { type: String },
  gradedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

gradeSchema.index({ student: 1, exam: 1 });

const calculateGrade = (marks, totalMarks) => {
  const percentage = (marks / totalMarks) * 100;
  let grade = 'F';
  if (percentage >= 90) grade = 'A+';
  else if (percentage >= 80) grade = 'A';
  else if (percentage >= 70) grade = 'B+';
  else if (percentage >= 60) grade = 'B';
  else if (percentage >= 50) grade = 'C';
  else if (percentage >= 40) grade = 'D';
  return { grade, percentage: percentage.toFixed(2) };
};

gradeSchema.statics.calculateGrade = calculateGrade;

const Grade = mongoose.model('Grade', gradeSchema);
export default Grade;
