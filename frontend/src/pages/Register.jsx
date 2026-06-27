import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { User, Mail, Lock, Eye, EyeOff, Loader2, Award, Briefcase, DollarSign, Building } from 'lucide-react';

const Register = () => {
  const { registerUser } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialRole = searchParams.get('role') === 'doctor' ? 'doctor' : 'patient';

  const [role, setRole] = useState(initialRole);
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm({
    defaultValues: { role: initialRole }
  });

  const password = watch('password');

  // Load hospitals & departments for doctor registration
  useEffect(() => {
    if (role === 'doctor') {
      const loadOptions = async () => {
        try {
          const hosps = await axios.get('/api/public/hospitals');
          const depts = await axios.get('/api/public/departments');
          setHospitals(hosps.data.data);
          setDepartments(depts.data.data);
        } catch (err) {
          console.error('Error fetching registration options:', err);
        }
      };
      loadOptions();
    }
  }, [role]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    let payload = {
      name: data.name,
      email: data.email,
      password: data.password,
      role: role
    };

    if (role === 'doctor') {
      payload = {
        ...payload,
        hospitalId: data.hospitalId,
        specialtyId: data.specialtyId,
        experience: Number(data.experience),
        consultationFee: Number(data.consultationFee),
        qualifications: data.qualifications.split(',').map(q => q.trim())
      };
    }

    const res = await registerUser(payload);
    setIsSubmitting(false);

    if (res.success) {
      toast.success(res.message, { duration: 6000 });
      navigate('/login');
    } else {
      toast.error(res.message);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors duration-200">
      <div className="sm:mx-auto sm:w-full sm:max-w-md space-y-2 text-center">
        <h2 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
          Create Your Account
        </h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Sign up to schedule appointments and view clinical records
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl">
        <div className="bg-white dark:bg-gray-800 py-8 px-4 shadow-lg rounded-2xl border border-gray-100 dark:border-gray-700 sm:px-10 space-y-6">
          
          {/* Role selector buttons */}
          <div className="flex bg-gray-100 dark:bg-gray-750 p-1.5 rounded-xl border border-gray-200/40">
            <button
              type="button"
              onClick={() => setRole('patient')}
              className={`flex-grow text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === 'patient'
                  ? 'bg-white dark:bg-gray-850 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Register as Patient
            </button>
            <button
              type="button"
              onClick={() => setRole('doctor')}
              className={`flex-grow text-center py-2.5 rounded-lg text-sm font-semibold transition-all ${
                role === 'doctor'
                  ? 'bg-white dark:bg-gray-850 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-200'
              }`}
            >
              Join as Doctor
            </button>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Full Name */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Full Name
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                    <User className="h-5 w-5" />
                  </div>
                  <input
                    type="text"
                    placeholder="John Doe"
                    {...register('name', { required: 'Name is required' })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                </div>
                {errors.name && <p className="mt-1 text-xs text-rose-500">{errors.name.message}</p>}
              </div>

              {/* Email Address */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Email Address
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    placeholder="john@example.com"
                    {...register('email', {
                      required: 'Email is required',
                      pattern: {
                        value: /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
                        message: 'Enter a valid email address'
                      }
                    })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                </div>
                {errors.email && <p className="mt-1 text-xs text-rose-500">{errors.email.message}</p>}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password', {
                      required: 'Password is required',
                      minLength: { value: 6, message: 'Must be at least 6 characters' }
                    })}
                    className="block w-full pl-10 pr-10 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-405"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
                {errors.password && <p className="mt-1 text-xs text-rose-500">{errors.password.message}</p>}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                  Confirm Password
                </label>
                <div className="relative rounded-lg shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                    <Lock className="h-5 w-5" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('confirmPassword', {
                      required: 'Please confirm password',
                      validate: value => value === password || 'Passwords do not match'
                    })}
                    className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-rose-500">{errors.confirmPassword.message}</p>
                )}
              </div>
            </div>

            {/* Doctor-Specific Fields */}
            {role === 'doctor' && (
              <div className="border-t border-gray-150 dark:border-gray-700 pt-6 mt-6 space-y-4">
                <h3 className="text-sm font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wide">
                  Doctor Profile Verification Fields
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Specialty */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Medical Specialty
                    </label>
                    <select
                      {...register('specialtyId', { required: 'Specialty is required' })}
                      className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                    >
                      <option value="">Select Specialization</option>
                      {departments.map((dept) => (
                        <option key={dept._id} value={dept._id}>
                          {dept.name}
                        </option>
                      ))}
                    </select>
                    {errors.specialtyId && <p className="mt-1 text-xs text-rose-500">{errors.specialtyId.message}</p>}
                  </div>

                  {/* Hospital */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Consulting Hospital
                    </label>
                    <select
                      {...register('hospitalId', { required: 'Hospital is required' })}
                      className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                    >
                      <option value="">Select Clinic/Hospital</option>
                      {hospitals.map((hosp) => (
                        <option key={hosp._id} value={hosp._id}>
                          {hosp.name}
                        </option>
                      ))}
                    </select>
                    {errors.hospitalId && <p className="mt-1 text-xs text-rose-500">{errors.hospitalId.message}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Experience */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Years of Experience
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                        <Briefcase className="h-5 w-5" />
                      </div>
                      <input
                        type="number"
                        placeholder="8"
                        {...register('experience', {
                          required: 'Experience is required',
                          min: { value: 0, message: 'Cannot be negative' }
                        })}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                      />
                    </div>
                    {errors.experience && <p className="mt-1 text-xs text-rose-500">{errors.experience.message}</p>}
                  </div>

                  {/* Consultation Fee */}
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                      Consultation Fee ($)
                    </label>
                    <div className="relative rounded-lg shadow-sm">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                        <DollarSign className="h-5 w-5" />
                      </div>
                      <input
                        type="number"
                        placeholder="100"
                        {...register('consultationFee', {
                          required: 'Fee is required',
                          min: { value: 0, message: 'Cannot be negative' }
                        })}
                        className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                      />
                    </div>
                    {errors.consultationFee && <p className="mt-1 text-xs text-rose-500">{errors.consultationFee.message}</p>}
                  </div>
                </div>

                {/* Qualifications */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
                    Qualifications (Comma Separated)
                  </label>
                  <div className="relative rounded-lg shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                      <Award className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      placeholder="MD - Cardiology, MBBS, FACC"
                      {...register('qualifications', { required: 'Qualifications are required' })}
                      className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 placeholder-gray-400 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 text-sm"
                    />
                  </div>
                  {errors.qualifications && <p className="mt-1 text-xs text-rose-500">{errors.qualifications.message}</p>}
                </div>
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full flex justify-center items-center py-3 px-4 border border-transparent rounded-xl shadow-md text-sm font-bold text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-55 disabled:cursor-not-allowed transition-all duration-200 mt-6"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  <span>Registering Account...</span>
                </>
              ) : (
                <span>Register Account</span>
              )}
            </button>
          </form>

          <div className="text-center text-sm text-gray-600 dark:text-gray-450 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="font-bold text-sky-600 hover:text-sky-700 dark:text-sky-400">
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;