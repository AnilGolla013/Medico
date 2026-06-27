import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Trash2, ShieldAlert, Loader2 } from 'lucide-react';

const AdminPatients = () => {
  const { token } = useAuth();
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchPatients = async () => {
    try {
      const res = await axios.get('/api/admin/patients', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setPatients(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load patient directories.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPatients();
    }
  }, [token]);

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to permanently delete this user account? All booking records will be removed.')) return;
    try {
      const res = await axios.delete(`/api/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        fetchPatients();
      }
    } catch (err) {
      toast.error('Failed to delete user account.');
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
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Manage Patients</h2>
        <p className="text-xs text-gray-400 mt-1">Review active patient accounts and manage record deletions</p>
      </div>

      {patients.length > 0 ? (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-900/50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-display">Patient Name</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-display">Email Address</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-display font-medium">Gender</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-medium">Blood Group</th>
                  <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider font-medium">Joined Date</th>
                  <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider font-medium">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-250 dark:divide-gray-750 text-sm text-gray-700 dark:text-gray-300">
                {patients.map((pat) => (
                  <tr key={pat._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-gray-905 dark:text-gray-150">
                      {pat.user?.name || 'Valued Patient'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                      {pat.user?.email || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs">
                      {pat.gender || 'Not Specified'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs font-bold text-sky-600">
                      {pat.bloodGroup || 'Unknown'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-xs text-gray-450">
                      {pat.user?.createdAt ? new Date(pat.user.createdAt).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-xs">
                      {pat.user && (
                        <button
                          onClick={() => handleDeleteUser(pat.user._id)}
                          className="bg-rose-50 hover:bg-rose-100 text-rose-600 p-2 rounded-lg transition-colors"
                          title="Delete Patient Account"
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
          <p className="text-gray-500 dark:text-gray-400 text-sm">No patient accounts registered on the system yet.</p>
        </div>
      )}
    </div>
  );
};

export default AdminPatients;
