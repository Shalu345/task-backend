const mongoose = require('mongoose');

const appointmentSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    date: {
      type: String, // Storing as YYYY-MM-DD
      required: true,
    },
    startTime: {
      type: String, // format "HH:mm"
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['booked', 'cancelled'],
      default: 'booked',
    },
    sessionType: {
      type: String,
      default: 'Doubt Resolution'
    },
    serviceType: {
      type: String,
      default: '1-on-1 Academic Mentorship'
    },
    message: {
      type: String,
      default: ''
    },
  },
  {
    timestamps: true,
  }
);

// Prevent overlapping or duplicate slot bookings by uniqueness index
// Adding a unique index on date and startTime where status is booked.
appointmentSchema.index({ date: 1, startTime: 1 }, { unique: true, partialFilterExpression: { status: 'booked' } });

const Appointment = mongoose.model('Appointment', appointmentSchema);
module.exports = Appointment;
