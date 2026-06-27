import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import {
  Calendar as CalendarIcon,
  Clock,
  MapPin,
  Star,
  Award,
  Video,
  User,
  AlertCircle,
  Loader2,
  BookmarkPlus
} from 'lucide-react';

const DoctorDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuth();

  const [doctor, setDoctor] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Booking states
  const [selectedDate, setSelectedDate] = useState('');
  const [selectedSlot, setSelectedSlot] = useState('');
  const [consultType, setConsultType] = useState('In-Person');
  const [symptoms, setSymptoms] = useState('');
  const [bookingSubmit, setBookingSubmit] = useState(false);

  // Calendar dates generation (next 7 days starting tomorrow)
  const [availableDates, setAvailableDates] = useState([]);

  useEffect(() => {
    const dates = [];
    for (let i = 1; i <= 7; i++) {
      const d = new Date();
      d.setDate(d.getDate() + i);
      dates.push({
        fullDate: d.toISOString().split('T')[0],
        dayName: d.toLocaleDateString('default', { weekday: 'long' }),
        displayDate: d.toLocaleDateString('default', { month: 'short', day: 'numeric' })
      });
    }
    setAvailableDates(dates);
    if (dates.length > 0) setSelectedDate(dates[0].fullDate);
  }, []);

  useEffect(() => {
    const fetchDocDetail = async () => {
      setLoading(true);
      try {
        // We fetch from the public endpoint so anyone can view
        const res = await axios.get(`/api/patient/doctors/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
        setDoctor(res.data.data);
        setReviews(res.data.reviews || []);
      } catch (err) {
        console.error('Error fetching doctor details:', err);
        toast.error('Could not load doctor details.');
      } finally {
        setLoading(false);
      }
    };
    fetchDocDetail();
  }, [id, token]);

  // Find availability slots for the selected date's day of week
  const getSlotsForSelectedDate = () => {
    if (!doctor || !selectedDate) return [];
    const dateObj = new Date(selectedDate);
    const dayOfWeek = dateObj.toLocaleDateString('default', { weekday: 'long' });
    const availabilityObject = doctor.availability.find(av => av.day === dayOfWeek);
    return availabilityObject ? availabilityObject.slots : [];
  };

  const handleBooking = async (e) => {
    e.preventDefault();

    if (!user || user.role !== 'patient') {
      toast.error('Please log in as a Patient to book an appointment.');
      navigate('/login');
      return;
    }

    if (!selectedSlot) {
      toast.error('Please select an available time slot.');
      return;
    }

    setBookingSubmit(true);
    try {
      const res = await axios.post(
        '/api/patient/appointments',
        {
          doctorId: doctor._id,
          date: selectedDate,
          slot: selectedSlot,
          type: consultType,
          symptoms
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success(res.data.message);
        navigate('/patient/dashboard');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Booking failed. Slot may already be reserved.');
    } finally {
      setBookingSubmit(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="flex flex-col items-center">
          <Loader2 className="h-12 w-12 text-sky-600 animate-spin" />
          <p className="mt-4 text-gray-500 font-semibold">Loading doctor profile...</p>
        </div>
      </div>
    );
  }

  if (!doctor) {
    return (
      <div className="text-center py-20 bg-gray-50 dark:bg-gray-900 text-gray-500 font-bold">
        Doctor profile not found.
      </div>
    );
  }

  const activeDaySlots = getSlotsForSelectedDate();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* Back button */}
      <Link to="/doctors" className="text-sm font-semibold text-sky-600 hover:text-sky-700 dark:text-sky-400 mb-6 inline-flex items-center">
        ← Back to Find Doctors
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mt-4">
        
        {/* Doctor Main Info (Left Column - Span 2) */}
        <section className="lg:col-span-2 space-y-8">
          
          {/* Main Card */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row gap-6 items-start">
              <div className="h-28 w-28 bg-sky-100 dark:bg-sky-950/40 text-sky-700 dark:text-sky-400 rounded-2xl flex items-center justify-center font-extrabold text-5xl uppercase shadow-inner border border-sky-200/20 shrink-0">
                {doctor.user?.name.charAt(0)}
              </div>
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white font-display">
                    Dr. {doctor.user?.name}
                  </h1>
                  <span className="bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 text-xs font-semibold px-2.5 py-0.5 rounded-full border border-sky-100 dark:border-sky-900/30">
                    {doctor.specialization?.name}
                  </span>
                </div>

                <p className="text-gray-400 text-sm font-medium italic">{doctor.qualifications.join(', ')}</p>

                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1 text-gray-400 shrink-0" />
                  <span>{doctor.hospital?.name} • {doctor.hospital?.location}</span>
                </div>

                <div className="flex items-center space-x-6 text-sm text-gray-650 dark:text-gray-300 pt-2">
                  <span className="flex items-center">
                    <Star className="h-4 w-4 text-amber-500 fill-current mr-1" />
                    <strong className="text-gray-800 dark:text-gray-200 mr-0.5">{doctor.rating || '5.0'}</strong> ({doctor.numReviews || 0} reviews)
                  </span>
                  <span>
                    Experience: <strong>{doctor.experience} Years</strong>
                  </span>
                  <span>
                    Consultation Fee: <strong className="text-emerald-600 dark:text-emerald-450">${doctor.consultationFee}</strong>
                  </span>
                </div>
              </div>
            </div>

            {/* Biography */}
            <div className="border-t border-gray-150 dark:border-gray-700 pt-6 space-y-2">
              <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">Biography</h3>
              <p className="text-sm text-gray-600 dark:text-gray-450 leading-relaxed">
                {doctor.bio || 'Dr. ' + doctor.user?.name + ' is a certified medical professional committed to providing top-quality diagnosis, treatment, and ongoing care within the community. Fluent in ' + doctor.languages.join(' and ') + '.'}
              </p>
            </div>
          </div>

          {/* Reviews List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-6">
            <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">
              Patient Reviews ({reviews.length})
            </h3>
            
            {reviews.length > 0 ? (
              <div className="space-y-4">
                {reviews.map((rev) => (
                  <div key={rev._id} className="border-b border-gray-100 dark:border-gray-700 pb-4 last:border-none last:pb-0 space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-750 flex items-center justify-center font-bold text-xs">
                          {rev.patient?.user?.name.charAt(0)}
                        </div>
                        <span className="font-semibold text-gray-800 dark:text-gray-200">{rev.patient?.user?.name}</span>
                      </div>
                      <div className="flex items-center space-x-1 text-amber-500 font-bold">
                        <Star className="h-3.5 w-3.5 fill-current" />
                        <span>{rev.rating}</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 pl-10 italic">
                      "{rev.comment}"
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500 italic">No feedback reviews submitted yet.</p>
            )}
          </div>

        </section>

        {/* Booking Calendar Widget (Right Column) */}
        <section className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-lg h-max space-y-6">
          <div className="border-b border-gray-150 dark:border-gray-700 pb-4">
            <h3 className="font-extrabold text-lg text-gray-900 dark:text-white font-display flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-sky-500" />
              <span>Book Appointment</span>
            </h3>
          </div>

          <form onSubmit={handleBooking} className="space-y-4">
            {/* Consultation Type */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Consultation Type</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConsultType('In-Person')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    consultType === 'In-Person'
                      ? 'border-sky-600 bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-750'
                  }`}
                >
                  In-Person Visit
                </button>
                <button
                  type="button"
                  onClick={() => setConsultType('Online')}
                  className={`py-2 rounded-xl text-xs font-bold border transition-all ${
                    consultType === 'Online'
                      ? 'border-sky-600 bg-sky-50 text-sky-600 dark:bg-sky-950/20 dark:text-sky-400'
                      : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-750'
                  }`}
                >
                  <span className="flex items-center justify-center space-x-1">
                    <Video className="h-3.5 w-3.5" />
                    <span>Online Video</span>
                  </span>
                </button>
              </div>
            </div>

            {/* Date Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select Date</label>
              <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                {availableDates.map((date) => (
                  <button
                    key={date.fullDate}
                    type="button"
                    onClick={() => {
                      setSelectedDate(date.fullDate);
                      setSelectedSlot('');
                    }}
                    className={`flex flex-col items-center p-3 rounded-xl border shrink-0 min-w-[70px] text-center transition-all ${
                      selectedDate === date.fullDate
                        ? 'border-sky-600 bg-sky-600 text-white shadow-md'
                        : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-705 dark:text-gray-300 hover:bg-gray-100'
                    }`}
                  >
                    <span className="text-[10px] uppercase font-bold tracking-wide">
                      {date.dayName.substring(0, 3)}
                    </span>
                    <span className="text-sm font-black mt-1">
                      {date.displayDate.split(' ')[1]}
                    </span>
                    <span className="text-[10px] mt-0.5">
                      {date.displayDate.split(' ')[0]}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Time Slot Select */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Select Time Slot</label>
              
              {activeDaySlots.length > 0 ? (
                <div className="grid grid-cols-3 gap-2">
                  {activeDaySlots.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedSlot(slot)}
                      className={`py-2.5 px-1 rounded-xl text-xs font-semibold border transition-all text-center ${
                        selectedSlot === slot
                          ? 'border-emerald-600 bg-emerald-600 text-white shadow-md'
                          : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-750 text-gray-700 dark:text-gray-350 hover:bg-gray-100'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-400 p-4 rounded-xl text-xs flex items-start space-x-2 border border-amber-250/20">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>Dr. {doctor.user?.name} has not configured schedule slots for this day.</span>
                </div>
              )}
            </div>

            {/* Symptoms Description */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Symptoms / Notes</label>
              <textarea
                rows="3"
                placeholder="Describe your health symptoms..."
                value={symptoms}
                onChange={(e) => setSymptoms(e.target.value)}
                className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-350 dark:border-gray-650 rounded-xl p-3 text-sm focus:ring-2 focus:ring-sky-500 focus:outline-none"
              ></textarea>
            </div>

            {/* Booking confirmation notice */}
            {user && user.role !== 'patient' && (
              <div className="bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-450 p-3 rounded-xl text-xs border border-rose-250/20 font-medium">
                Log out and sign in as a Patient to book.
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={bookingSubmit || activeDaySlots.length === 0}
              className="w-full flex justify-center items-center py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200"
            >
              {bookingSubmit ? (
                <>
                  <Loader2 className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" />
                  <span>Booking slot...</span>
                </>
              ) : (
                <>
                  <BookmarkPlus className="h-4 w-4 mr-2" />
                  <span>Confirm Appointment</span>
                </>
              )}
            </button>
          </form>
        </section>

      </div>
    </div>
  );
};

export default DoctorDetail;
