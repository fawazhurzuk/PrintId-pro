const express = require('express');
const Notification = require('../models/Notification');
const { auth } = require('../middleware/auth');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const filter = {
      $or: [
        { recipient: req.user._id },
        { recipientRole: req.user.role },
      ],
    };
    const { unread } = req.query;
    if (unread === 'true') filter.isRead = false;

    const notifications = await Notification.find(filter)
      .populate('relatedInstitution', 'name')
      .sort({ createdAt: -1 })
      .limit(50);

    const unreadCount = await Notification.countDocuments({ ...filter, isRead: false });

    res.json({ notifications, unreadCount });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id/read', auth, async (req, res) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { isRead: true });
    res.json({ message: 'Marked as read.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/read-all', auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { $or: [{ recipient: req.user._id }, { recipientRole: req.user.role }] },
      { isRead: true }
    );
    res.json({ message: 'All marked as read.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
