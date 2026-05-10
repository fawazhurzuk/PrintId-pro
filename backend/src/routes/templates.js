const express = require('express');
const { body, validationResult } = require('express-validator');
const Template = require('../models/Template');
const { auth, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { orientation } = req.query;
    const filter = {};
    if (orientation) filter.orientation = orientation;

    const templates = await Template.find(filter).sort({ isDefault: -1, createdAt: -1 });
    res.json({ templates });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const template = await Template.findById(req.params.id);
    if (!template) return res.status(404).json({ error: 'Template not found.' });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), [
  body('name').trim().notEmpty(),
  body('orientation').isIn(['horizontal', 'vertical']),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const template = new Template({
      ...req.body,
      createdBy: req.user._id,
    });
    await template.save();
    res.status(201).json({ template });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), async (req, res) => {
  try {
    const template = await Template.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!template) return res.status(404).json({ error: 'Template not found.' });
    res.json({ template });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/:id', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), async (req, res) => {
  try {
    await Template.findByIdAndDelete(req.params.id);
    res.json({ message: 'Template deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
