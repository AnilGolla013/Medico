const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const User = require('../models/User');

// @desc    Get all doctors with filters
// @route   GET /api/patient/doctors
// @access  Private/Public (Accessible for search)
exports.getDoctors = async (req, res, next) => {
  try {
    const {
      specialization,
      hospital,
      location,
      minExperience,
      maxFee,
      minRating,
      language,
      day
    } = req.query;

    let query = { status: 'Approved' };

    // Specialty filter
    if (specialization) {
      query.specialization = specialization;
    }

    // Hospital filter
    if (hospital) {
      query.hospital = hospital;
    }

    // Experience filter
    if (minExperience) {
      query.experience = { $gte: parseInt(minExperience) };
    }

    // Consultation Fee filter
    if (maxFee) {
      query.consultationFee = { $lte: parseInt(maxFee) };
    }

    // Rating filter
    if (minRating) {
      query.rating = { $gte: parseFloat(minRating) };
    }

    // Language filter
    if (language) {
      query.languages = { $in: [new RegExp(language, 'i')] };
    }

    // Day of availability filter
    if (day) {
      query['availability.day'] = day;
    }

    let doctors = await Doctor.find(query)
      .populate('user', 'name email')
      .populate('specialization', 'name icon')
      .populate('hospital', 'name location');

    // Filter by location in populated Hospital if requested
    if (location) {
      doctors = doctors.filter(doc => 
        doc.hospital && doc.hospital.location.toLowerCase().includes(location.toLowerCase())
      );
    }

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get single doctor details
// @route   GET /api/patient/doctors/:id
// @access  Private
exports.getDoctorById = async (req, res, next) => {
  try {
    const doctor = await Doctor.findById(req.params.id)
      .populate('user', 'name email')
      .populate('specialization', 'name description icon')
      .populate('hospital', 'name location description image');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor not found' });
    }

    // Get doctor reviews
    const reviews = await Review.find({ doctor: doctor._id })
      .populate({
        path: 'patient',
        populate: { path: 'user', select: 'name' }
      });

    res.status(200).json({
      success: true,
      data: doctor,
      reviews
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Update patient profile
// @route   PUT /api/patient/profile
// @access  Private
exports.updateProfile = async (req, res, next) => {
  try {
    const { name, dateOfBirth, gender, phone, address, profilePic, bloodGroup, medicalHistory } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Update User Name
    if (name) {
      await User.findByIdAndUpdate(req.user._id, { name });
    }

    // Update patient profile fields
    patient.dateOfBirth = dateOfBirth || patient.dateOfBirth;
    patient.gender = gender || patient.gender;
    patient.phone = phone || patient.phone;
    patient.address = address || patient.address;
    patient.profilePic = profilePic || patient.profilePic;
    patient.bloodGroup = bloodGroup || patient.bloodGroup;
    patient.medicalHistory = medicalHistory || patient.medicalHistory;

    await patient.save();

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
      profile: patient
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Book an appointment
// @route   POST /api/patient/appointments
// @access  Private
exports.bookAppointment = async (req, res, next) => {
  try {
    const { doctorId, date, slot, type, symptoms } = req.body;

    // Get patient profile
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    // Get doctor details
    const doctor = await Doctor.findById(doctorId);
    if (!doctor || doctor.status !== 'Approved') {
      return res.status(404).json({ success: false, message: 'Doctor is not available' });
    }

    // Parse date
    const appointmentDate = new Date(date);
    appointmentDate.setHours(0,0,0,0);

    // Double check if appointment slot is already booked for this doctor on this day
    const slotTaken = await Appointment.findOne({
      doctor: doctorId,
      date: appointmentDate,
      slot: slot,
      status: { $in: ['Pending', 'Accepted', 'Completed'] }
    });

    if (slotTaken) {
      return res.status(400).json({
        success: false,
        message: 'This time slot is already booked. Please choose another slot.'
      });
    }

    // Create Appointment
    const appointment = await Appointment.create({
      patient: patient._id,
      doctor: doctorId,
      hospital: doctor.hospital,
      date: appointmentDate,
      slot,
      type: type || 'In-Person',
      fees: doctor.consultationFee,
      symptoms,
      status: 'Pending'
    });

    res.status(201).json({
      success: true,
      message: 'Appointment booked successfully. Awaiting doctor confirmation.',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get patient appointment history
// @route   GET /api/patient/appointments
// @access  Private
exports.getAppointments = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient profile not found' });
    }

    const appointments = await Appointment.find({ patient: patient._id })
      .populate({
        path: 'doctor',
        populate: { path: 'user', select: 'name' }
      })
      .populate({
        path: 'doctor',
        populate: { path: 'specialization', select: 'name' }
      })
      .populate('hospital')
      .populate('prescription')
      .sort({ date: -1, slot: 1 });

    res.status(200).json({
      success: true,
      count: appointments.length,
      data: appointments
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Cancel an appointment
// @route   PUT /api/patient/appointments/:id/cancel
// @access  Private
exports.cancelAppointment = async (req, res, next) => {
  try {
    const patient = await Patient.findOne({ user: req.user._id });
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check if patient owns this appointment
    if (appointment.patient.toString() !== patient._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    // Check if already completed or cancelled
    if (appointment.status === 'Cancelled' || appointment.status === 'Completed') {
      return res.status(400).json({
        success: false,
        message: `Cannot cancel an appointment that is already ${appointment.status.toLowerCase()}`
      });
    }

    appointment.status = 'Cancelled';
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment cancelled successfully',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Reschedule an appointment
// @route   PUT /api/patient/appointments/:id/reschedule
// @access  Private
exports.rescheduleAppointment = async (req, res, next) => {
  try {
    const { date, slot } = req.body;
    const patient = await Patient.findOne({ user: req.user._id });
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ success: false, message: 'Appointment not found' });
    }

    // Check ownership
    if (appointment.patient.toString() !== patient._id.toString()) {
      return res.status(401).json({ success: false, message: 'Not authorized' });
    }

    if (appointment.status === 'Completed' || appointment.status === 'Cancelled') {
      return res.status(400).json({ success: false, message: 'Cannot reschedule completed or cancelled appointments' });
    }

    // Parse date
    const reschedDate = new Date(date);
    reschedDate.setHours(0,0,0,0);

    // Double check availability
    const slotTaken = await Appointment.findOne({
      doctor: appointment.doctor,
      date: reschedDate,
      slot: slot,
      status: { $in: ['Pending', 'Accepted', 'Completed'] },
      _id: { $ne: appointment._id }
    });

    if (slotTaken) {
      return res.status(400).json({
        success: false,
        message: 'This slot is already booked. Please select another slot.'
      });
    }

    appointment.date = reschedDate;
    appointment.slot = slot;
    appointment.status = 'Pending'; // Reset to pending for doctor review
    await appointment.save();

    res.status(200).json({
      success: true,
      message: 'Appointment rescheduled successfully. Pending doctor confirmation.',
      data: appointment
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Add review for a doctor
// @route   POST /api/patient/reviews
// @access  Private
exports.createReview = async (req, res, next) => {
  try {
    const { doctorId, rating, comment } = req.body;

    const patient = await Patient.findOne({ user: req.user._id });
    if (!patient) {
      return res.status(404).json({ success: false, message: 'Patient not found' });
    }

    // Verify patient has had a completed appointment with this doctor
    const completedAppt = await Appointment.findOne({
      patient: patient._id,
      doctor: doctorId,
      status: 'Completed'
    });

    if (!completedAppt) {
      return res.status(400).json({
        success: false,
        message: 'You can only write a review for doctors you have completed appointments with.'
      });
    }

    // Check if review already exists
    let review = await Review.findOne({ patient: patient._id, doctor: doctorId });
    if (review) {
      // Update existing review
      review.rating = rating;
      review.comment = comment;
      await review.save();
    } else {
      // Create new review
      review = await Review.create({
        patient: patient._id,
        doctor: doctorId,
        rating,
        comment
      });
    }

    res.status(201).json({
      success: true,
      message: 'Review saved successfully',
      data: review
    });
  } catch (err) {
    next(err);
  }
};
