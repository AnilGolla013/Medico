import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { User, Award, DollarSign, Briefcase, Languages, FileText, Loader2 } from 'lucide-react';

const DoctorProfile = () => {
  const { user, profile, token, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm({
    defaultValues: {
      name: user?.name || '',
      consultationFee: profile?.consultationFee || 0,
      experience: profile?.experience || 0,
      qualifications: profile?.qualifications ? profile.qualifications.join(', ') : '',
      languages: profile?.languages ? profile.languages.join(', ') : 'English',
      bio: profile?.bio || ''
    }
  });

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const payload = {
        name: data.name,
        consultationFee: Number(data.consultationFee),
        experience: Number(data.experience),
        qualifications: data.qualifications.split(',').map(q => q.trim()),
        languages: data.languages.split(',').map(l => l.trim()),
        bio: data.bio
      };

      const res = await axios.put('/api/doctor/profile', payload, {
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
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm max-w-2xl transition-colors duration-200">
      <div className="border-b border-gray-150 dark:border-gray-700 pb-4 mb-6">
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Manage Doctor Profile</h2>
        <p className="text-xs text-gray-400 mt-1">Keep your professional biography, credentials, and consult fees updated</p>
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

          {/* Consultation Fee */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Consultation Fee ($)</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                <DollarSign className="h-4.5 w-4.5" />
              </div>
              <input
                type="number"
                {...register('consultationFee', { required: 'Fee is required', min: 0 })}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Experience */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Years of Experience</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                <Briefcase className="h-4.5 w-4.5" />
              </div>
              <input
                type="number"
                {...register('experience', { required: 'Experience is required', min: 0 })}
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>

          {/* Languages */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Spoken Languages (Comma Separated)</label>
            <div className="relative rounded-lg shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
                <Languages className="h-4.5 w-4.5" />
              </div>
              <input
                type="text"
                {...register('languages')}
                placeholder="English, Spanish, Hindi"
                className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
              />
            </div>
          </div>
        </div>

        {/* Qualifications */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Qualifications (Comma Separated)</label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-405">
              <Award className="h-4.5 w-4.5" />
            </div>
            <input
              type="text"
              {...register('qualifications', { required: 'Qualifications are required' })}
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-850 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            />
          </div>
        </div>

        {/* Bio */}
        <div>
          <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Professional Biography</label>
          <div className="relative rounded-lg shadow-sm">
            <div className="absolute inset-y-0 left-0 pl-3 pt-3 flex items-start pointer-events-none text-gray-405">
              <FileText className="h-4.5 w-4.5" />
            </div>
            <textarea
              rows="4"
              {...register('bio')}
              placeholder="Dr. Elizabeth is a clinical cardiologist..."
              className="block w-full pl-10 pr-3 py-2.5 border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-750 text-gray-805 dark:text-gray-150 rounded-xl focus:outline-none focus:ring-2 focus:ring-sky-500 text-sm"
            ></textarea>
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
                <span>Saving Profile Details...</span>
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

export default DoctorProfile;
