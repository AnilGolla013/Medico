const express = require('express');
const {
  updateProfile,
  getAppointments,
  updateAppointmentStatus,
  createPrescription,
  getDashboardStats
} = require('../controllers/doctorController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All doctor routes are protected & restricted to role 'doctor'
router.use(protect);
router.use(authorize('doctor'));

router.put('/profile', updateProfile);
router.get('/appointments', getAppointments);
router.put('/appointments/:id/status', updateAppointmentStatus);
router.post('/appointments/:id/prescription', createPrescription);
router.get('/dashboard/stats', getDashboardStats);

module.exports = router;
