const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
  firstName: { type: String, required: true, trim: true },
  lastName: { type: String, required: true, trim: true },
  fatherName: { type: String, default: '' },
  motherName: { type: String, default: '' },
  dateOfBirth: { type: Date, default: null },
  gender: { type: String, enum: ['male', 'female', 'other'], default: 'male' },
  bloodGroup: { type: String, default: '' },
  className: { type: String, required: true },
  section: { type: String, default: '' },
  rollNumber: { type: String, required: true },
  admissionNumber: { type: String, default: '' },
  address: { type: String, default: '' },
  phone: { type: String, default: '' },
  emergencyContact: { type: String, default: '' },
  photo: { type: String, default: '' },
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  status: {
    type: String,
    enum: ['draft', 'submitted', 'reviewed', 'finalized'],
    default: 'draft',
  },
  submittedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  reviewNotes: { type: String, default: '' },
  batch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
}, { timestamps: true });

studentSchema.index({ institution: 1, status: 1 });
studentSchema.index({ institution: 1, className: 1 });

module.exports = mongoose.model('Student', studentSchema);
