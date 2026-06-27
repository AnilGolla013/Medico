import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import {
  Calendar,
  DollarSign,
  CheckCircle,
  Users,
  Clock,
  Video,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

// Register ChartJS elements
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const DoctorDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [recentAppointments, setRecentAppointments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadDashboardData = async () => {
      try {
        // Fetch stats
        const statsRes = await axios.get('/api/doctor/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(statsRes.data.stats);
        setChartData(rescheduleChartPayload(statsRes.data.chartData));

        // Fetch appointments
        const apptsRes = await axios.get('/api/doctor/appointments', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setRecentAppointments(apptsRes.data.data.slice(0, 5)); // Keep first 5 recent
      } catch (err) {
        console.error('Error loading doctor dashboard stats:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      loadDashboardData();
    }
  }, [token]);

  // Restructure Chart.js payload
  const rescheduleChartPayload = (rawAnalytics) => {
    if (!rawAnalytics) return {};
    const labels = rawAnalytics.map(item => item.month);
    const bookings = rawAnalytics.map(item => item.appointments);
    const earnings = rawAnalytics.map(item => item.earnings);

    return {
      labels,
      datasets: [
        {
          label: 'Consultation Earnings ($)',
          data: earnings,
          backgroundColor: 'rgba(16, 185, 129, 0.75)', // Success green
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 8
        },
        {
          label: 'Bookings Count',
          data: bookings,
          backgroundColor: 'rgba(14, 165, 233, 0.75)', // Primary blue
          borderColor: 'rgba(14, 165, 233, 1)',
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    };
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-10 w-10 text-sky-500 animate-spin" />
      </div>
    );
  }

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: false }
    },
    scales: {
      y: { beginAtZero: true }
    }
  };

  return (
    <div className="space-y-8">
      {/* Stats Section */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Appointments', value: stats?.totalAppointments || 0, icon: Users, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20' },
          { label: "Today's Consults", value: stats?.todayAppointments || 0, icon: Calendar, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Completed Visits', value: stats?.completedAppointments || 0, icon: CheckCircle, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Total Earnings', value: `$${stats?.totalEarnings || 0}`, icon: DollarSign, color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40' }
        ].map((stat, idx) => {
          const Icon = stat.icon;
          return (
            <div key={idx} className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm flex items-center space-x-4">
              <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${stat.color}`}>
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <p className="text-xs font-semibold uppercase text-gray-400 tracking-wider">{stat.label}</p>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white font-display mt-0.5">{stat.value}</h3>
              </div>
            </div>
          );
        })}
      </section>

      {/* Analytics Chart */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-gray-800 dark:text-white font-display">6-Month Clinical Analytics</h3>
          {chartData?.labels ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p className="text-xs text-gray-400 italic">No historical charts analytics data found.</p>
          )}
        </div>

        {/* Schedule quick actions block */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <h3 className="font-bold text-base text-gray-800 dark:text-white font-display">Clinic Schedule</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Configure available consultation days and daily time slots so patients can search and book visits.
            </p>
          </div>
          <div className="bg-sky-50 dark:bg-sky-950/20 p-4 rounded-xl text-xs space-y-1">
            <p className="font-bold text-sky-750 dark:text-sky-400">Status Check</p>
            <p className="text-gray-500 dark:text-gray-405">Configure daily schedules from 09:00 AM to 05:00 PM easily.</p>
          </div>
          <Link
            to="/doctor/schedule"
            className="w-full text-center bg-sky-600 hover:bg-sky-700 text-white font-bold py-3 rounded-xl text-xs flex items-center justify-center space-x-1"
          >
            <span>Set Availability Slots</span>
            <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      {/* Recent Appointments */}
      <section className="space-y-4">
        <div className="flex justify-between items-center">
          <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">Recent Consultations</h3>
          <Link to="/doctor/appointments" className="text-xs font-bold text-sky-600 hover:underline">
            View All
          </Link>
        </div>

        {recentAppointments.length > 0 ? (
          <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-900/50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Patient</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Date & Time</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-250 dark:divide-gray-750 text-sm text-gray-700 dark:text-gray-300">
                  {recentAppointments.map((appt) => (
                    <tr key={appt._id} className="hover:bg-gray-50/50 dark:hover:bg-gray-900/20">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p className="font-semibold text-gray-800 dark:text-gray-150">{appt.patient?.user?.name || 'Valued Patient'}</p>
                        <p className="text-[10px] text-gray-400">Gender: {appt.patient?.gender || 'N/A'}</p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <p>{new Date(appt.date).toLocaleDateString()}</p>
                        <p className="text-xs text-gray-400 flex items-center">
                          <Clock className="h-3 w-3 mr-1 text-gray-400" />
                          <span>{appt.slot}</span>
                        </p>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-xs">{appt.type}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                            appt.status === 'Completed'
                              ? 'bg-emerald-50 text-emerald-600'
                              : appt.status === 'Accepted'
                              ? 'bg-sky-50 text-sky-600'
                              : appt.status === 'Pending'
                              ? 'bg-amber-50 text-amber-600'
                              : 'bg-rose-50 text-rose-600'
                          }`}
                        >
                          {appt.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-8 text-center rounded-2xl">
            <p className="text-gray-500 dark:text-gray-400 text-sm">No recent bookings recorded.</p>
          </div>
        )}
      </section>

    </div>
  );
};

export default DoctorDashboard;
