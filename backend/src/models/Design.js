const mongoose = require('mongoose');

const designSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  file: { type: String, required: true },
  fileType: { type: String, default: '' },
  orientation: { type: String, enum: ['horizontal', 'vertical'], required: true },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  previewImage: { type: String, default: '' },
  isActive: { type: Boolean, default: true },
}, { timestamps: true });

module.exports = mongoose.model('Design', designSchema);
