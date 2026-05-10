const express = require('express');
const { body, validationResult } = require('express-validator');
const Design = require('../models/Design');
const { auth, requireRole } = require('../middleware/auth');
const { uploadDesign } = require('../middleware/upload');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { orientation } = req.query;
    const filter = { isActive: true };
    if (orientation) filter.orientation = orientation;

    const designs = await Design.find(filter)
      .populate('uploadedBy', 'name')
      .sort({ createdAt: -1 });
    res.json({ designs });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), uploadDesign.single('design'), async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded.' });

    const design = new Design({
      name: req.body.name || req.file.originalname,
      file: `/uploads/designs/${req.file.filename}`,
      fileType: req.file.mimetype,
      orientation: req.body.orientation || 'horizontal',
      uploadedBy: req.user._id,
    });
    await design.save();
    res.status(201).json({ design });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/:id', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), async (req, res) => {
  try {
    await Design.findByIdAndUpdate(req.params.id, { isActive: false });
    res.json({ message: 'Design removed.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
