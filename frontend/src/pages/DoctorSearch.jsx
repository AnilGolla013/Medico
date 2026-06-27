import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import axios from 'axios';
import { Search, Star, MapPin, Briefcase, Languages, DollarSign, Filter, X } from 'lucide-react';

const DoctorSearch = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialSearch = searchParams.get('search') || '';
  const initialSpecialty = searchParams.get('specialization') || '';

  const [doctors, setDoctors] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState(initialSearch);
  const [specialization, setSpecialization] = useState(initialSpecialty);
  const [hospital, setHospital] = useState('');
  const [minExperience, setMinExperience] = useState('');
  const [maxFee, setMaxFee] = useState('');
  const [minRating, setMinRating] = useState('');
  const [showFiltersMobile, setShowFiltersMobile] = useState(false);

  // Fetch doctors & configuration options
  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const params = {};
      if (specialization) params.specialization = specialization;
      if (hospital) params.hospital = hospital;
      if (minExperience) params.minExperience = minExperience;
      if (maxFee) params.maxFee = maxFee;
      if (minRating) params.minRating = minRating;
      if (search) params.search = search;

      const res = await axios.get('/api/public/doctors', { params });
      setDoctors(res.data.data);
    } catch (err) {
      console.error('Error loading doctors list:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const loadConfig = async () => {
      try {
        const depts = await axios.get('/api/public/departments');
        const hosps = await axios.get('/api/public/hospitals');
        setDepartments(depts.data.data);
        setHospitals(hosps.data.data);
      } catch (err) {
        console.error('Error fetching search filters options:', err);
      }
    };
    loadConfig();
  }, []);

  useEffect(() => {
    fetchDoctors();
  }, [specialization, hospital, minExperience, maxFee, minRating, search]);

  const clearFilters = () => {
    setSearch('');
    setSpecialization('');
    setHospital('');
    setMinExperience('');
    setMaxFee('');
    setMinRating('');
    setSearchParams({});
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 transition-colors duration-200">
      
      {/* Search Header */}
      <div className="mb-8 space-y-4">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white font-display">
          Find Your Healthcare Specialist
        </h1>
        <p className="text-gray-500 dark:text-gray-400">
          Search and book consultations with vetted doctors
        </p>

        {/* Text Search Input */}
        <div className="flex gap-2 max-w-lg bg-white dark:bg-gray-800 p-1.5 rounded-xl shadow border border-gray-200 dark:border-gray-700">
          <div className="flex-grow flex items-center px-3 py-2 space-x-2">
            <Search className="h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by doctor name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-150 text-sm placeholder-gray-400"
            />
          </div>
          {search && (
            <button
              onClick={() => setSearch('')}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 pr-2"
            >
              <X className="h-5 w-5" />
            </button>
          )}
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        
        {/* Filter Sidebar (Desktop) */}
        <aside className="hidden lg:block w-64 shrink-0 bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-200 dark:border-gray-750 shadow-sm space-y-6 self-start">
          <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-700 pb-3">
            <h3 className="font-bold text-gray-800 dark:text-white flex items-center space-x-2">
              <Filter className="h-4 w-4 text-sky-500" />
              <span>Filters</span>
            </h3>
            <button
              onClick={clearFilters}
              className="text-xs text-rose-500 hover:text-rose-600 font-bold uppercase tracking-wider"
            >
              Clear All
            </button>
          </div>

          {/* Specialty */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Specialty</label>
            <select
              value={specialization}
              onChange={(e) => setSpecialization(e.target.value)}
              className="w-full bg-gray-55 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl p-2.5 text-sm text-gray-800 dark:text-gray-150"
            >
              <option value="">All Specialties</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>{dept.name}</option>
              ))}
            </select>
          </div>

          {/* Hospital */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hospital</label>
            <select
              value={hospital}
              onChange={(e) => setHospital(e.target.value)}
              className="w-full bg-gray-55 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl p-2.5 text-sm text-gray-800 dark:text-gray-150"
            >
              <option value="">All Clinics</option>
              {hospitals.map((hosp) => (
                <option key={hosp._id} value={hosp._id}>{hosp.name}</option>
              ))}
            </select>
          </div>

          {/* Max Consultation Fee */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Consultation Fee ($)</label>
            <input
              type="number"
              placeholder="e.g. 150"
              value={maxFee}
              onChange={(e) => setMaxFee(e.target.value)}
              className="w-full bg-gray-55 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl p-2.5 text-sm text-gray-805 dark:text-gray-150"
            />
          </div>

          {/* Minimum Experience */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Min Experience (Years)</label>
            <input
              type="number"
              placeholder="e.g. 5"
              value={minExperience}
              onChange={(e) => setMinExperience(e.target.value)}
              className="w-full bg-gray-55 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl p-2.5 text-sm text-gray-805 dark:text-gray-150"
            />
          </div>

          {/* Rating */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Minimum Rating</label>
            <select
              value={minRating}
              onChange={(e) => setMinRating(e.target.value)}
              className="w-full bg-gray-55 dark:bg-gray-750 border border-gray-250 dark:border-gray-650 rounded-xl p-2.5 text-sm text-gray-800 dark:text-gray-150"
            >
              <option value="">Any Rating</option>
              <option value="4.5">4.5+ Stars</option>
              <option value="4.0">4.0+ Stars</option>
              <option value="3.5">3.5+ Stars</option>
            </select>
          </div>
        </aside>

        {/* Mobile Filter Toggle */}
        <div className="lg:hidden flex justify-between items-center bg-white dark:bg-gray-800 p-4 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
            Found {doctors.length} doctors
          </span>
          <button
            onClick={() => setShowFiltersMobile(true)}
            className="flex items-center space-x-1.5 bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors"
          >
            <Filter className="h-4 w-4" />
            <span>Filter</span>
          </button>
        </div>

        {/* Doctor Listings Grid */}
        <main className="flex-grow space-y-4">
          {loading ? (
            // Loading Skeletons
            Array(4).fill(0).map((_, i) => (
              <div key={i} className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 h-44 rounded-2xl animate-pulse"></div>
            ))
          ) : doctors.length > 0 ? (
            doctors.map((doc) => (
              <div
                key={doc._id}
                className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 rounded-2xl shadow-sm hover:shadow-md hover:border-sky-350 dark:hover:border-gray-655 flex flex-col md:flex-row justify-between items-start md:items-center gap-6 transition-all duration-200"
              >
                <div className="flex items-start gap-4">
                  <div className="h-20 w-20 bg-sky-100 dark:bg-sky-950/45 text-sky-700 dark:text-sky-400 rounded-2xl flex items-center justify-center font-bold text-3xl uppercase shrink-0 shadow-inner border border-sky-200/20">
                    {doc.user?.name.charAt(0)}
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="font-extrabold text-lg text-gray-900 dark:text-white font-display">
                        Dr. {doc.user?.name}
                      </h2>
                      <span className="bg-sky-50 dark:bg-sky-950/30 text-sky-600 dark:text-sky-400 text-xs font-semibold px-2 py-0.5 rounded-full border border-sky-100 dark:border-sky-900/30">
                        {doc.specialization?.name}
                      </span>
                    </div>

                    <div className="flex items-center space-x-2 text-xs text-gray-500 dark:text-gray-400">
                      <MapPin className="h-3.5 w-3.5 text-gray-400 shrink-0" />
                      <span>{doc.hospital?.name} • {doc.hospital?.location}</span>
                    </div>

                    <div className="flex items-center space-x-4 text-xs text-gray-600 dark:text-gray-400 pt-1">
                      <div className="flex items-center space-x-1">
                        <Briefcase className="h-3.5 w-3.5 text-gray-400" />
                        <span>{doc.experience} Years Exp</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Languages className="h-3.5 w-3.5 text-gray-400" />
                        <span>{doc.languages.join(', ')}</span>
                      </div>
                    </div>

                    {/* Qualifications */}
                    <p className="text-xs text-gray-400 italic mt-1 font-medium">
                      {doc.qualifications.join(' • ')}
                    </p>
                  </div>
                </div>

                <div className="flex md:flex-col items-between md:items-end justify-between w-full md:w-auto border-t md:border-t-0 border-gray-100 dark:border-gray-700 pt-4 md:pt-0 gap-4 shrink-0">
                  <div className="text-left md:text-right space-y-1">
                    <div className="flex items-center gap-1 font-bold text-amber-500 md:justify-end">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{doc.rating || '5.0'}</span>
                      <span className="text-xs text-gray-400 font-normal">({doc.numReviews || 0} reviews)</span>
                    </div>
                    <div className="flex items-center gap-0.5 text-emerald-600 dark:text-emerald-450 font-extrabold text-lg md:justify-end">
                      <DollarSign className="h-4.5 w-4.5" />
                      <span>{doc.consultationFee}</span>
                      <span className="text-xs text-gray-400 font-normal ml-0.5">/ Consult</span>
                    </div>
                  </div>

                  <Link
                    to={`/doctors/${doc._id}`}
                    className="bg-sky-600 hover:bg-sky-700 text-white text-xs font-bold px-5 py-3 rounded-xl shadow hover:shadow-md transition-all duration-200 text-center"
                  >
                    View & Book Slots
                  </Link>
                </div>
              </div>
            ))
          ) : (
            <div className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 text-center py-16 px-4 rounded-2xl">
              <p className="text-gray-500 dark:text-gray-400 text-base font-semibold">No doctors found matching filters</p>
              <button
                onClick={clearFilters}
                className="mt-4 text-xs font-bold text-sky-600 hover:underline"
              >
                Clear all filters
              </button>
            </div>
          )}
        </main>
      </div>

      {/* Mobile Filter Drawer Backdrop */}
      {showFiltersMobile && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-sm lg:hidden">
          <div className="w-80 max-w-full bg-white dark:bg-gray-800 h-full p-6 flex flex-col space-y-6 animate-slide-in overflow-y-auto">
            <div className="flex justify-between items-center border-b border-gray-150 dark:border-gray-700 pb-3">
              <h3 className="font-bold text-gray-800 dark:text-white flex items-center space-x-2">
                <Filter className="h-4 w-4 text-sky-500" />
                <span>Filters</span>
              </h3>
              <button
                onClick={() => setShowFiltersMobile(false)}
                className="text-gray-400 hover:text-gray-650"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Same select inputs as desktop */}
            <div className="space-y-4 flex-grow">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Specialty</label>
                <select
                  value={specialization}
                  onChange={(e) => { setSpecialization(e.target.value); setShowFiltersMobile(false); }}
                  className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm"
                >
                  <option value="">All Specialties</option>
                  {departments.map((dept) => (
                    <option key={dept._id} value={dept._id}>{dept.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Hospital</label>
                <select
                  value={hospital}
                  onChange={(e) => { setHospital(e.target.value); setShowFiltersMobile(false); }}
                  className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm"
                >
                  <option value="">All Clinics</option>
                  {hospitals.map((hosp) => (
                    <option key={hosp._id} value={hosp._id}>{hosp.name}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Max Consultation Fee ($)</label>
                <input
                  type="number"
                  placeholder="e.g. 150"
                  value={maxFee}
                  onChange={(e) => setMaxFee(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-500 uppercase tracking-wide">Min Experience (Years)</label>
                <input
                  type="number"
                  placeholder="e.g. 5"
                  value={minExperience}
                  onChange={(e) => setMinExperience(e.target.value)}
                  className="w-full bg-gray-50 dark:bg-gray-750 border border-gray-300 dark:border-gray-600 rounded-xl p-2.5 text-sm"
                />
              </div>
            </div>

            <button
              onClick={() => { clearFilters(); setShowFiltersMobile(false); }}
              className="w-full bg-rose-50 hover:bg-rose-100 text-rose-600 font-bold py-3 rounded-xl text-center text-sm"
            >
              Clear All Filters
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

export default DoctorSearch;
