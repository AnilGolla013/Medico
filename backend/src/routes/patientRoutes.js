const express = require('express');
const {
  getDoctors,
  getDoctorById,
  updateProfile,
  bookAppointment,
  getAppointments,
  cancelAppointment,
  rescheduleAppointment,
  createReview
} = require('../controllers/patientController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes here require login and role 'patient'
router.use(protect);
router.use(authorize('patient'));

router.put('/profile', updateProfile);
router.get('/doctors', getDoctors);
router.get('/doctors/:id', getDoctorById);
router.post('/appointments', bookAppointment);
router.get('/appointments', getAppointments);
router.put('/appointments/:id/cancel', cancelAppointment);
router.put('/appointments/:id/reschedule', rescheduleAppointment);
router.post('/reviews', createReview);

module.exports = router;
