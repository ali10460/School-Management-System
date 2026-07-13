import mongoose from 'mongoose';

const classSchema = new mongoose.Schema({
  name: { type: String, required: true, unique: true },
  section: { type: String },
  classTeacher: { type: mongoose.Schema.Types.ObjectId, ref: 'Teacher' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const Class = mongoose.model('Class', classSchema);
export default Class;
