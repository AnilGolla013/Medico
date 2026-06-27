import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { FileText, Download, User, Calendar, Loader2 } from 'lucide-react';

const PatientPrescriptions = () => {
  const { token } = useAuth();
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPrescriptions = async () => {
      try {
        const res = await axios.get('/api/patient/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // Filter appointments that have a prescription attached
        setAppointments(res.data.data.filter(a => a.prescription));
      } catch (err) {
        console.error('Error fetching prescriptions:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      fetchPrescriptions();
    }
  }, [token]);

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
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">My Prescriptions</h2>
        <p className="text-xs text-gray-400 mt-1">Access all clinical guidelines and digital prescription PDFs</p>
      </div>

      {appointments.length > 0 ? (
        <div className="space-y-6">
          {appointments.map((appt) => (
            <div
              key={appt._id}
              className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4 hover:border-sky-350 transition-colors"
            >
              {/* Presc Header */}
              <div className="flex justify-between items-start flex-wrap gap-4 border-b border-gray-100 dark:border-gray-700 pb-3">
                <div className="flex items-center space-x-3">
                  <div className="h-10 w-10 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center font-bold">
                    Rx
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-850 dark:text-white">Dr. {appt.doctor?.user?.name}</h3>
                    <p className="text-xs text-gray-400">{appt.doctor?.specialization?.name} • {appt.hospital?.name}</p>
                  </div>
                </div>

                <div className="flex items-center space-x-4 text-xs">
                  <span className="text-gray-400 flex items-center">
                    <Calendar className="h-3.5 w-3.5 mr-1" />
                    {new Date(appt.prescription.date).toLocaleDateString()}
                  </span>
                  <a
                    href={appt.prescription.pdfUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white font-bold px-3 py-1.5 rounded-lg shadow-sm text-xs"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>

              {/* Medicines List */}
              <div className="space-y-3">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wide">Prescribed Medications</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {appt.prescription.medicines.map((med, idx) => (
                    <div key={idx} className="bg-gray-50 dark:bg-gray-900/30 border border-gray-150 dark:border-gray-700 p-3 rounded-xl text-xs space-y-1">
                      <div className="flex justify-between">
                        <strong className="text-gray-800 dark:text-gray-200">{med.name}</strong>
                        <span className="bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded font-bold">{med.dosage}</span>
                      </div>
                      <p className="text-gray-450">Duration: <span className="text-gray-700 dark:text-gray-300 font-semibold">{med.duration}</span></p>
                      {med.instruction && (
                        <p className="text-gray-450 italic">Instruction: {med.instruction}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Advice Notes */}
              {appt.prescription.notes && (
                <div className="bg-sky-50/40 dark:bg-sky-950/10 p-3 rounded-xl border border-sky-100/30 text-xs">
                  <strong className="text-sky-700 dark:text-sky-400 block mb-1">Doctor Advice / Recommendations:</strong>
                  <p className="text-gray-650 dark:text-gray-300 italic leading-relaxed">
                    {appt.prescription.notes}
                  </p>
                </div>
              )}

            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-8 text-center rounded-2xl">
          <p className="text-gray-500 dark:text-gray-400 text-sm">No prescriptions found. Prescriptions will display here once written by consulting doctors.</p>
        </div>
      )}
    </div>
  );
};

export default PatientPrescriptions;
