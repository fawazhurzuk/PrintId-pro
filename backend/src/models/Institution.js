const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const institutionSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, trim: true },
  phone: { type: String, default: '' },
  address: { type: String, default: '' },
  city: { type: String, default: '' },
  state: { type: String, default: '' },
  pincode: { type: String, default: '' },
  logo: { type: String, default: '' },
  principalName: { type: String, default: '' },
  principalSignature: { type: String, default: '' },
  website: { type: String, default: '' },
  registrationToken: { type: String, default: () => uuidv4() },
  isOnboarded: { type: Boolean, default: false },
  status: { type: String, enum: ['active', 'inactive', 'pending'], default: 'pending' },
  onboardedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  studentCount: { type: Number, default: 0 },
  selectedTemplate: { type: mongoose.Schema.Types.ObjectId, ref: 'Template', default: null },
  templateOrientation: { type: String, enum: ['horizontal', 'vertical'], default: 'horizontal' },
}, { timestamps: true });

module.exports = mongoose.model('Institution', institutionSchema);
