const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  orientation: { type: String, enum: ['horizontal', 'vertical'], required: true },
  isDefault: { type: Boolean, default: false },
  backgroundColor: { type: String, default: '#1E3A5F' },
  textColor: { type: String, default: '#FFFFFF' },
  accentColor: { type: String, default: '#0F9DC8' },
  headerText: { type: String, default: '' },
  footerText: { type: String, default: '' },
  showLogo: { type: Boolean, default: true },
  showPhoto: { type: Boolean, default: true },
  showSignature: { type: Boolean, default: true },
  fields: [{
    label: String,
    key: String,
    visible: { type: Boolean, default: true },
    order: Number,
  }],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  previewImage: { type: String, default: '' },
}, { timestamps: true });

module.exports = mongoose.model('Template', templateSchema);
