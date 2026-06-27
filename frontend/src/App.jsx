import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Layout
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import DashboardSidebar from './components/DashboardSidebar';

// Public Pages
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import VerifyEmail from './pages/VerifyEmail';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';
import DoctorSearch from './pages/DoctorSearch';
import DoctorDetail from './pages/DoctorDetail';

// Patient Dashboard Pages
import PatientDashboard from './pages/patient/PatientDashboard';
import PatientProfile from './pages/patient/PatientProfile';
import PatientPrescriptions from './pages/patient/PatientPrescriptions';

// Doctor Dashboard Pages
import DoctorDashboard from './pages/doctor/DoctorDashboard';
import DoctorAppointments from './pages/doctor/DoctorAppointments';
import DoctorSchedule from './pages/doctor/DoctorSchedule';
import DoctorProfile from './pages/doctor/DoctorProfile';

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminApprovals from './pages/admin/AdminApprovals';
import AdminPatients from './pages/admin/AdminPatients';
import AdminDoctors from './pages/admin/AdminDoctors';
import AdminHospitals from './pages/admin/AdminHospitals';

// Layout Wrappers
const StandardLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen">
    <Navbar />
    <main className="flex-grow">{children}</main>
    <Footer />
  </div>
);

const DashboardLayout = ({ children }) => (
  <div className="flex flex-col min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200">
    <Navbar />
    <div className="flex flex-col md:flex-row flex-grow">
      <DashboardSidebar />
      <main className="flex-grow p-6 md:p-8 max-w-7xl mx-auto w-full">{children}</main>
    </div>
  </div>
);

function App() {
  return (
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<StandardLayout><Landing /></StandardLayout>} />
          <Route path="/login" element={<StandardLayout><Login /></StandardLayout>} />
          <Route path="/register" element={<StandardLayout><Register /></StandardLayout>} />
          <Route path="/verify-email" element={<StandardLayout><VerifyEmail /></StandardLayout>} />
          <Route path="/forgot-password" element={<StandardLayout><ForgotPassword /></StandardLayout>} />
          <Route path="/reset-password" element={<StandardLayout><ResetPassword /></StandardLayout>} />
          <Route path="/doctors" element={<StandardLayout><DoctorSearch /></StandardLayout>} />
          <Route path="/doctors/:id" element={<StandardLayout><DoctorDetail /></StandardLayout>} />

          {/* Patient Routes */}
          <Route
            path="/patient/dashboard"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardLayout><PatientDashboard /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/profile"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardLayout><PatientProfile /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/patient/prescriptions"
            element={
              <ProtectedRoute allowedRoles={['patient']}>
                <DashboardLayout><PatientPrescriptions /></DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Doctor Routes */}
          <Route
            path="/doctor/dashboard"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout><DoctorDashboard /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/appointments"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout><DoctorAppointments /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/schedule"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout><DoctorSchedule /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/doctor/profile"
            element={
              <ProtectedRoute allowedRoles={['doctor']}>
                <DashboardLayout><DoctorProfile /></DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminDashboard /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/approvals"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminApprovals /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/patients"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminPatients /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/doctors"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminDoctors /></DashboardLayout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/hospitals"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <DashboardLayout><AdminHospitals /></DashboardLayout>
              </ProtectedRoute>
            }
          />

          {/* Fallback route */}
          <Route path="*" element={<StandardLayout><div className="text-center py-20 font-semibold text-lg text-gray-500">Page not found (404)</div></StandardLayout>} />
        </Routes>
      </AuthProvider>
  );
}

export default App;
