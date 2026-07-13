import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
  class: { type: mongoose.Schema.Types.ObjectId, ref: 'Class', required: true },
  feeType: { type: String, enum: ['tuition', 'transport', 'library', 'lab', 'sports', 'other'], required: true },
  amount: { type: Number, required: true },
  paidAmount: { type: Number, default: 0 },
  dueDate: { type: Date, required: true },
  paymentDate: { type: Date },
  paymentMode: { type: String, enum: ['cash', 'online', 'cheque', 'bank transfer'] },
  status: { type: String, enum: ['unpaid', 'paid', 'partial', 'overdue'], default: 'unpaid' },
  receiptNumber: { type: String, unique: true },
  month: { type: Number },
  year: { type: Number },
  remarks: { type: String },
  recordedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

feeSchema.index({ class: 1, status: 1 });
feeSchema.index({ student: 1 });

feeSchema.pre('save', function(next) {
  if (!this.receiptNumber) {
    this.receiptNumber = 'RCP-' + Date.now() + '-' + Math.random().toString(36).substring(2, 6).toUpperCase();
  }
  next();
});

const Fee = mongoose.model('Fee', feeSchema);
export default Fee;
