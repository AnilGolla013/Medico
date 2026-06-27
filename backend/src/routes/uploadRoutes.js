const express = require('express');
const path = require('path');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// @desc    Upload profile picture
// @route   POST /api/upload/profile-pic
// @access  Private
router.post('/profile-pic', protect, upload.single('profilePic'), async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded' });
    }
    
    const fileUrl = `/uploads/profiles/${req.file.filename}`;
    
    // Update profile in the correct model
    if (req.user.role === 'doctor') {
      await Doctor.findOneAndUpdate({ user: req.user._id }, { profilePic: fileUrl });
    } else if (req.user.role === 'patient') {
      await Patient.findOneAndUpdate({ user: req.user._id }, { profilePic: fileUrl });
    }
    
    res.status(200).json({
      success: true,
      message: 'Profile picture uploaded successfully',
      data: { fileUrl }
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
