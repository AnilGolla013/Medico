import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Video,
  CheckCircle,
  XCircle,
  FileText,
  User,
  Plus,
  Trash2,
  BookmarkPlus,
  Loader2,
  Download
} from 'lucide-react';

const DoctorAppointments = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All');

  // Digital Prescription Form States
  const [showPrescModal, setShowPrescModal] = useState(false);
  const [activeApptId, setActiveApptId] = useState(null);
  const [medicines, setMedicines] = useState([{ name: '', dosage: '', instruction: 'After meals', duration: '' }]);
  const [notes, setNotes] = useState('');
  const [submittingPresc, setSubmittingPresc] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/doctor/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.data);
    } catch (err) {
      console.error(err);
      toast.error('Could not fetch appointments.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const updateStatus = async (apptId, statusValue) => {
    try {
      const res = await axios.put(
        `/api/doctor/appointments/${apptId}/status`,
        { status: statusValue },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(`Appointment marked as ${statusValue.toLowerCase()}`);
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to update status.');
    }
  };

  // Open Prescription Form setup
  const openPrescriptionForm = (apptId) => {
    setActiveApptId(apptId);
    setMedicines([{ name: '', dosage: '', instruction: 'After meals', duration: '' }]);
    setNotes('');
    setShowPrescModal(true);
  };

  const handleAddMedicine = () => {
    setMedicines([...medicines, { name: '', dosage: '', instruction: 'After meals', duration: '' }]);
  };

  const handleRemoveMedicine = (idx) => {
    if (medicines.length === 1) return;
    setMedicines(medicines.filter((_, i) => i !== idx));
  };

  const handleMedicineChange = (idx, field, val) => {
    const updated = medicines.map((med, i) => {
      if (i === idx) {
        return { ...med, [field]: val };
      }
      return med;
    });
    setMedicines(updated);
  };

  const submitPrescription = async (e) => {
    e.preventDefault();
    // Validate medicine items
    const invalid = medicines.some(m => !m.name || !m.dosage || !m.duration);
    if (invalid) {
      toast.error('Please fill in the Name, Dosage, and Duration for all medicines.');
      return;
    }

    setSubmittingPresc(true);
    try {
      const res = await axios.post(
        `/api/doctor/appointments/${activeApptId}/prescription`,
        { medicines, notes },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setShowPrescModal(false);
        fetchAppointments();
      }
    } catch (err) {
      toast.error('Failed to submit prescription.');
    } finally {
      setSubmittingPresc(false);
    }
  };

  const filteredAppointments = appointments.filter(appt => {
    if (filter === 'All') return true;
    return appt.status === filter;
  });

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Manage Appointments</h2>
          <p className="text-xs text-gray-400 mt-1">Review active and completed patient consultations</p>
        </div>

        {/* Tab Filters */}
        <div className="flex bg-gray-100 dark:bg-gray-750 p-1 rounded-xl border border-gray-200/40 text-xs">
          {['All', 'Pending', 'Accepted', 'Completed', 'Cancelled'].map(t => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-2 rounded-lg font-bold transition-all ${
                filter === t
                  ? 'bg-white dark:bg-gray-850 text-sky-600 dark:text-sky-400 shadow-sm'
                  : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* List Grid */}
      {filteredAppointments.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAppointments.map(appt => (
            <div
              key={appt._id}
              className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 rounded-2xl shadow-sm space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-xl flex items-center justify-center font-bold text-sm uppercase">
                    {appt.patient?.user?.name.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-base text-gray-905 dark:text-white">
                      {appt.patient?.user?.name || 'Valued Patient'}
                    </h4>
                    <p className="text-xs text-gray-400">Gender: {appt.patient?.gender || 'N/A'} • Blood: {appt.patient?.bloodGroup || 'N/A'}</p>
                  </div>
                </div>

                <span
                  className={`text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                    appt.status === 'Completed'
                      ? 'bg-emerald-50 text-emerald-600 border border-emerald-250/20'
                      : appt.status === 'Accepted'
                      ? 'bg-sky-50 text-sky-600 border border-sky-250/20'
                      : appt.status === 'Pending'
                      ? 'bg-amber-50 text-amber-600 border border-amber-250/20'
                      : 'bg-gray-100 text-gray-400'
                  }`}
                >
                  {appt.status}
                </span>
              </div>

              {/* Specs Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-700 py-3">
                <div className="flex items-center space-x-1.5">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span>{new Date(appt.date).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center space-x-1.5">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span>{appt.slot}</span>
                </div>
                <div className="flex items-center space-x-1.5 col-span-2">
                  <Video className="h-3.5 w-3.5 text-gray-400" />
                  <span>{appt.type} consultation</span>
                </div>
              </div>

              {appt.symptoms && (
                <p className="text-xs text-gray-400 bg-gray-50 dark:bg-gray-900/40 p-2.5 rounded-lg border border-gray-100 dark:border-gray-700">
                  <strong>Symptoms:</strong> {appt.symptoms}
                </p>
              )}

              {/* Actions Grid */}
              <div className="pt-2 flex gap-2">
                {appt.status === 'Pending' && (
                  <>
                    <button
                      onClick={() => updateStatus(appt._id, 'Accepted')}
                      className="flex-grow bg-sky-600 hover:bg-sky-700 text-white py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      Accept
                    </button>
                    <button
                      onClick={() => updateStatus(appt._id, 'Rejected')}
                      className="flex-grow bg-rose-50 hover:bg-rose-100 text-rose-600 py-2 rounded-lg text-xs font-bold transition-colors"
                    >
                      Reject
                    </button>
                  </>
                )}

                {appt.status === 'Accepted' && (
                  <button
                    onClick={() => openPrescriptionForm(appt._id)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                  >
                    <FileText className="h-4 w-4" />
                    <span>Write Prescription</span>
                  </button>
                )}

                {appt.status === 'Completed' && appt.prescription && (
                  <a
                    href={appt.prescription.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full text-center border border-gray-250 hover:bg-gray-50 dark:border-gray-750 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-xs font-bold transition-colors flex items-center justify-center space-x-1"
                  >
                    <Download className="h-4 w-4" />
                    <span>Download Prescription</span>
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-8 text-center rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No appointments matching criteria.</p>
        </div>
      )}

      {/* Prescription Form Modal */}
      {showPrescModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 max-w-2xl w-full p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-2xl max-h-[85vh] overflow-y-auto space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-display border-b border-gray-100 dark:border-gray-700 pb-3">
              Generate Digital Prescription
            </h3>

            <form onSubmit={submitPrescription} className="space-y-4">
              
              {/* Dynamic Medicines Table */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Medicines List</h4>
                  <button
                    type="button"
                    onClick={handleAddMedicine}
                    className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center space-x-0.5"
                  >
                    <Plus className="h-4.5 w-4.5" />
                    <span>Add Item</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {medicines.map((med, idx) => (
                    <div key={idx} className="flex gap-2 items-center flex-wrap sm:flex-nowrap border-b border-gray-100 dark:border-gray-750 pb-3 sm:pb-0 sm:border-b-0">
                      {/* Med Name */}
                      <input
                        type="text"
                        placeholder="Medicine Name (e.g. Paracetamol)"
                        value={med.name}
                        onChange={(e) => handleMedicineChange(idx, 'name', e.target.value)}
                        className="flex-grow min-w-[150px] bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                        required
                      />
                      {/* Dosage */}
                      <input
                        type="text"
                        placeholder="Dosage (e.g. 1-0-1)"
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(idx, 'dosage', e.target.value)}
                        className="w-24 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 text-xs text-center focus:outline-none"
                        required
                      />
                      {/* Duration */}
                      <input
                        type="text"
                        placeholder="Duration (5 days)"
                        value={med.duration}
                        onChange={(e) => handleMedicineChange(idx, 'duration', e.target.value)}
                        className="w-28 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 text-xs text-center focus:outline-none"
                        required
                      />
                      {/* Instruction */}
                      <select
                        value={med.instruction}
                        onChange={(e) => handleMedicineChange(idx, 'instruction', e.target.value)}
                        className="w-32 bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl px-2 py-2 text-xs focus:outline-none"
                      >
                        <option value="After meals">After meals</option>
                        <option value="Before meals">Before meals</option>
                        <option value="With milk">With milk</option>
                        <option value="As required">As required</option>
                      </select>
                      {/* Remove Button */}
                      <button
                        type="button"
                        onClick={() => handleRemoveMedicine(idx)}
                        disabled={medicines.length === 1}
                        className="text-rose-500 hover:text-rose-600 disabled:opacity-30 self-center"
                      >
                        <Trash2 className="h-4.5 w-4.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* NoteAdvice */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide">Advice / Special Notes</label>
                <textarea
                  rows="3"
                  placeholder="Drink plenty of water, bed rest for 2 days..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
                ></textarea>
              </div>

              {/* Submit Buttons */}
              <div className="flex gap-2 pt-2 border-t border-gray-100 dark:border-gray-700 mt-4">
                <button
                  type="button"
                  onClick={() => setShowPrescModal(false)}
                  className="flex-grow py-2.5 border border-gray-250 hover:bg-gray-50 rounded-xl text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingPresc}
                  className="flex-grow py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold text-xs flex items-center justify-center space-x-1"
                >
                  {submittingPresc ? (
                    <>
                      <Loader2 className="animate-spin h-4 w-4 mr-1 text-white" />
                      <span>Generating PDF...</span>
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4 mr-1" />
                      <span>Submit & Complete</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorAppointments;
