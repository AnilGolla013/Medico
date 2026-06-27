const express = require('express');
const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const Doctor = require('../models/Doctor');

const router = express.Router();

// @desc    Get all hospitals
// @route   GET /api/public/hospitals
// @access  Public
router.get('/hospitals', async (req, res, next) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json({ success: true, data: hospitals });
  } catch (err) {
    next(err);
  }
});

// @desc    Get all departments
// @route   GET /api/public/departments
// @access  Public
router.get('/departments', async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.status(200).json({ success: true, data: departments });
  } catch (err) {
    next(err);
  }
});

// @desc    Get all approved doctors
// @route   GET /api/public/doctors
// @access  Public
router.get('/doctors', async (req, res, next) => {
  try {
    const { specialization, hospital, search } = req.query;
    let query = { status: 'Approved' };

    if (specialization) {
      query.specialization = specialization;
    }
    if (hospital) {
      query.hospital = hospital;
    }

    let doctors = await Doctor.find(query)
      .populate('user', 'name email')
      .populate('specialization', 'name icon')
      .populate('hospital', 'name location');

    // Simple text search by doctor name
    if (search) {
      doctors = doctors.filter(doc => 
        doc.user && doc.user.name.toLowerCase().includes(search.toLowerCase())
      );
    }

    res.status(200).json({ success: true, count: doctors.length, data: doctors });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
