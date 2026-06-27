import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import { useForm } from 'react-hook-form';
import { toast } from 'react-hot-toast';
import { Building, Award, Plus, Loader2 } from 'lucide-react';

const AdminHospitals = () => {
  const { token } = useAuth();
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [addingHosp, setAddingHosp] = useState(false);
  const [addingDept, setAddingDept] = useState(false);

  const {
    register: registerHosp,
    handleSubmit: handleSubmitHosp,
    reset: resetHosp
  } = useForm();

  const {
    register: registerDept,
    handleSubmit: handleSubmitDept,
    reset: resetDept
  } = useForm();

  const fetchData = async () => {
    try {
      const hosps = await axios.get('/api/admin/hospitals', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const depts = await axios.get('/api/admin/departments', {
        headers: { Authorization: `Bearer ${token}` }
      });
      setHospitals(hosps.data.data);
      setDepartments(depts.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchData();
    }
  }, [token]);

  const onAddHospital = async (data) => {
    setAddingHosp(true);
    try {
      const res = await axios.post('/api/admin/hospitals', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        resetHosp();
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create hospital.');
    } finally {
      setAddingHosp(false);
    }
  };

  const onAddDept = async (data) => {
    setAddingDept(true);
    try {
      const res = await axios.post('/api/admin/departments', data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        resetDept();
        fetchData();
      }
    } catch (err) {
      toast.error('Failed to create specialty.');
    } finally {
      setAddingDept(false);
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
    <div className="space-y-8">
      <div>
        <h2 className="text-xl font-extrabold text-gray-900 dark:text-white font-display">Hospital & Departments Configuration</h2>
        <p className="text-xs text-gray-400 mt-1">Add clinics, clinical locations, and new medical departments</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* HOSPITALS LAYER */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-sky-600 dark:text-sky-400 uppercase tracking-wide flex items-center space-x-1">
              <Building className="h-4.5 w-4.5" />
              <span>Register New Hospital</span>
            </h3>

            <form onSubmit={handleSubmitHosp(onAddHospital)} className="space-y-3">
              <input
                type="text"
                placeholder="Hospital Name (e.g. City Care General)"
                {...registerHosp('name', { required: true })}
                className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Hospital Location / City"
                {...registerHosp('location', { required: true })}
                className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <textarea
                rows="2"
                placeholder="Description..."
                {...registerHosp('description')}
                className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs focus:outline-none"
              ></textarea>
              <button
                type="submit"
                disabled={addingHosp}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1"
              >
                {addingHosp ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
                <span>Add Hospital</span>
              </button>
            </form>
          </div>

          {/* Hospitals List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-white font-display">Hospitals Clinic Registry ({hospitals.length})</h4>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto pr-1">
              {hospitals.map(hosp => (
                <div key={hosp._id} className="py-2.5 text-xs">
                  <p className="font-bold text-gray-800 dark:text-gray-205">{hosp.name}</p>
                  <p className="text-gray-400 mt-0.5">{hosp.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* DEPARTMENTS LAYER */}
        <div className="space-y-6">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
            <h3 className="font-extrabold text-sm text-sky-600 dark:text-sky-400 uppercase tracking-wide flex items-center space-x-1">
              <Award className="h-4.5 w-4.5" />
              <span>Create Medical specialty</span>
            </h3>

            <form onSubmit={handleSubmitDept(onAddDept)} className="space-y-3">
              <input
                type="text"
                placeholder="Department Name (e.g. Cardiology)"
                {...registerDept('name', { required: true })}
                className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-sky-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Lucide Icon Tag (e.g. Heart, Brain, Baby)"
                {...registerDept('icon')}
                className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs focus:outline-none"
              />
              <textarea
                rows="2"
                placeholder="Specialty Description..."
                {...registerDept('description')}
                className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-xs focus:outline-none"
              ></textarea>
              <button
                type="submit"
                disabled={addingDept}
                className="w-full bg-sky-600 hover:bg-sky-700 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center space-x-1"
              >
                {addingDept ? <Loader2 className="animate-spin h-4 w-4" /> : <Plus className="h-4 w-4" />}
                <span>Create Specialty</span>
              </button>
            </form>
          </div>

          {/* Departments List */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-150 dark:border-gray-700 shadow-sm space-y-4">
            <h4 className="font-bold text-sm text-gray-800 dark:text-white font-display">Specialties Registry ({departments.length})</h4>
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-60 overflow-y-auto pr-1">
              {departments.map(dept => (
                <div key={dept._id} className="py-2.5 text-xs">
                  <p className="font-bold text-gray-800 dark:text-gray-205">{dept.name}</p>
                  <p className="text-gray-400 mt-0.5">{dept.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminHospitals;
