const User = require('../models/User');
const Doctor = require('../models/Doctor');
const Patient = require('../models/Patient');
const Appointment = require('../models/Appointment');
const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const Review = require('../models/Review');

// @desc    Get Admin Dashboard Stats
// @route   GET /api/admin/dashboard/stats
// @access  Private (Admin only)
exports.getDashboardStats = async (req, res, next) => {
  try {
    const totalPatients = await Patient.countDocuments();
    const totalDoctors = await Doctor.countDocuments();
    const totalAppointments = await Appointment.countDocuments();
    
    // Revenue from completed appointments
    const completedAppts = await Appointment.find({ status: 'Completed' });
    const totalRevenue = completedAppts.reduce((sum, appt) => sum + (appt.fees || 0), 0);

    // Month-by-month analytics for past 6 months
    const analytics = {};
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      const monthYear = d.toLocaleString('default', { month: 'short', year: '2-digit' });
      analytics[monthYear] = { appointments: 0, revenue: 0 };
    }

    const allAppointments = await Appointment.find();
    allAppointments.forEach(appt => {
      if (appt.status !== 'Cancelled') {
        const aDate = new Date(appt.date);
        const mY = aDate.toLocaleString('default', { month: 'short', year: '2-digit' });
        if (analytics[mY]) {
          analytics[mY].appointments += 1;
          if (appt.status === 'Completed') {
            analytics[mY].revenue += appt.fees || 0;
          }
        }
      }
    });

    const chartData = Object.keys(analytics).map(key => ({
      month: key,
      appointments: analytics[key].appointments,
      revenue: analytics[key].revenue
    }));

    res.status(200).json({
      success: true,
      stats: {
        totalPatients,
        totalDoctors,
        totalAppointments,
        totalRevenue
      },
      chartData
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all doctors (both approved and pending)
// @route   GET /api/admin/doctors
// @access  Private (Admin only)
exports.getDoctors = async (req, res, next) => {
  try {
    const doctors = await Doctor.find()
      .populate('user', 'name email createdAt isVerified')
      .populate('specialization', 'name')
      .populate('hospital', 'name');

    res.status(200).json({
      success: true,
      count: doctors.length,
      data: doctors
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Approve/Reject doctor registration
// @route   PUT /api/admin/doctors/:id/status
// @access  Private (Admin only)
exports.updateDoctorStatus = async (req, res, next) => {
  try {
    const { status } = req.body; // 'Approved' or 'Rejected'
    const doctor = await Doctor.findById(req.params.id).populate('user', 'name email');

    if (!doctor) {
      return res.status(404).json({ success: false, message: 'Doctor profile not found' });
    }

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    doctor.status = status;
    await doctor.save();

    res.status(200).json({
      success: true,
      message: `Doctor status updated to ${status}`,
      data: doctor
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all patients
// @route   GET /api/admin/patients
// @access  Private (Admin only)
exports.getPatients = async (req, res, next) => {
  try {
    const patients = await Patient.find()
      .populate('user', 'name email createdAt');

    res.status(200).json({
      success: true,
      count: patients.length,
      data: patients
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Delete/Block user account
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin only)
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (user.role === 'admin') {
      return res.status(400).json({ success: false, message: 'Cannot delete admin account' });
    }

    // Delete corresponding profile
    if (user.role === 'doctor') {
      const doc = await Doctor.findOne({ user: user._id });
      if (doc) {
        // Delete doctor appointments and reviews
        await Appointment.deleteMany({ doctor: doc._id });
        await Review.deleteMany({ doctor: doc._id });
        await Doctor.findByIdAndDelete(doc._id);
      }
    } else if (user.role === 'patient') {
      const pat = await Patient.findOne({ user: user._id });
      if (pat) {
        await Appointment.deleteMany({ patient: pat._id });
        await Review.deleteMany({ patient: pat._id });
        await Patient.findByIdAndDelete(pat._id);
      }
    }

    await User.findByIdAndDelete(user._id);

    res.status(200).json({
      success: true,
      message: 'User and all related records deleted successfully'
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a Hospital
// @route   POST /api/admin/hospitals
// @access  Private (Admin only)
exports.createHospital = async (req, res, next) => {
  try {
    const { name, location, description, image } = req.body;
    const hospital = await Hospital.create({ name, location, description, image });

    res.status(201).json({
      success: true,
      message: 'Hospital added successfully',
      data: hospital
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all Hospitals
// @route   GET /api/admin/hospitals
// @access  Private/Public
exports.getHospitals = async (req, res, next) => {
  try {
    const hospitals = await Hospital.find();
    res.status(200).json({
      success: true,
      data: hospitals
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Create a Specialty Department
// @route   POST /api/admin/departments
// @access  Private (Admin only)
exports.createDepartment = async (req, res, next) => {
  try {
    const { name, description, icon } = req.body;
    const department = await Department.create({ name, description, icon });

    res.status(201).json({
      success: true,
      message: 'Department created successfully',
      data: department
    });
  } catch (err) {
    next(err);
  }
};

// @desc    Get all Departments
// @route   GET /api/admin/departments
// @access  Private/Public
exports.getDepartments = async (req, res, next) => {
  try {
    const departments = await Department.find();
    res.status(200).json({
      success: true,
      data: departments
    });
  } catch (err) {
    next(err);
  }
};
