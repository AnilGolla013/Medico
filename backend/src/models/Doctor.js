const mongoose = require('mongoose');

const AvailabilitySchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'],
    required: true
  },
  slots: {
    type: [String], // Array of slot strings, e.g. ["09:00", "09:30", "10:00", "14:00"]
    default: []
  }
});

const DoctorSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  specialization: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Department',
    required: true
  },
  hospital: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Hospital',
    required: true
  },
  experience: {
    type: Number,
    required: [true, 'Please add experience in years'],
    min: 0
  },
  consultationFee: {
    type: Number,
    required: [true, 'Please add consultation fee'],
    min: 0
  },
  qualifications: {
    type: [String],
    required: [true, 'Please add at least one qualification']
  },
  languages: {
    type: [String],
    default: ['English']
  },
  bio: {
    type: String,
    maxlength: 1000
  },
  profilePic: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected'],
    default: 'Pending'
  },
  availability: [AvailabilitySchema],
  rating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  numReviews: {
    type: Number,
    default: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Doctor', DoctorSchema);
