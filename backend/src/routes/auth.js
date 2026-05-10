const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/User');
const Institution = require('../models/Institution');
const { generateToken, auth } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.post('/login', [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('institution');
    if (!user) return res.status(401).json({ error: 'Invalid email or password.' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(401).json({ error: 'Invalid email or password.' });

    if (!user.isActive) return res.status(403).json({ error: 'Account is deactivated.' });

    user.lastLogin = new Date();
    await user.save();

    const token = generateToken(user._id);
    res.json({ token, user: user.toJSON() });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/register/institution', [
  body('name').trim().notEmpty(),
  body('email').isEmail().normalizeEmail(),
  body('password').isLength({ min: 6 }),
  body('institutionName').trim().notEmpty(),
  body('token').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const { name, email, password, token, institutionName, phone, address, city, state, pincode, website } = req.body;

    const institution = await Institution.findOne({ registrationToken: token });
    if (!institution) return res.status(400).json({ error: 'Invalid registration token.' });
    if (institution.isOnboarded) return res.status(400).json({ error: 'This registration link has already been used.' });

    const existingUser = await User.findOne({ email });
    if (existingUser) return res.status(400).json({ error: 'Email already in use.' });

    institution.name = institutionName || institution.name;
    institution.phone = phone || institution.phone;
    institution.address = address || institution.address;
    institution.city = city || institution.city;
    institution.state = state || institution.state;
    institution.pincode = pincode || institution.pincode;
    institution.website = website || institution.website;
    institution.isOnboarded = true;
    institution.status = 'active';
    await institution.save();

    const user = new User({
      name,
      email,
      password,
      role: ROLES.INSTITUTION_ADMIN,
      institution: institution._id,
      phone: phone || '',
    });
    await user.save();

    const authToken = generateToken(user._id);
    res.status(201).json({ token: authToken, user: user.toJSON(), institution });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/me', auth, async (req, res) => {
  res.json({ user: req.user.toJSON() });
});

module.exports = router;
