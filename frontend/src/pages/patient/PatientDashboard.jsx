import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  CheckCircle,
  XCircle,
  FileText,
  AlertCircle,
  Star,
  Loader2,
  Trash2,
  Edit2
} from 'lucide-react';

const PatientDashboard = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Reschedule Modal States
  const [showReschedModal, setShowReschedModal] = useState(false);
  const [reschedApptId, setReschedApptId] = useState(null);
  const [reschedDate, setReschedDate] = useState('');
  const [reschedSlot, setReschedSlot] = useState('');
  const [reschedDoctorId, setReschedDoctorId] = useState(null);
  const [doctorSlots, setDoctorSlots] = useState([]);

  // Review Modal States
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewDoctorId, setReviewDoctorId] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  const fetchAppointments = async () => {
    try {
      const res = await axios.get('/api/patient/appointments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setAppointments(res.data.data);
    } catch (err) {
      console.error('Error loading appointments:', err);
      toast.error('Could not load appointment details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchAppointments();
    }
  }, [token]);

  const handleCancel = async (apptId) => {
    if (!window.confirm('Are you sure you want to cancel this appointment?')) return;
    try {
      const res = await axios.put(
        `/api/patient/appointments/${apptId}/cancel`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Cancellation failed.');
    }
  };

  // Open reschedule setup
  const openReschedule = async (appt) => {
    setReschedApptId(appt._id);
    setReschedDoctorId(appt.doctor._id);
    // Find doctor availability slots
    try {
      const res = await axios.get(`/api/patient/doctors/${appt.doctor._id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Set slots (we'll fetch general slots first or let patient pick date first)
      setDoctorSlots(res.data.data.availability || []);
    } catch (err) {
      console.error(err);
    }
    setShowReschedModal(true);
  };

  // Get slots for rescheduling day
  const getSlotsForReschedDate = () => {
    if (!reschedDate || doctorSlots.length === 0) return [];
    const dateObj = new Date(reschedDate);
    const dayOfWeek = dateObj.toLocaleDateString('default', { weekday: 'long' });
    const availabilityObject = doctorSlots.find(av => av.day === dayOfWeek);
    return availabilityObject ? availabilityObject.slots : [];
  };

  const handleReschedule = async (e) => {
    e.preventDefault();
    if (!reschedSlot) {
      toast.error('Please pick an available time slot.');
      return;
    }
    try {
      const res = await axios.put(
        `/api/patient/appointments/${reschedApptId}/reschedule`,
        { date: reschedDate, slot: reschedSlot },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setShowReschedModal(false);
        fetchAppointments();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Rescheduling failed.');
    }
  };

  // Open review setup
  const openReview = (doctorId) => {
    setReviewDoctorId(doctorId);
    setReviewRating(5);
    setReviewComment('');
    setShowReviewModal(true);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      const res = await axios.post(
        '/api/patient/reviews',
        { doctorId: reviewDoctorId, rating: reviewRating, comment: reviewComment },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success(res.data.message);
        setShowReviewModal(false);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  // Split appointments into Active and History
  const activeAppts = appointments.filter(
    (a) => ['Pending', 'Accepted'].includes(a.status)
  );
  const historyAppts = appointments.filter(
    (a) => ['Completed', 'Cancelled', 'Rejected'].includes(a.status)
  );

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Appointments', value: appointments.length, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20' },
          { label: 'Active Bookings', value: activeAppts.length, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Completed Visits', value: appointments.filter(a => a.status === 'Completed').length, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Cancelled/Declined', value: appointments.filter(a => ['Cancelled', 'Rejected'].includes(a.status)).length, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/20' }
        ].map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex items-center space-x-4">
            <div className={`h-12 w-12 rounded-xl flex items-center justify-center font-bold text-lg ${stat.color}`}>
              {stat.value}
            </div>
            <div>
              <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">{stat.label}</p>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display mt-0.5">{stat.value}</h3>
            </div>
          </div>
        ))}
      </section>

      {/* Active Appointments */}
      <section className="space-y-4">
        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-display">Active Consultations</h3>
        
        {activeAppts.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {activeAppts.map((appt) => (
              <div
                key={appt._id}
                className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 rounded-2xl shadow-sm space-y-4 hover:border-sky-300 transition-colors"
              >
                <div className="flex justify-between items-start">
                  <div className="flex items-center space-x-3">
                    <div className="h-10 w-10 bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-xl flex items-center justify-center font-bold text-sm uppercase">
                      {appt.doctor?.user?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-gray-900 dark:text-white">
                        Dr. {appt.doctor?.user?.name}
                      </h4>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-medium">
                        {appt.doctor?.specialization?.name}
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                      appt.status === 'Accepted'
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-250/20'
                        : 'bg-amber-50 dark:bg-amber-950/20 text-amber-600 border border-amber-250/20'
                    }`}
                  >
                    {appt.status}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-gray-500 dark:text-gray-400 border-t border-b border-gray-100 dark:border-gray-700 py-3">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="h-3.5 w-3.5 text-gray-400" />
                    <span>{new Date(appt.date).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Clock className="h-3.5 w-3.5 text-gray-400" />
                    <span>{appt.slot}</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Video className="h-3.5 w-3.5 text-gray-400" />
                    <span>{appt.type} consult</span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="h-3.5 w-3.5 text-gray-400" />
                    <span className="truncate">{appt.hospital?.name}</span>
                  </div>
                </div>

                {appt.symptoms && (
                  <p className="text-xs text-gray-400 italic">
                    <strong>Symptoms:</strong> {appt.symptoms}
                  </p>
                )}

                <div className="flex gap-2">
                  <button
                    onClick={() => openReschedule(appt)}
                    className="flex-grow flex items-center justify-center space-x-1 border border-gray-250 hover:bg-gray-50 dark:border-gray-750 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-200 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Edit2 className="h-3.5 w-3.5" />
                    <span>Reschedule</span>
                  </button>
                  <button
                    onClick={() => handleCancel(appt._id)}
                    className="flex-grow flex items-center justify-center space-x-1 bg-rose-50 hover:bg-rose-100 text-rose-600 py-2 rounded-lg text-xs font-semibold transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Cancel Booking</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-8 text-center rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No active consultations booked at the moment.</p>
            <Link
              to="/doctors"
              className="mt-4 inline-block bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs px-4 py-2 rounded-lg shadow-sm"
            >
              Book an Appointment
            </Link>
          </div>
        )}
      </section>

      {/* History Appointments */}
      <section className="space-y-4">
        <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-display">Appointment History</h3>

        {historyAppts.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Doctor</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Prescription</th>
                    <th className="px-6 py-3 text-right text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-250 dark:divide-gray-750 text-sm text-gray-700 dark:text-gray-300">
                  {historyAppts.map((appt) => (
                    <tr key={appt._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className="h-7 w-7 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {appt.doctor?.user?.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-gray-800 dark:text-gray-150">Dr. {appt.doctor?.user?.name}</p>
                            <p className="text-[10px] text-gray-400">{appt.doctor?.specialization?.name}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p>{new Date(appt.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400">{appt.slot}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs">{appt.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            appt.status === 'Completed'
                              ? 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 border border-emerald-250/20'
                              : appt.status === 'Cancelled'
                              ? 'bg-gray-100 dark:bg-gray-800 text-gray-500'
                              : 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 border border-rose-250/20'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {appt.prescription ? (
                          <a
                            href={appt.prescription.pdfUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center space-x-1 text-sky-600 hover:text-sky-700 font-bold"
                          >
                            <FileText className="h-4 w-4" />
                            <span>Download PDF</span>
                          </a>
                        ) : (
                          <span className="text-xs text-gray-400 italic">None written</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right">
                        {appt.status === 'Completed' && (
                          <button
                            onClick={() => openReview(appt.doctor._id)}
                            className="inline-flex items-center space-x-1 bg-amber-50 hover:bg-amber-100 dark:bg-amber-950/20 text-amber-600 px-3 py-1 rounded-lg text-xs font-bold transition-all"
                          >
                            <Star className="h-3 w-3 fill-current" />
                            <span>Leave Review</span>
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
          <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-8 text-center rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No historical clinical bookings recorded.</p>
          </div>
        )}
      </section>

      {/* Reschedule Modal */}
      {showReschedModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 max-w-sm w-full p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-display">Reschedule Consultation</h3>
            
            <form onSubmit={handleReschedule} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={reschedDate}
                  onChange={(e) => {
                    setReschedDate(e.target.value);
                    setReschedSlot('');
                  }}
                  className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm"
                  required
                />
              </div>

              {reschedDate && (
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">New Time Slot</label>
                  {getSlotsForReschedDate().length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {getSlotsForReschedDate().map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setReschedSlot(slot)}
                          className={`py-2 px-1 rounded-lg text-xs font-semibold border transition-all ${
                            reschedSlot === slot
                              ? 'border-emerald-600 bg-emerald-600 text-white'
                              : 'border-gray-250 bg-gray-50 text-gray-700 hover:bg-gray-100'
                          }`}
                        >
                          {slot}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-amber-600 italic">No schedules set for this day. Select another date.</p>
                  )}
                </div>
              )}

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReschedModal(false)}
                  className="flex-grow py-2 border border-gray-250 hover:bg-gray-50 rounded-lg text-xs font-semibold"
                >
                  Close
                </button>
                <button
                  type="submit"
                  disabled={!reschedSlot}
                  className="flex-grow py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold disabled:opacity-55"
                >
                  Save Date
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm px-4">
          <div className="bg-white dark:bg-gray-800 max-w-sm w-full p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-xl space-y-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-display">Write Doctor Review</h3>
            
            <form onSubmit={handleReviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Star Rating</label>
                <div className="flex space-x-2 text-amber-500">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="focus:outline-none hover:scale-110 transition-transform"
                    >
                      <Star className={`h-6 w-6 ${star <= reviewRating ? 'fill-current' : 'stroke-current text-gray-300'}`} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-1">Your Comment</label>
                <textarea
                  rows="3"
                  placeholder="Describe your consulting experience..."
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-3 text-sm focus:outline-none"
                  required
                ></textarea>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowReviewModal(false)}
                  className="flex-grow py-2 border border-gray-250 hover:bg-gray-50 rounded-lg text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingReview}
                  className="flex-grow py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold"
                >
                  {submittingReview ? 'Submitting...' : 'Post Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default PatientDashboard;
