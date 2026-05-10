const express = require('express');
const { body, validationResult } = require('express-validator');
const Institution = require('../models/Institution');
const User = require('../models/User');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const { uploadLogo, uploadSignature } = require('../middleware/upload');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), async (req, res) => {
  try {
    const { status, search, page = 1, limit = 20 } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (search) filter.name = { $regex: search, $options: 'i' };

    const institutions = await Institution.find(filter)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Institution.countDocuments(filter);

    res.json({ institutions, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ error: 'Institution not found.' });

    if (req.user.role !== ROLES.PRINT_SHOP_ADMIN &&
        req.user.institution?.toString() !== institution._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    res.json({ institution });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, phone, address, city, state, pincode } = req.body;
    const institution = new Institution({
      name, email, phone, address, city, state, pincode,
      onboardedBy: req.user._id,
    });
    await institution.save();

    res.status(201).json({
      institution,
      registrationLink: `${process.env.FRONTEND_URL || 'http://localhost:3000'}/auth/register?token=${institution.registrationToken}`,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id', auth, async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ error: 'Institution not found.' });

    if (req.user.role !== ROLES.PRINT_SHOP_ADMIN &&
        req.user.institution?.toString() !== institution._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const updates = req.body;
    delete updates.registrationToken;
    Object.assign(institution, updates);
    await institution.save();

    res.json({ institution });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/:id/logo', auth, uploadLogo.single('logo'), async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ error: 'Institution not found.' });

    institution.logo = `/uploads/logos/${req.file.filename}`;
    await institution.save();
    res.json({ institution, logoUrl: institution.logo });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/:id/signature', auth, uploadSignature.single('signature'), async (req, res) => {
  try {
    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ error: 'Institution not found.' });

    institution.principalSignature = `/uploads/signatures/${req.file.filename}`;
    await institution.save();
    res.json({ institution, signatureUrl: institution.principalSignature });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/:id/members', auth, requireRole(ROLES.INSTITUTION_ADMIN), [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const institution = await Institution.findById(req.params.id);
    if (!institution) return res.status(404).json({ error: 'Institution not found.' });

    if (req.user.institution?.toString() !== institution._id.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use.' });

    const member = new User({
      name: req.body.name,
      email: req.body.email,
      password: req.body.password,
      role: ROLES.INSTITUTION_MEMBER,
      institution: institution._id,
      phone: req.body.phone || '',
    });
    await member.save();

    res.status(201).json({ member: member.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id/members', auth, async (req, res) => {
  try {
    const members = await User.find({
      institution: req.params.id,
      role: { $in: [ROLES.INSTITUTION_ADMIN, ROLES.INSTITUTION_MEMBER] },
    }).select('-password');
    res.json({ members });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
