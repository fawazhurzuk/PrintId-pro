const express = require('express');
const Institution = require('../models/Institution');
const Student = require('../models/Student');
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');

const router = express.Router();

router.get('/admin', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), async (req, res) => {
  try {
    const [
      totalInstitutions,
      activeInstitutions,
      totalStudents,
      totalBatches,
      pendingBatches,
      completedBatches,
      unreadNotifications,
    ] = await Promise.all([
      Institution.countDocuments(),
      Institution.countDocuments({ status: 'active' }),
      Student.countDocuments(),
      Batch.countDocuments(),
      Batch.countDocuments({ status: { $in: ['finalized', 'printing'] } }),
      Batch.countDocuments({ status: 'completed' }),
      Notification.countDocuments({ recipientRole: ROLES.PRINT_SHOP_ADMIN, isRead: false }),
    ]);

    const recentBatches = await Batch.find()
      .populate('institution', 'name')
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      stats: {
        totalInstitutions,
        activeInstitutions,
        totalStudents,
        totalBatches,
        pendingBatches,
        completedBatches,
        unreadNotifications,
      },
      recentBatches,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/institution', auth, requireRole(ROLES.INSTITUTION_ADMIN, ROLES.INSTITUTION_MEMBER), async (req, res) => {
  try {
    const institutionId = req.user.institution;

    const [
      totalStudents,
      draftStudents,
      submittedStudents,
      reviewedStudents,
      finalizedStudents,
      totalBatches,
    ] = await Promise.all([
      Student.countDocuments({ institution: institutionId }),
      Student.countDocuments({ institution: institutionId, status: 'draft' }),
      Student.countDocuments({ institution: institutionId, status: 'submitted' }),
      Student.countDocuments({ institution: institutionId, status: 'reviewed' }),
      Student.countDocuments({ institution: institutionId, status: 'finalized' }),
      Batch.countDocuments({ institution: institutionId }),
    ]);

    const institution = await Institution.findById(institutionId);

    const recentBatches = await Batch.find({ institution: institutionId })
      .sort({ createdAt: -1 })
      .limit(5);

    res.json({
      institution,
      stats: {
        totalStudents,
        draftStudents,
        submittedStudents,
        reviewedStudents,
        finalizedStudents,
        totalBatches,
      },
      recentBatches,
    });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
