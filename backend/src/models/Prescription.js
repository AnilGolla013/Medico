const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a medicine name']
  },
  dosage: {
    type: String,
    required: [true, 'Please add dosage (e.g. 1-0-1)']
  },
  instruction: {
    type: String,
    default: 'After meals'
  },
  duration: {
    type: String,
    required: [true, 'Please add duration (e.g. 5 days)']
  }
});

const PrescriptionSchema = new mongoose.Schema({
  appointment: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Appointment',
    required: true
  },
  doctor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Doctor',
    required: true
  },
  patient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Patient',
    required: true
  },
  date: {
    type: Date,
    default: Date.now
  },
  medicines: [MedicineSchema],
  notes: {
    type: String,
    trim: true
  },
  pdfUrl: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Prescription', PrescriptionSchema);
