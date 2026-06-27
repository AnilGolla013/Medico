import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Trash2, AlertCircle, ShieldAlert, Loader2, RefreshCw } from 'lucide-react';

const AdminDoctors = () => {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/admin/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setDoctors(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load doctor database.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDoctors();
    }
  }, [token]);

  const handleToggleStatus = async (docId, currentStatus) => {
    const nextStatus = currentStatus === 'Approved' ? 'Rejected' : 'Approved';
    const actionText = currentStatus === 'Approved' ? 'suspend' : 'activate';
    if (!window.confirm(`Are you sure you want to ${actionText} this doctor's profile?`)) return;

    try {
      const res = await axios.put(
        `/api/admin/doctors/${docId}/status`,
        { status: nextStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Doctor profile is now ${nextStatus.toLowerCase()}`);
        fetchDoctors();
      }
    } catch (err) {
      toast.error('Status toggle failed.');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this doctor account? All schedules and review histories will be removed.')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchDoctors();
      }
    } catch (err) {
      toast.error('Failed to delete doctor account.');
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Manage Doctors</h2>
        <p className="text-xs text-gray-400 mt-1">Vetted healthcare experts database, status monitoring and access blocks</p>
      </div>

      {doctors.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-display">Doctor Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-display">Specialty</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Hospital Clinic</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Experience</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-250 dark:divide-gray-750 text-sm text-gray-700 dark:text-gray-300">
                {doctors.map((doc) => (
                  <tr key={doc._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <p className="font-semibold text-gray-905 dark:text-gray-150">Dr. {doc.user?.name}</p>
                      <p className="text-[10px] text-gray-400">{doc.user?.email}</p>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-sky-655 font-semibold">
                      {doc.specialization?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-500">
                      {doc.hospital?.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`text-xs font-semibold px-2.5 py-0.5 rounded-full ${
                          doc.status === 'Approved'
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-250/20'
                            : doc.status === 'Pending'
                            ? 'bg-amber-50 text-amber-600 border border-amber-250/20'
                            : 'bg-rose-50 text-rose-600 border border-rose-250/20'
                        }`}
                      >
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {doc.experience} Years
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs space-x-2">
                      <button
                        onClick={() => handleToggleStatus(doc._id, doc.status)}
                        className="bg-gray-100 hover:bg-sky-50 hover:text-sky-600 text-gray-500 dark:bg-gray-750 p-2 rounded-lg transition-colors"
                        title={doc.status === 'Approved' ? 'Deactivate Doctor' : 'Activate Doctor'}
                      >
                        <RefreshCw className="h-4 w-4" />
                      </button>
                      {doc.user && (
                        <button
                          onClick={() => handleDeleteUser(doc.user._id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg transition-colors"
                          title="Delete Doctor Account"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-8 text-center rounded-2xl flex flex-col items-center space-y-2">
          <ShieldAlert className="h-8 w-8 text-sky-500" />
          <p className="text-gray-500 dark:text-gray-400 text-sm">No doctor profiles loaded in the database.</p>
        </div>
      )}
    </div>
  );
};

export default AdminDoctors;
