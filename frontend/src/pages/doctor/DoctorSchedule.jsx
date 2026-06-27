import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-hot-toast';
import axios from 'axios';
import { Clock, Calendar, CheckSquare, Loader2 } from 'lucide-react';

const STANDARD_SLOTS = [
  '09:00 AM', '09:30 AM', '10:00 AM', '10:30 AM', '11:00 AM', '11:30 AM',
  '12:00 PM', '02:00 PM', '02:30 PM', '03:00 PM', '03:30 PM', '04:00 PM',
  '04:30 PM', '05:00 PM'
];

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const DoctorSchedule = () => {
  const { profile, token, refreshProfile } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize schedule from doctor profile availability
  const getInitialSchedule = () => {
    const sched = {};
    DAYS_OF_WEEK.forEach(day => {
      const match = profile?.availability?.find(av => av.day === day);
      sched[day] = {
        enabled: !!match,
        slots: match ? [...match.slots] : []
      };
    });
    return sched;
  };

  const [schedule, setSchedule] = useState(getInitialSchedule());

  const handleDayToggle = (day) => {
    setSchedule({
      ...schedule,
      [day]: {
        ...schedule[day],
        enabled: !schedule[day].enabled,
        slots: !schedule[day].enabled ? ['09:00 AM', '10:00 AM', '02:00 PM'] : [] // Default slots when enabling
      }
    });
  };

  const handleSlotToggle = (day, slot) => {
    const daySched = schedule[day];
    let updatedSlots = [];
    if (daySched.slots.includes(slot)) {
      updatedSlots = daySched.slots.filter(s => s !== slot);
    } else {
      updatedSlots = [...daySched.slots, slot].sort((a, b) => {
        return STANDARD_SLOTS.indexOf(a) - STANDARD_SLOTS.indexOf(b);
      });
    }

    setSchedule({
      ...schedule,
      [day]: {
        ...daySched,
        slots: updatedSlots
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Build availability payload
      const availability = [];
      DAYS_OF_WEEK.forEach(day => {
        if (schedule[day].enabled && schedule[day].slots.length > 0) {
          availability.push({
            day,
            slots: schedule[day].slots
          });
        }
      });

      const res = await axios.put(
        '/api/doctor/profile',
        { availability },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (res.data.success) {
        toast.success('Availability schedule updated successfully!');
        await refreshProfile();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update schedule.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 md:p-8 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm max-w-4xl space-y-6 transition-colors duration-200">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-sky-500" />
          <span>Manage Availability Schedule</span>
        </h2>
        <p className="text-xs text-gray-400 mt-1">Check the days you are available and select consultation time slots</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          {DAYS_OF_WEEK.map((day) => (
            <div
              key={day}
              className="border border-gray-150 dark:border-gray-700 rounded-2xl p-4 sm:p-5 flex flex-col md:flex-row gap-4 items-start md:items-center transition-all bg-gray-50/20 dark:bg-gray-900/10"
            >
              {/* Day checkbox */}
              <div className="flex items-center space-x-3 w-40 shrink-0 select-none">
                <input
                  type="checkbox"
                  id={`check-${day}`}
                  checked={schedule[day].enabled}
                  onChange={() => handleDayToggle(day)}
                  className="h-4.5 w-4.5 text-sky-600 focus:ring-sky-500 border-gray-300 rounded"
                />
                <label htmlFor={`check-${day}`} className="font-extrabold text-sm text-gray-800 dark:text-gray-250 cursor-pointer">
                  {day}
                </label>
              </div>

              {/* Slots selector */}
              {schedule[day].enabled ? (
                <div className="flex-grow space-y-2">
                  <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wide">Available Hours</span>
                  <div className="flex flex-wrap gap-2">
                    {STANDARD_SLOTS.map((slot) => {
                      const active = schedule[day].slots.includes(slot);
                      return (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => handleSlotToggle(day, slot)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                            active
                              ? 'bg-emerald-55 text-white border-emerald-600 shadow-sm'
                              : 'bg-white dark:bg-gray-750 text-gray-600 dark:text-gray-350 border-gray-200 dark:border-gray-650 hover:bg-gray-50'
                          }`}
                        >
                          {slot}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-gray-400 italic flex-grow">Marked as unavailable</p>
              )}
            </div>
          ))}
        </div>

        {/* Submit */}
        <div className="pt-2 border-t border-gray-100 dark:border-gray-700">
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full flex justify-center items-center py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold shadow transition-colors"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin mr-2" />
                <span>Saving Schedule...</span>
              </>
            ) : (
              <span>Save Schedule Settings</span>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default DoctorSchedule;
