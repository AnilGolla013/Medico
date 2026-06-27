const fs = require('fs');
const path = require('path');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Prescription = require('../models/Prescription');
const Patient = require('../models/Patient');
const User = require('../models/User');
const generatePrescriptionPDF = require('../utils/generatePDF');

// @desc    Update doctor profile
// @route   PUT /api/doctor/profile
// @access  Private (Doctor only)
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      experience,
      consultationFee,
      qualifications,
      languages,
      bio,
      profilePic,
      availability
    } = req.body;

    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    doctor.experience = experience !== undefined ? experience : doctor.experience;
    doctor.consultationFee = consultationFee !== undefined ? consultationFee : doctor.consultationFee;
    doctor.qualifications = qualifications || doctor.qualifications;
    doctor.languages = languages || doctor.languages;
    doctor.bio = bio !== undefined ? bio : doctor.bio;
    doctor.profilePic = profilePic !== undefined ? profilePic : doctor.profilePic;
    doctor.availability = availability || doctor.availability;

    await doctor.save();

    const updatedUser = await User.findById(req.user._id);

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        isVerified: updatedUser.isVerified
      },
      profile: doctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get appointments for logged in doctor
// @route   GET /api/doctor/appointments
// @access  Private (Doctor only)
exports.getAppointments = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name email' }
      })
      .populate('hospital')
      .populate('prescription')
      .sort({ date: 1, slot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Accept or Reject or Complete appointment
// @route   PUT /api/doctor/appointments/:id/status
// @access  Private (Doctor only)
exports.updateAppointmentStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Accepted', 'Rejected', 'Completed'
    const doctor = await Doctor.findOne({ user: req.user._id });
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check ownership
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (!['Accepted', 'Rejected', 'Completed'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status update' });
    }

    appointment.status = status;
    
    if (status === 'Completed') {
      appointment.paymentStatus = 'Paid'; // Automatically set paid on completion
    }

    await appointment.save();

    res.status(200).json({
      success: true,
      message: `Appointment status updated to ${status}`,
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Write a digital prescription and generate PDF
// @route   POST /api/doctor/appointments/:id/prescription
// @access  Private (Doctor only)
exports.createPrescription = async (req, res, next) => {
  try {
    const { medicines, notes } = req.body;
    const doctor = await Doctor.findOne({ user: req.user._id })
      .populate('user', 'name')
      .populate('specialization', 'name')
      .populate('hospital', 'name');
    
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Verify ownership
    if (appointment.doctor.toString() !== doctor._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    const patient = await Patient.findById(appointment.patient)
      .populate('user', 'name');

    // Create prescription document
    const prescription = await Prescription.create({
      appointment: appointment._id,
      doctor: doctor._id,
      patient: patient._id,
      medicines,
      notes
    });

    // Generate PDF file
    const pdfFilename = `prescription_${prescription._id}.pdf`;
    // We will save this file inside backend/src/uploads/prescriptions/
    const uploadsDir = path.join(__dirname, '..', 'uploads', 'prescriptions');
    const pdfPath = path.join(uploadsDir, pdfFilename);
    const pdfUrl = `/uploads/prescriptions/${pdfFilename}`;

    await generatePrescriptionPDF(prescription, appointment, doctor, patient, pdfPath);

    // Save pdfUrl back to prescription
    prescription.pdfUrl = pdfUrl;
    await prescription.save();

    // Link prescription to appointment and set to Completed
    appointment.prescription = prescription._id;
    appointment.status = 'Completed';
    appointment.paymentStatus = 'Paid';
    await appointment.save();

    res.status(201).json({
      success: true,
      message: 'Prescription written and PDF generated successfully',
      data: prescription
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get dashboard statistics for Doctor
// @route   GET /api/doctor/dashboard/stats
// @access  Private (Doctor only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const doctor = await Doctor.findOne({ user: req.user._id });
    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    const appointments = await Appointment.find({ doctor: doctor._id });
    const today = new Date();
    today.setHours(0,0,0,0);

    const todayAppts = appointments.filter(a => {
      const aDate = new Date(a.date);
      aDate.setHours(0,0,0,0);
      return aDate.getTime() === today.getTime() && a.status !== 'Cancelled';
    });

    const completed = appointments.filter(a => a.status === 'Completed');
    const earnings = completed.reduce((sum, a) => sum + (a.fees || 0), 0);

    // Analytics: Month-wise appointments & earnings (past 6 months)
    const analytics = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      analytics[monthYear] = { appointments: 0, earnings: 0 };
    }

    appointments.forEach(a => {
      if (a.status !== 'Cancelled') {
        const aDate = new Date(a.date);
        const mY = aDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (analytics[mY]) {
          analytics[mY].appointments += 1;
          if (a.status === 'Completed') {
            analytics[mY].earnings += a.fees || 0;
          }
        }
      }
    });

    const chartData = Object.keys(analytics).map(key => ({
      month: key,
      appointments: analytics[key].appointments,
      earnings: analytics[key].earnings
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalAppointments: appointments.length,
        todayAppointments: todayAppts.length,
        completedAppointments: completed.length,
        totalEarnings: earnings
      },
      chartData
    });
  } catch (err) {
    next(err);
  }
};
