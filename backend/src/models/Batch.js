const mongoose = require('mongoose');

const batchSchema = new mongoose.Schema({
  institution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', required: true },
  students: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
  status: {
    type: String,
    enum: ['pending', 'reviewed', 'finalized', 'printing', 'completed'],
    default: 'pending',
  },
  totalCards: { type: Number, default: 0 },
  templateOrientation: { type: String, enum: ['horizontal', 'vertical'], default: 'horizontal' },
  finalizedAt: { type: Date, default: null },
  finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  printedAt: { type: Date, default: null },
  notes: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Batch', batchSchema);
