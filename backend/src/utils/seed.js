const mongoose = require('mongoose');
const dotenv = require('dotenv');
const bcrypt = require('bcryptjs');

// Load environment models
const User = require('../models/User');
const Patient = require('../models/Patient');
const Doctor = require('../models/Doctor');
const Hospital = require('../models/Hospital');
const Department = require('../models/Department');
const Appointment = require('../models/Appointment');
const Review = require('../models/Review');
const Prescription = require('../models/Prescription');

dotenv.config();

const seedData = async () => {
  try {
    // 1. Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/medbook');
    console.log('MongoDB connected for seeding...');

    // 2. Clear Existing Collections
    await User.deleteMany();
    await Patient.deleteMany();
    await Doctor.deleteMany();
    await Hospital.deleteMany();
    await Department.deleteMany();
    await Appointment.deleteMany();
    await Review.deleteMany();
    await Prescription.deleteMany();
    console.log('Existing data cleared.');

    // 3. Create Departments
    const depts = await Department.insertMany([
      { name: 'Cardiology', description: 'Care and treatment of heart diseases and disorders.', icon: 'Heart' },
      { name: 'Pediatrics', description: 'Comprehensive medical care for infants, children, and adolescents.', icon: 'Baby' },
      { name: 'Dermatology', description: 'Diagnosis and treatment of skin, hair, and nail conditions.', icon: 'Sparkles' },
      { name: 'Neurology', description: 'Brain, spinal cord, and nervous system disorders.', icon: 'Brain' },
      { name: 'General Medicine', description: 'Primary healthcare, diagnosis, and non-surgical treatment.', icon: 'Stethoscope' },
      { name: 'Orthopedics', description: 'Musculoskeletal system including bones, joints, ligaments, and tendons.', icon: 'Activity' }
    ]);
    console.log('Departments seeded.');

    // 4. Create Hospitals
    const hosps = await Hospital.insertMany([
      { name: 'City Care General Hospital', location: 'New York City, NY', description: 'Multispecialty hospital offering tertiary care.', image: '' },
      { name: 'St. Jude Medical Clinic', location: 'Boston, MA', description: 'Community medical clinic offering family healthcare.', image: '' },
      { name: 'Metro Health Specialty Center', location: 'Chicago, IL', description: 'Premier specialty center and research laboratory.', image: '' }
    ]);
    console.log('Hospitals seeded.');

    // 5. Create Admin Account
    const adminUser = await User.create({
      name: 'MedBook Administrator',
      email: 'admin@medbook.com',
      password: 'password123',
      role: 'admin',
      isVerified: true
    });
    console.log('Admin user seeded (admin@medbook.com / password123).');

    // 6. Create Patient Account
    const patientUser = await User.create({
      name: 'John Doe',
      email: 'patient@medbook.com',
      password: 'password123',
      role: 'patient',
      isVerified: true
    });
    const patientProfile = await Patient.create({
      user: patientUser._id,
      gender: 'Male',
      dateOfBirth: new Date('1992-05-15'),
      phone: '+1 (555) 123-4567',
      address: '742 Evergreen Terrace, New York',
      bloodGroup: 'O+',
      medicalHistory: ['Mild Hypertension', 'Dust Allergies']
    });
    console.log('Patient seeded (patient@medbook.com / password123).');

    // 7. Create Doctor 1 (Approved Cardiology)
    const docUser1 = await User.create({
      name: 'Elizabeth Smith',
      email: 'doctor@medbook.com',
      password: 'password123',
      role: 'doctor',
      isVerified: true
    });
    const docProfile1 = await Doctor.create({
      user: docUser1._id,
      specialization: depts[0]._id, // Cardiology
      hospital: hosps[0]._id, // City Care
      experience: 12,
      consultationFee: 150,
      qualifications: ['MD - Internal Medicine', 'FACC Cardiology'],
      languages: ['English', 'Spanish'],
      bio: 'Dr. Elizabeth is a senior cardiologist with over 12 years of experience in diagnosing and treating cardiovascular conditions.',
      status: 'Approved',
      availability: [
        { day: 'Monday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Wednesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '04:00 PM'] },
        { day: 'Friday', slots: ['10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] }
      ]
    });
    console.log('Doctor Elizabeth Smith seeded (doctor@medbook.com / password123).');

    // 8. Create Doctor 2 (Approved Pediatrics)
    const docUser2 = await User.create({
      name: 'Robert Miller',
      email: 'doctor2@medbook.com',
      password: 'password123',
      role: 'doctor',
      isVerified: true
    });
    const docProfile2 = await Doctor.create({
      user: docUser2._id,
      specialization: depts[1]._id, // Pediatrics
      hospital: hosps[1]._id, // St. Jude
      experience: 8,
      consultationFee: 100,
      qualifications: ['MD - Pediatrics', 'IBCLC Lactation Specialist'],
      languages: ['English', 'French'],
      bio: 'Dr. Robert is a pediatrician who specializes in pediatric developmental health and preventive medicine.',
      status: 'Approved',
      availability: [
        { day: 'Tuesday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '02:00 PM', '03:00 PM'] },
        { day: 'Thursday', slots: ['09:00 AM', '10:00 AM', '11:00 AM', '04:00 PM'] }
      ]
    });
    console.log('Doctor Robert Miller seeded (doctor2@medbook.com / password123).');

    // 9. Create Doctor 3 (Pending Approval)
    const docUser3 = await User.create({
      name: 'Sarah Connor',
      email: 'doctor3@medbook.com',
      password: 'password123',
      role: 'doctor',
      isVerified: true
    });
    await Doctor.create({
      user: docUser3._id,
      specialization: depts[2]._id, // Dermatology
      hospital: hosps[2]._id, // Metro Health
      experience: 5,
      consultationFee: 120,
      qualifications: ['MD - Dermatology', 'Board Certified Dermatologist'],
      languages: ['English'],
      bio: 'Dr. Sarah specializes in aesthetic dermatology and laser skin treatments.',
      status: 'Pending',
      availability: [
        { day: 'Saturday', slots: ['10:00 AM', '11:00 AM', '12:00 PM'] }
      ]
    });
    console.log('Pending Doctor Sarah Connor seeded (doctor3@medbook.com / password123).');

    // 10. Seed Mock Appointments
    const datePast = new Date();
    datePast.setDate(datePast.getDate() - 5);
    datePast.setHours(0,0,0,0);

    const dateToday = new Date();
    dateToday.setHours(0,0,0,0);

    const dateFuture = new Date();
    dateFuture.setDate(dateFuture.getDate() + 3);
    dateFuture.setHours(0,0,0,0);

    // Completed Appointment (Past)
    const completedAppt = await Appointment.create({
      patient: patientProfile._id,
      doctor: docProfile1._id,
      hospital: docProfile1.hospital,
      date: datePast,
      slot: '10:00 AM',
      type: 'Online',
      status: 'Completed',
      paymentStatus: 'Paid',
      fees: docProfile1.consultationFee,
      symptoms: 'Chest congestion and shortness of breath.'
    });

    // Write prescription for past completed appointment
    const prescription = await Prescription.create({
      appointment: completedAppt._id,
      doctor: docProfile1._id,
      patient: patientProfile._id,
      date: datePast,
      medicines: [
        { name: 'Amlodipine 5mg', dosage: '1-0-0', instruction: 'Take in morning before food', duration: '30 days' },
        { name: 'Atorvastatin 10mg', dosage: '0-0-1', instruction: 'Take at night after food', duration: '30 days' }
      ],
      notes: 'Please reduce salt intake and walk for 30 minutes daily. Monitor blood pressure weekly.'
    });

    completedAppt.prescription = prescription._id;
    await completedAppt.save();

    // Seed Doctor Review
    await Review.create({
      doctor: docProfile1._id,
      patient: patientProfile._id,
      rating: 5,
      comment: 'Excellent consulting experience. Dr. Elizabeth explained the symptoms very carefully.'
    });

    // Today's Appointment (Active)
    await Appointment.create({
      patient: patientProfile._id,
      doctor: docProfile1._id,
      hospital: docProfile1.hospital,
      date: dateToday,
      slot: '02:00 PM',
      type: 'In-Person',
      status: 'Accepted',
      paymentStatus: 'Pending',
      fees: docProfile1.consultationFee,
      symptoms: 'Follow-up on heart rate reading.'
    });

    // Future Appointment (Pending)
    await Appointment.create({
      patient: patientProfile._id,
      doctor: docProfile2._id,
      hospital: docProfile2.hospital,
      date: dateFuture,
      slot: '11:00 AM',
      type: 'In-Person',
      status: 'Pending',
      paymentStatus: 'Pending',
      fees: docProfile2.consultationFee,
      symptoms: 'General pediatric checkout.'
    });

    console.log('Mock Appointments, Prescriptions, and Reviews seeded.');
    console.log('Seeding completed successfully!');
    process.exit();
  } catch (err) {
    console.error('Error seeding data:', err);
    process.exit(1);
  }
};

seedData();
