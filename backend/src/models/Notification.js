const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['batch_finalized', 'institution_registered', 'batch_completed', 'general'],
    required: true,
  },
  title: { type: String, required: true },
  message: { type: String, required: true },
  recipient: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  recipientRole: { type: String, default: '' },
  relatedBatch: { type: mongoose.Schema.Types.ObjectId, ref: 'Batch', default: null },
  relatedInstitution: { type: mongoose.Schema.Types.ObjectId, ref: 'Institution', default: null },
  isRead: { type: Boolean, default: false },
}, { timestamps: true });

notificationSchema.index({ recipientRole: 1, isRead: 1 });

module.exports = mongoose.model('Notification', notificationSchema);
