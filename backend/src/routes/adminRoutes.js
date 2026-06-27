const express = require('express');
const {
  getDashboardStats,
  getDoctors,
  updateDoctorStatus,
  getPatients,
  deleteUser,
  createHospital,
  getHospitals,
  createDepartment,
  getDepartments
} = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

const router = express.Router();

// All routes require login and Admin role
router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard/stats', getDashboardStats);
router.get('/doctors', getDoctors);
router.put('/doctors/:id/status', updateDoctorStatus);
router.get('/patients', getPatients);
router.delete('/users/:id', deleteUser);

// CRUD for hospital/department
router.post('/hospitals', createHospital);
router.get('/hospitals', getHospitals);
router.post('/departments', createDepartment);
router.get('/departments', getDepartments);

module.exports = router;
