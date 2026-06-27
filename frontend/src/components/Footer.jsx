import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Mail, Phone, MapPin, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 transition-colors duration-200">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          
          {/* Brand Info */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 text-white">
              <div className="bg-sky-600 p-2 rounded-lg text-white">
                <Heart className="h-5 w-5 fill-current" />
              </div>
              <span className="text-xl font-bold font-display">
                Med<span className="text-emerald-500">Book</span>
              </span>
            </div>
            <p className="text-sm text-gray-400">
              Simplifying healthcare access. Book online consultations or in-person visits with leading qualified specialists.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="hover:text-sky-500 transition-colors" aria-label="Twitter">
                <Twitter className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-sky-500 transition-colors" aria-label="LinkedIn">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="#" className="hover:text-sky-500 transition-colors" aria-label="Github">
                <Github className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Quick links */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="hover:text-white transition-colors">Home</Link>
              </li>
              <li>
                <Link to="/doctors" className="hover:text-white transition-colors">Find Doctors</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition-colors">Log In</Link>
              </li>
              <li>
                <Link to="/register" className="hover:text-white transition-colors">Sign Up</Link>
              </li>
            </ul>
          </div>

          {/* Specialities */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Specialties</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>Cardiology</li>
              <li>Pediatrics</li>
              <li>Dermatology</li>
              <li>Neurology</li>
              <li>General Medicine</li>
            </ul>
          </div>

          {/* Contacts */}
          <div>
            <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-gray-400">
              <li className="flex items-center space-x-2">
                <Phone className="h-4 w-4 text-sky-500 shrink-0" />
                <span>+1 (555) 123-4567</span>
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-sky-500 shrink-0" />
                <span>support@medbook.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-sky-500 shrink-0" />
                <span>742 Evergreen Terrace, NYC</span>
              </li>
            </ul>
          </div>

        </div>

        <hr className="border-gray-800 my-8" />

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} MedBook Healthcare Network. All rights reserved.</p>
          <div className="flex space-x-6 mt-4 sm:mt-0">
            <a href="#" className="hover:text-gray-300">Privacy Policy</a>
            <a href="#" className="hover:text-gray-300">Terms of Service</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
