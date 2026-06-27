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
  Activity,
  DollarSign,
  Calendar,
  Users,
  Building,
  CheckSquare,
  ArrowUpRight,
  Loader2
} from 'lucide-react';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

const AdminDashboard = () => {
  const { token } = useAuth();
  const [stats, setStats] = useState(null);
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadAdminStats = async () => {
      try {
        const res = await axios.get('/api/admin/dashboard/stats', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setStats(res.data.stats);
        setChartData(rescheduleChartPayload(res.data.chartData));
      } catch (err) {
        console.error('Error fetching admin statistics:', err);
      } finally {
        setLoading(false);
      }
    };
    if (token) {
      loadAdminStats();
    }
  }, [token]);

  const rescheduleChartPayload = (rawAnalytics) => {
    if (!rawAnalytics) return {};
    const labels = rawAnalytics.map(item => item.month);
    const bookings = rawAnalytics.map(item => item.appointments);
    const revenue = rawAnalytics.map(item => item.revenue);

    return {
      labels,
      datasets: [
        {
          label: 'Platform Revenue ($)',
          data: revenue,
          backgroundColor: 'rgba(16, 185, 129, 0.75)', // Success green
          borderColor: 'rgba(16, 185, 129, 1)',
          borderWidth: 1,
          borderRadius: 8
        },
        {
          label: 'Appointments Volume',
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
      {/* Stats Cards Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Registered Doctors', value: stats?.totalDoctors || 0, icon: Activity, color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/20' },
          { label: 'Registered Patients', value: stats?.totalPatients || 0, icon: Users, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/20' },
          { label: 'Total Bookings', value: stats?.totalAppointments || 0, icon: Calendar, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/20' },
          { label: 'Total Platform Revenue', value: `$${stats?.totalRevenue || 0}`, icon: DollarSign, color: 'text-emerald-700 bg-emerald-100 dark:bg-emerald-950/40' }
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

      {/* Main Stats Chart & Navigation Cards */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Chart */}
        <div className="lg:col-span-2 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
          <h3 className="font-bold text-base text-gray-800 dark:text-white font-display">System-wide Financial Analytics</h3>
          {chartData?.labels ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <p className="text-xs text-gray-400 italic">No system analytics charts available.</p>
          )}
        </div>

        {/* Admin Shortcuts Side Block */}
        <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4 flex flex-col justify-between">
          <div className="space-y-3">
            <h3 className="font-bold text-base text-gray-800 dark:text-white font-display">Administrative Actions</h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              Vetting newly registered clinical partners, monitoring system activity logs, managing departments, and clinic databases.
            </p>
          </div>
          
          <div className="space-y-2">
            <Link
              to="/admin/approvals"
              className="w-full text-center bg-gray-50 hover:bg-sky-50 hover:text-sky-600 dark:bg-gray-750 dark:hover:bg-sky-950 dark:text-gray-250 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 transition-all"
            >
              <span>Vetting & Credentials Review</span>
              <CheckSquare className="h-4 w-4" />
            </Link>

            <Link
              to="/admin/hospitals"
              className="w-full text-center bg-gray-50 hover:bg-sky-50 hover:text-sky-600 dark:bg-gray-750 dark:hover:bg-sky-950 dark:text-gray-250 font-bold py-2.5 rounded-lg text-xs flex items-center justify-center space-x-1 transition-all"
            >
              <span>Manage Hospital Datasets</span>
              <Building className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default AdminDashboard;
