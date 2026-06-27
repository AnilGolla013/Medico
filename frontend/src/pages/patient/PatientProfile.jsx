import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { User, Phone, MapPin, Calendar, Heart, ShieldAlert, Loader2 } from 'lucide-react';

const PatientProfile = () => {
  const { user, profile, token, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      phone: profile?.phone || '',
      address: profile?.address || '',
      gender: profile?.gender || 'Not Specified',
      bloodGroup: profile?.bloodGroup || 'Unknown',
      dateOfBirth: profile?.dateOfBirth ? new Date(profile.dateOfBirth).toISOString().split('T')[0] : '',
      medicalHistory: profile?.medicalHistory ? profile.medicalHistory.join(', ') : ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        phone: data.phone,
        address: data.address,
        gender: data.gender,
        bloodGroup: data.bloodGroup,
        dateOfBirth: data.dateOfBirth || null,
        medicalHistory: data.medicalHistory ? data.medicalHistory.split(',').map(h => h.trim()) : []
      };

      const res = await axios.put('/api/patient/profile', payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(res.data.message);
        await refreshProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update profile.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm max-w-2xl">
      <div className="border-b border-gray-150 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Manage Patient Profile</h2>
        <p className="text-xs text-gray-400 mt-1">Keep your medical and contact information up to date</p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Name */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Full Name</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                <User className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                {...register('name', { required: 'Name is required' })}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Phone Number</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                <Phone className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                {...register('phone')}
                placeholder="+1 (555) 000-0000"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Gender */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Gender</label>
            <select
              {...register('gender')}
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
              <option value="Not Specified">Not Specified</option>
            </select>
          </div>

          {/* DOB */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Date of Birth</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                <Calendar className="h-4.5 w-4.5" />
              </div>
              <input
                type="date"
                {...register('dateOfBirth')}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>

          {/* Blood Group */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Blood Group</label>
            <select
              {...register('bloodGroup')}
              className="block w-full px-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-855 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            >
              <option value="Unknown">Unknown</option>
              <option value="A+">A+</option>
              <option value="A-">A-</option>
              <option value="B+">B+</option>
              <option value="B-">B-</option>
              <option value="AB+">AB+</option>
              <option value="AB-">AB-</option>
              <option value="O+">O+</option>
              <option value="O-">O-</option>
            </select>
          </div>
        </div>

        {/* Address */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Residential Address</label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
              <MapPin className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              {...register('address')}
              placeholder="123 Health St, City"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>
        </div>

        {/* Medical History */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">
            Medical History / Allergies (Comma Separated)
          </label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
              <ShieldAlert className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              {...register('medicalHistory')}
              placeholder="e.g. Asthma, Penicillin Allergy, Diabetes"
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>
        </div>

        {/* Submit */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow disabled:opacity-50 transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Saving Profile...</span>
              </>
            ) : (
              <span>Save Changes</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default PatientProfile;
