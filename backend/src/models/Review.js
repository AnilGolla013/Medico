const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
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
  rating: {
    type: Number,
    required: [true, 'Please add a rating between 1 and 5'],
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: [true, 'Please add a comment'],
    trim: true,
    maxlength: 500
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Ensure a patient can only review a doctor once
ReviewSchema.index({ doctor: 1, patient: 1 }, { unique: true });

// Static method to get avg rating and update doctor
ReviewSchema.statics.getAverageRating = async function(doctorId) {
  const obj = await this.aggregate([
    { $match: { doctor: doctorId } },
    {
      $group: {
        _id: '$doctor',
        averageRating: { $avg: '$rating' },
        numReviews: { $sum: 1 }
      }
    }
  ]);

  try {
    if (obj.length > 0) {
      await mongoose.model('Doctor').findByIdAndUpdate(doctorId, {
        rating: Math.round(obj[0].averageRating * 10) / 10,
        numReviews: obj[0].numReviews
      });
    } else {
      await mongoose.model('Doctor').findByIdAndUpdate(doctorId, {
        rating: 0,
        numReviews: 0
      });
    }
  } catch (err) {
    console.error('Error updating doctor average rating:', err);
  }
};

// Call getAverageRating after save
ReviewSchema.post('save', async function() {
  await this.constructor.getAverageRating(this.doctor);
});

// Call getAverageRating before delete
ReviewSchema.post('deleteOne', { document: true, query: false }, async function() {
  await this.constructor.getAverageRating(this.doctor);
});

module.exports = mongoose.model('Review', ReviewSchema);
