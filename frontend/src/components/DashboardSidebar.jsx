import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  LayoutDashboard,
  Calendar,
  User,
  FileText,
  CheckSquare,
  Building,
  Activity,
  LogOut,
  Users
} from 'lucide-react';

const DashboardSidebar = () => {
  const { user, logout } = useAuth();

  if (!user) return null;

  const getLinks = () => {
    switch (user.role) {
      case 'patient':
        return [
          { name: 'Overview', path: '/patient/dashboard', icon: LayoutDashboard },
          { name: 'My Profile', path: '/patient/profile', icon: User },
          { name: 'Prescriptions', path: '/patient/prescriptions', icon: FileText }
        ];
      case 'doctor':
        return [
          { name: 'Overview', path: '/doctor/dashboard', icon: LayoutDashboard },
          { name: 'Appointments', path: '/doctor/appointments', icon: Calendar },
          { name: 'Availability Slots', path: '/doctor/schedule', icon: CheckSquare },
          { name: 'My Profile', path: '/doctor/profile', icon: User }
        ];
      case 'admin':
        return [
          { name: 'Overview', path: '/admin/dashboard', icon: LayoutDashboard },
          { name: 'Doctor Approvals', path: '/admin/approvals', icon: CheckSquare },
          { name: 'Manage Patients', path: '/admin/patients', icon: Users },
          { name: 'Manage Doctors', path: '/admin/doctors', icon: Activity },
          { name: 'Hospitals & Clinics', path: '/admin/hospitals', icon: Building }
        ];
      default:
        return [];
    }
  };

  const links = getLinks();

  return (
    <aside className="w-full md:w-64 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 min-h-screen shrink-0 transition-colors duration-200">
      <div className="p-6">
        <div className="flex flex-col items-center border-b border-gray-150 dark:border-gray-700 pb-6 mb-6">
          <div className="h-14 w-14 rounded-full bg-sky-100 dark:bg-sky-950 flex items-center justify-center text-sky-600 dark:text-sky-400 font-bold text-xl uppercase mb-3 shadow-inner">
            {user.name.charAt(0)}
          </div>
          <h4 className="font-semibold text-gray-800 dark:text-gray-150 text-base leading-tight text-center">{user.name}</h4>
          <span className="text-xs font-semibold uppercase text-emerald-500 mt-1 tracking-wider bg-emerald-50 dark:bg-emerald-950/30 px-2 py-0.5 rounded-full border border-emerald-200/40">
            {user.role}
          </span>
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.name}
                to={link.path}
                end={link.name === 'Overview'}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-600 dark:text-sky-400 border-l-4 border-sky-600'
                      : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-750 hover:text-gray-900 dark:hover:text-gray-200'
                  }`
                }
              >
                <Icon className="h-5 w-5 shrink-0" />
                <span>{link.name}</span>
              </NavLink>
            );
          })}

          <button
            onClick={logout}
            className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-rose-50 dark:hover:bg-rose-950/20 hover:text-rose-600 dark:hover:text-rose-400 transition-all mt-4"
          >
            <LogOut className="h-5 w-5 shrink-0" />
            <span>Sign Out</span>
          </button>
        </nav>
      </div>
    </aside>
  );
};

export default DashboardSidebar;
