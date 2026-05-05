const express = require('express');
const { body, validationResult } = require('express-validator');
const Student = require('../models/Student');
const Institution = require('../models/Institution');
const Batch = require('../models/Batch');
const Notification = require('../models/Notification');
const { auth, requireRole } = require('../middleware/auth');
const { uploadPhoto } = require('../middleware/upload');
const { ROLES, STUDENT_STATUS } = require('../config/constants');

const router = express.Router();

router.get('/', auth, async (req, res) => {
  try {
    const { institution, status, className, search, page = 1, limit = 20 } = req.query;
    const filter = {};

    if (req.user.role === ROLES.PRINT_SHOP_ADMIN) {
      if (institution) filter.institution = institution;
    } else {
      filter.institution = req.user.institution;
    }

    if (status) filter.status = status;
    if (className) filter.className = className;
    if (search) {
      filter.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { lastName: { $regex: search, $options: 'i' } },
        { rollNumber: { $regex: search, $options: 'i' } },
      ];
    }

    const students = await Student.find(filter)
      .populate('institution', 'name')
      .sort({ className: 1, rollNumber: 1 })
      .skip((page - 1) * limit)
      .limit(parseInt(limit));
    const total = await Student.countDocuments(filter);

    res.json({ students, total, page: parseInt(page), pages: Math.ceil(total / limit) });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.get('/:id', auth, async (req, res) => {
  try {
    const student = await Student.findById(req.params.id).populate('institution', 'name logo');
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/', auth, requireRole(ROLES.INSTITUTION_ADMIN, ROLES.INSTITUTION_MEMBER), [
  body('firstName').trim().notEmpty(),
  body('lastName').trim().notEmpty(),
  body('className').trim().notEmpty(),
  body('rollNumber').trim().notEmpty(),
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

    const student = new Student({
      ...req.body,
      institution: req.user.institution,
      submittedBy: req.user._id,
      status: STUDENT_STATUS.DRAFT,
    });
    await student.save();

    await Institution.findByIdAndUpdate(req.user.institution, { $inc: { studentCount: 1 } });

    res.status(201).json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id', auth, requireRole(ROLES.INSTITUTION_ADMIN, ROLES.INSTITUTION_MEMBER), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    if (student.institution.toString() !== req.user.institution?.toString()) {
      return res.status(403).json({ error: 'Access denied.' });
    }

    if (student.status === STUDENT_STATUS.FINALIZED) {
      return res.status(400).json({ error: 'Cannot edit finalized student records.' });
    }

    Object.assign(student, req.body);
    await student.save();

    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/:id/photo', auth, uploadPhoto.single('photo'), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    student.photo = `/uploads/photos/${req.file.filename}`;
    await student.save();
    res.json({ student, photoUrl: student.photo });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id/submit', auth, requireRole(ROLES.INSTITUTION_ADMIN, ROLES.INSTITUTION_MEMBER), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });
    student.status = STUDENT_STATUS.SUBMITTED;
    await student.save();
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/bulk/submit', auth, requireRole(ROLES.INSTITUTION_ADMIN, ROLES.INSTITUTION_MEMBER), async (req, res) => {
  try {
    const { studentIds } = req.body;
    await Student.updateMany(
      { _id: { $in: studentIds }, institution: req.user.institution },
      { status: STUDENT_STATUS.SUBMITTED }
    );
    res.json({ message: `${studentIds.length} students submitted for review.` });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/:id/review', auth, requireRole(ROLES.INSTITUTION_ADMIN), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    student.status = STUDENT_STATUS.REVIEWED;
    student.reviewedBy = req.user._id;
    student.reviewNotes = req.body.notes || '';
    await student.save();
    res.json({ student });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.put('/bulk/review', auth, requireRole(ROLES.INSTITUTION_ADMIN), async (req, res) => {
  try {
    const { studentIds } = req.body;
    await Student.updateMany(
      { _id: { $in: studentIds }, institution: req.user.institution },
      { status: STUDENT_STATUS.REVIEWED, reviewedBy: req.user._id }
    );
    res.json({ message: `${studentIds.length} students reviewed.` });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.post('/finalize', auth, requireRole(ROLES.INSTITUTION_ADMIN), async (req, res) => {
  try {
    const { studentIds, templateOrientation } = req.body;
    const institution = await Institution.findById(req.user.institution);

    const students = await Student.find({
      _id: { $in: studentIds },
      institution: req.user.institution,
      status: STUDENT_STATUS.REVIEWED,
    });

    if (students.length === 0) {
      return res.status(400).json({ error: 'No reviewed students found to finalize.' });
    }

    const batch = new Batch({
      institution: req.user.institution,
      students: students.map(s => s._id),
      totalCards: students.length,
      templateOrientation: templateOrientation || institution.templateOrientation || 'horizontal',
      status: 'finalized',
      finalizedAt: new Date(),
      finalizedBy: req.user._id,
    });
    await batch.save();

    await Student.updateMany(
      { _id: { $in: students.map(s => s._id) } },
      { status: STUDENT_STATUS.FINALIZED, batch: batch._id }
    );

    await Notification.create({
      type: 'batch_finalized',
      title: 'New Print Order',
      message: `${institution.name} has finalized ${students.length} ID cards for printing.`,
      recipientRole: ROLES.PRINT_SHOP_ADMIN,
      relatedBatch: batch._id,
      relatedInstitution: institution._id,
    });

    res.json({ batch, message: `${students.length} ID cards finalized for printing.` });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

router.delete('/:id', auth, requireRole(ROLES.INSTITUTION_ADMIN), async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Student not found.' });

    if (student.status === STUDENT_STATUS.FINALIZED) {
      return res.status(400).json({ error: 'Cannot delete finalized records.' });
    }

    await Student.findByIdAndDelete(req.params.id);
    await Institution.findByIdAndUpdate(student.institution, { $inc: { studentCount: -1 } });

    res.json({ message: 'Student deleted.' });
  } catch (error) {
    res.status(500).json({ error: 'Server error.' });
  }
});

module.exports = router;
