import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import {
  Search,
  ChevronRight,
  Heart,
  Stethoscope,
  ShieldCheck,
  Video,
  Users,
  Star,
  MessageSquare,
  Clock,
  MapPin,
  ChevronDown
} from 'lucide-react';

const Landing = () => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [specialties, setSpecialties] = useState([]);
  const [doctors, setDoctors] = useState([]);
  const [openFaq, setOpenFaq] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const specsRes = await axios.get('/api/public/departments');
        setSpecialties(specsRes.data.data.slice(0, 6)); // Display first 6 specialties

        const docsRes = await axios.get('/api/public/doctors');
        setDoctors(docsRes.data.data.slice(0, 3)); // Display first 3 featured doctors
      } catch (err) {
        console.error('Error fetching landing data:', err);
      }
    };
    fetchData();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/doctors?search=${encodeURIComponent(searchQuery)}`);
    } else {
      navigate('/doctors');
    }
  };

  const services = [
    { title: 'Online Consultations', desc: 'Secure video calling with expert physicians in seconds.', icon: Video, color: 'text-sky-500 bg-sky-50 dark:bg-sky-950/20' },
    { title: 'In-Person Visits', desc: 'Book priority physical checkups at nearest available clinics.', icon: Stethoscope, color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20' },
    { title: 'Verified Profiles', desc: 'All clinical doctors are strictly vetted and board approved.', icon: ShieldCheck, color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20' },
    { title: 'Digital Prescriptions', desc: 'Download prescriptions as secure PDFs instantly after appointment.', icon: Heart, color: 'text-rose-500 bg-rose-50 dark:bg-rose-950/20' }
  ];

  const faqs = [
    { q: 'How do I book an appointment?', a: 'Log in or sign up as a Patient, select a doctor based on specialty or hospital, pick an available slot in their calendar, and confirm your booking. It takes under 2 minutes!' },
    { q: 'What is the difference between online and in-person consults?', a: 'Online consults take place via secure virtual meetings, and doctors write digital prescriptions upon ending. In-person consults require patients to visit the doctors hospital at the scheduled slot.' },
    { q: 'How does doctor approval work?', a: 'Every doctor who registers must upload credentials and hospital details. MedBook Administrators review these records manually and approve profiles before they appear in public searches.' },
    { q: 'Can I cancel or reschedule my booking?', a: 'Yes! Patients can cancel or reschedule appointments directly from their Patient Dashboard up to 2 hours before the start time.' }
  ];

  return (
    <div className="bg-white dark:bg-gray-900 transition-colors duration-200">
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-sky-50 via-white to-emerald-50 dark:from-sky-950/20 dark:via-gray-900 dark:to-emerald-950/10 py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          <div className="space-y-6">
            <span className="inline-flex items-center space-x-1.5 bg-sky-100 dark:bg-sky-950/50 text-sky-800 dark:text-sky-350 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider border border-sky-200/50">
              <Heart className="h-3 w-3 fill-current text-sky-600" />
              <span>Your Trusted Healthcare Partner</span>
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-gray-900 dark:text-white leading-tight font-display">
              Find and Book the <span className="text-sky-600">Best Doctors</span> Instantly
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Connect with certified clinical specialists, manage prescriptions digitally, and get real-time consultations from the comfort of your home.
            </p>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-2 max-w-lg bg-white dark:bg-gray-800 p-2 rounded-xl shadow-lg border border-gray-150 dark:border-gray-700">
              <div className="flex-grow flex items-center px-3 py-2 space-x-2">
                <Search className="h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search doctors by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent focus:outline-none text-gray-800 dark:text-gray-100 text-sm placeholder-gray-400"
                />
              </div>
              <button
                type="submit"
                className="bg-sky-600 hover:bg-sky-700 text-white font-semibold text-sm px-6 py-3 rounded-lg shadow transition-all duration-200"
              >
                Find Doctors
              </button>
            </form>
          </div>

          <div className="hidden lg:flex justify-center relative">
            {/* Visual Design Asset (mock mockup of doctor consultation page) */}
            <div className="relative w-full max-w-md h-[400px] bg-gradient-to-tr from-sky-400 to-emerald-400 rounded-3xl overflow-hidden shadow-2xl animate-pulse">
              <div className="absolute inset-0 bg-black/10 flex flex-col justify-end p-8 text-white space-y-2">
                <span className="bg-emerald-500 w-max px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider">Live Consultations</span>
                <h3 className="text-xl font-bold font-display">24/7 Digital Clinics</h3>
                <p className="text-sm text-white/90">Instantly match with physicians ready to consult.</p>
              </div>
            </div>
            {/* Float circles */}
            <div className="absolute -top-6 -left-6 bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-xl flex items-center space-x-3 border border-gray-100 dark:border-gray-700">
              <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600">
                <Users className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs text-gray-400 font-semibold">Active Care</p>
                <p className="text-sm font-bold text-gray-800 dark:text-gray-200">10k+ Patient Visits</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Specialty Grid */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-12 space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Consult Specialties</h2>
          <p className="text-gray-600 dark:text-gray-400">Select clinical departments to view available healthcare experts.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {specialties.length > 0 ? (
            specialties.map((spec) => (
              <Link
                key={spec._id}
                to={`/doctors?specialization=${spec._id}`}
                className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 p-6 rounded-2xl flex flex-col items-center justify-center text-center hover:border-sky-500 hover:shadow-lg transition-all duration-200 group"
              >
                <div className="h-12 w-12 bg-sky-50 dark:bg-sky-950/20 text-sky-600 dark:text-sky-400 rounded-xl flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                  <Stethoscope className="h-6 w-6" />
                </div>
                <h4 className="font-semibold text-sm text-gray-800 dark:text-gray-200 group-hover:text-sky-600 transition-colors">{spec.name}</h4>
              </Link>
            ))
          ) : (
            // Skeletons
            Array(6).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 h-28 rounded-2xl animate-pulse"></div>
            ))
          )}
        </div>
      </section>

      {/* Services Section */}
      <section className="bg-gray-50 dark:bg-gray-950/40 py-20 px-4 md:px-8 border-y border-gray-100 dark:border-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Our Medical Services</h2>
            <p className="text-gray-600 dark:text-gray-400">Everything you need to manage your family clinical bookings in a single dashboard.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {services.map((srv, index) => {
              const Icon = srv.icon;
              return (
                <div key={index} className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col space-y-4 hover:shadow-md transition-shadow">
                  <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${srv.color}`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <h3 className="font-bold text-lg text-gray-900 dark:text-white font-display">{srv.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">{srv.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Featured Doctors */}
      <section className="py-20 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-12 gap-4">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Featured Doctors</h2>
            <p className="text-gray-600 dark:text-gray-400">Highly recommended specialist physicians available this week.</p>
          </div>
          <Link
            to="/doctors"
            className="text-sky-600 hover:text-sky-700 font-semibold flex items-center text-sm"
          >
            <span>View All Doctors</span>
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {doctors.length > 0 ? (
            doctors.map((doc) => (
              <div key={doc._id} className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-2xl overflow-hidden shadow-sm hover:shadow-md hover:border-sky-300 dark:hover:border-gray-600 transition-all duration-200">
                <div className="p-6 flex flex-col space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="h-16 w-16 bg-sky-100 rounded-xl flex items-center justify-center font-bold text-sky-700 text-2xl uppercase">
                      {doc.user?.name.charAt(0)}
                    </div>
                    <div>
                      <h4 className="font-bold text-lg text-gray-900 dark:text-white font-display">Dr. {doc.user?.name}</h4>
                      <p className="text-xs text-sky-600 dark:text-sky-400 font-semibold">{doc.specialization?.name}</p>
                      <p className="text-xs text-gray-400 mt-0.5">{doc.hospital?.name}</p>
                    </div>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 leading-relaxed">
                    {doc.bio || 'Consulting physician offering expert diagnostics and customized treatment advice.'}
                  </p>

                  <div className="border-t border-gray-100 dark:border-gray-700 pt-4 flex justify-between items-center text-sm">
                    <div className="flex items-center space-x-1 text-amber-500 font-bold">
                      <Star className="h-4 w-4 fill-current" />
                      <span>{doc.rating || '5.0'}</span>
                      <span className="text-gray-400 dark:text-gray-500 text-xs font-normal">({doc.numReviews || 0})</span>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-450">Fee</p>
                      <p className="font-bold text-emerald-600 dark:text-emerald-500">${doc.consultationFee}</p>
                    </div>
                  </div>

                  <Link
                    to={`/doctors/${doc._id}`}
                    className="w-full text-center bg-gray-50 hover:bg-sky-50 hover:text-sky-600 text-gray-700 dark:bg-gray-750 dark:hover:bg-sky-950 dark:text-gray-200 py-2.5 rounded-lg text-xs font-semibold transition-colors block"
                  >
                    View Details & Book
                  </Link>
                </div>
              </div>
            ))
          ) : (
            Array(3).fill(0).map((_, i) => (
              <div key={i} className="bg-gray-100 dark:bg-gray-800 h-64 rounded-2xl animate-pulse"></div>
            ))
          )}
        </div>
      </section>

      {/* How it works */}
      <section className="bg-gray-50 dark:bg-gray-950/40 border-y border-gray-100 dark:border-gray-800 py-20 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16 space-y-3">
            <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">How MedBook Works</h2>
            <p className="text-gray-600 dark:text-gray-400">Get quality clinical consultations in 4 simple checkpoints.</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center">
            {[
              { step: '01', title: 'Find Doctors', desc: 'Browse specialists filtered by ratings, location, fees and availability.' },
              { step: '02', title: 'Pick a Slot', desc: 'Select a preferred day and time slot integrated directly with their calendar.' },
              { step: '03', title: 'Consultation', desc: 'Get in-person checkups or speak over secure video calling instantly.' },
              { step: '04', title: 'Prescriptions', desc: 'Download digital prescriptions as secure PDFs from your dashboard.' }
            ].map((item, index) => (
              <div key={index} className="relative flex flex-col items-center space-y-3">
                <span className="text-5xl font-black text-sky-100 dark:text-gray-850 font-display block leading-none">{item.step}</span>
                <h3 className="font-bold text-base text-gray-900 dark:text-white">{item.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 max-w-xs">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQs Accordion */}
      <section className="py-20 px-4 md:px-8 max-w-4xl mx-auto">
        <div className="text-center mb-12 space-y-3">
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white font-display">Frequently Asked Questions</h2>
          <p className="text-gray-600 dark:text-gray-400">Common questions about online appointments and digital prescription deliveries.</p>
        </div>

        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white dark:bg-gray-800 border border-gray-150 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm"
            >
              <button
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                className="w-full flex justify-between items-center p-5 text-left font-semibold text-gray-850 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
              >
                <span>{faq.q}</span>
                <ChevronDown className={`h-5 w-5 text-gray-400 transform transition-transform ${openFaq === index ? 'rotate-180' : ''}`} />
              </button>
              {openFaq === index && (
                <div className="p-5 border-t border-gray-150 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/30 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* CTA Box */}
      <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto">
        <div className="bg-gradient-to-r from-sky-600 to-emerald-600 rounded-3xl p-10 md:p-16 text-center text-white space-y-6 shadow-xl relative overflow-hidden">
          {/* Backdrop abstract designs */}
          <div className="absolute top-0 right-0 h-40 w-40 bg-white/5 rounded-full blur-2xl"></div>
          <div className="absolute bottom-0 left-0 h-40 w-40 bg-white/5 rounded-full blur-2xl"></div>

          <h2 className="text-3xl md:text-4xl font-bold font-display">Are you a Medical Specialist?</h2>
          <p className="max-w-xl mx-auto text-sky-100 text-base">
            Register with MedBook, schedule your daily clinic slots, manage digital patient records, and write virtual prescriptions.
          </p>
          <div className="pt-2 flex justify-center space-x-4">
            <Link
              to="/register?role=doctor"
              className="bg-white hover:bg-gray-100 text-sky-700 font-bold px-6 py-3 rounded-xl shadow-md transition-all duration-200"
            >
              Join as Doctor
            </Link>
            <Link
              to="/register"
              className="bg-sky-700 hover:bg-sky-850 text-white font-bold px-6 py-3 rounded-xl border border-sky-500 shadow-md transition-all duration-200"
            >
              Sign Up as Patient
            </Link>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Landing;
