import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import { Check, X, ShieldAlert, Award, FileText, Loader2 } from 'lucide-react';

const AdminApprovals = () => {
  const { token } = useAuth();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchDoctors = async () => {
    try {
      const res = await axios.get('/api/admin/doctors', {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Filter only Pending status doctors
      setDoctors(res.data.data.filter(d => d.status === 'Pending'));
    } catch (err) {
      console.error(err);
      toast.error('Failed to load pending registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchDoctors();
    }
  }, [token]);

  const handleStatusUpdate = async (doctorId, newStatus) => {
    try {
      const res = await axios.put(
        `/api/admin/doctors/${doctorId}/status`,
        { status: newStatus },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Doctor profile ${newStatus.toLowerCase()} successfully`);
        fetchDoctors();
      }
    } catch (err) {
      toast.error('Failed to update status.');
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
    <div className="space-y-6 max-w-4xl">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Doctor Approvals</h2>
        <p className="text-xs text-gray-400 mt-1">Vet credentials and activate newly registered doctors</p>
      </div>

      {doctors.length > 0 ? (
        <div className="space-y-4">
          {doctors.map((doc) => (
            <div
              key={doc._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex flex-col md:flex-row justify-between gap-6"
            >
              <div className="space-y-3 flex-grow">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-amber-50 dark:bg-amber-950/20 text-amber-600 rounded-xl flex items-center justify-center font-bold text-sm uppercase shrink-0">
                    {doc.user?.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-850 dark:text-white">Dr. {doc.user?.name}</h3>
                    <p className="text-xs text-sky-600 font-semibold">{doc.specialization?.name} • Exp: {doc.experience} Years</p>
                  </div>
                </div>

                <div className="space-y-1 text-xs text-gray-500 dark:text-gray-400">
                  <p><strong>Hospital Location:</strong> {doc.hospital?.name}</p>
                  <p className="flex items-center">
                    <Award className="h-3.5 w-3.5 mr-1 text-gray-400" />
                    <span><strong>Qualifications:</strong> {doc.qualifications.join(', ')}</span>
                  </p>
                  {doc.bio && (
                    <p className="flex items-start bg-gray-50 dark:bg-gray-900/30 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700 text-gray-450 italic mt-2">
                      <FileText className="h-3.5 w-3.5 mr-1 text-gray-400 shrink-0 mt-0.5" />
                      <span>"{doc.bio}"</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="flex md:flex-col justify-center gap-2 shrink-0 md:w-36">
                <button
                  onClick={() => handleStatusUpdate(doc._id, 'Approved')}
                  className="flex-grow bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 shadow-sm transition-colors"
                >
                  <Check className="h-4.5 w-4.5" />
                  <span>Approve Profile</span>
                </button>
                <button
                  onClick={() => handleStatusUpdate(doc._id, 'Rejected')}
                  className="flex-grow bg-rose-50 hover:bg-rose-100 text-rose-600 font-semibold py-2 px-3 rounded-lg text-xs flex items-center justify-center space-x-1 transition-colors"
                >
                  <X className="h-4.5 w-4.5" />
                  <span>Decline</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-8 text-center rounded-2xl flex flex-col items-center space-y-2">
          <ShieldAlert className="h-8 w-8 text-emerald-500" />
          <p className="text-gray-500 dark:text-gray-400 text-sm font-semibold">Zero pending registrations requiring approval.</p>
        </div>
      )}
    </div>
  );
};

export default AdminApprovals;
