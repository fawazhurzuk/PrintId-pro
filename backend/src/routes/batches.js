const express = require('express');
const Batch = require('../models/Batch');
const Student = require('../models/Student');
const Institution = require('../models/Institution');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const { ROLES } = require('../config/constants');
const archiver = require('archiver');
const path = require('path');
const fs = require('fs');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { status, institution, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role !== ROLES.PRINT_SHOP_ADMIN) {
      filter.institution = req.user.institution;
    } else if (institution) {
      filter.institution = institution;
    }

    if (status) filter.status = status;

    const batches = await Batch.find(filter)
      .populate('institution', 'name email logo')
      .populate('finalizedBy', 'name')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Batch.countDocuments(filter);

    res.json({ batches, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id)
      .populate('institution', 'name email logo principalName principalSignature')
      .populate('finalizedBy', 'name');

    if (!batch) return res.status(404).json({ error: 'Batch not found.' });

    const students = await Student.find({ batch: batch._id })
      .sort({ className: 1, rollNumber: 1 });

    res.json({ batch, students });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id/status', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Batch not found.' });

    batch.status = req.body.status;
    if (req.body.status === 'completed') batch.printedAt = new Date();
    await batch.save();

    if (req.body.status === 'completed') {
      await Notification.create({
        type: 'batch_completed',
        title: 'Print Order Completed',
        message: `Your batch of ${batch.totalCards} ID cards has been printed.`,
        recipientRole: ROLES.INSTITUTION_ADMIN,
        relatedBatch: batch._id,
        relatedInstitution: batch.institution,
      });
    }

    res.json({ batch });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id/export/csv', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('institution', 'name');
    if (!batch) return res.status(404).json({ error: 'Batch not found.' });

    const students = await Student.find({ batch: batch._id })
      .sort({ className: 1, section: 1, rollNumber: 1 });

    const csvHeader = 'Sr.No,First Name,Last Name,Father Name,Mother Name,Date of Birth,Gender,Blood Group,Class,Section,Roll Number,Admission Number,Address,Phone,Emergency Contact,Photo Filename\n';
    const csvRows = students.map((s, i) => {
      const photoFilename = s.photo ? path.basename(s.photo) : '';
      return `${i + 1},"${s.firstName}","${s.lastName}","${s.fatherName}","${s.motherName}","${s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : ''}","${s.gender}","${s.bloodGroup}","${s.className}","${s.section}","${s.rollNumber}","${s.admissionNumber}","${s.address}","${s.phone}","${s.emergencyContact}","${photoFilename}"`;
    }).join('\n');

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename="${batch.institution.name}-batch-${batch._id}.csv"`);
    res.send(csvHeader + csvRows);
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id/export/zip', auth, requireRole(ROLES.PRINT_SHOP_ADMIN), async (req, res) => {
  try {
    const batch = await Batch.findById(req.params.id).populate('institution', 'name');
    if (!batch) return res.status(404).json({ error: 'Batch not found.' });

    const students = await Student.find({ batch: batch._id })
      .sort({ className: 1, section: 1, rollNumber: 1 });

    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Content-Disposition', `attachment; filename="${batch.institution.name}-batch-${batch._id}.zip"`);

    const archive = archiver('zip', { zlib: { level: 9 } });
    archive.pipe(res);

    const csvHeader = 'Sr.No,First Name,Last Name,Father Name,Mother Name,Date of Birth,Gender,Blood Group,Class,Section,Roll Number,Admission Number,Address,Phone,Emergency Contact,Photo Filename\n';
    const csvRows = students.map((s, i) => {
      const photoFilename = s.photo ? `${i + 1}_${s.firstName}_${s.lastName}${path.extname(s.photo)}` : '';
      return `${i + 1},"${s.firstName}","${s.lastName}","${s.fatherName}","${s.motherName}","${s.dateOfBirth ? new Date(s.dateOfBirth).toLocaleDateString() : ''}","${s.gender}","${s.bloodGroup}","${s.className}","${s.section}","${s.rollNumber}","${s.admissionNumber}","${s.address}","${s.phone}","${s.emergencyContact}","${photoFilename}"`;
    }).join('\n');

    archive.append(csvHeader + csvRows, { name: 'student_data.csv' });

    students.forEach((s, i) => {
      if (s.photo) {
        const photoPath = path.join(__dirname, '../../', s.photo);
        if (fs.existsSync(photoPath)) {
          const photoFilename = `${i + 1}_${s.firstName}_${s.lastName}${path.extname(s.photo)}`;
          archive.file(photoPath, { name: `photos/${photoFilename}` });
        }
      }
    });

    await archive.finalize();
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
