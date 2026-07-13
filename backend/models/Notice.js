import mongoose from 'mongoose';

const noticeSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  postedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  targetRole: { type: String, enum: ['all', 'teacher', 'student'], default: 'all' },
  targetClass: { type: mongoose.Schema.Types.ObjectId, ref: 'Class' },
  priority: { type: String, enum: ['normal', 'important', 'urgent'], default: 'normal' },
  attachments: [{ type: String }],
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

noticeSchema.index({ targetRole: 1, targetClass: 1 });

const Notice = mongoose.model('Notice', noticeSchema);
export default Notice;
