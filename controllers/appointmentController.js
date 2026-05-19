const Appointment = require('../models/Appointment');
const { parseISO, isBefore, subHours } = require('date-fns');

// Generate available slots for a specific date
const getSlots = async (req, res) => {
  const { date } = req.query; // format YYYY-MM-DD
  if (!date) return res.status(400).json({ message: 'Date is required' });

  // Let's define some standard slots: 9 AM to 5 PM, 1 hour each
  const allSlots = [
    { startTime: '09:00', endTime: '10:00' },
    { startTime: '10:00', endTime: '11:00' },
    { startTime: '11:00', endTime: '12:00' },
    { startTime: '13:00', endTime: '14:00' },
    { startTime: '14:00', endTime: '15:00' },
    { startTime: '15:00', endTime: '16:00' },
    { startTime: '16:00', endTime: '17:00' }
  ];

  try {
    // Find booked slots for the date
    const bookedAppointments = await Appointment.find({ date, status: 'booked' });
    const bookedStartTimes = bookedAppointments.map(app => app.startTime);
    const currentDateTime = new Date();

    // Map slots and attach status
    const slots = allSlots.map(slot => {
      let status = 'AVAILABLE';
      let isAvailable = true;

      const slotDateTime = new Date(`${date}T${slot.startTime}:00`);

      if (isBefore(slotDateTime, currentDateTime)) {
        status = 'PAST';
        isAvailable = false;
      } else if (bookedStartTimes.includes(slot.startTime)) {
        status = 'BOOKED';
        isAvailable = false;
      }

      return {
        ...slot,
        isAvailable,
        status
      };
    });

    res.json(slots);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Book an appointment
const bookAppointment = async (req, res) => {
  try {
    const { date, startTime, endTime, userId, sessionType, serviceType, message } = req.body;

    if (!date || !startTime || !endTime) {
      return res.status(400).json({ message: 'Please provide date, start time, and end time' });
    }



    if (!req.user) {
      return res.status(401).json({ message: 'User not authenticated' });
    }

    const targetUserId = (req.user.role === 'admin' || req.user.role === 'super_admin') && userId ? userId : req.user._id;

    // Check if there is an existing cancelled appointment for this date and slot to avoid duplicates on the calendar
    let appointment = await Appointment.findOne({ date, startTime, status: 'cancelled' });

    if (appointment) {
      appointment.user = targetUserId;
      appointment.endTime = endTime;
      appointment.sessionType = sessionType || 'Doubt Resolution';
      appointment.serviceType = serviceType || '1-on-1 Academic Mentorship';
      appointment.message = message || '';
      appointment.status = 'booked';
      await appointment.save();
    } else {
      // Creating the appointment - DB unique index handles race conditions for same slot
      appointment = await Appointment.create({
        user: targetUserId,
        date,
        startTime,
        endTime,
        sessionType: sessionType || 'Doubt Resolution',
        serviceType: serviceType || '1-on-1 Academic Mentorship',
        message: message || '',
        status: 'booked'
      });
    }

    res.status(201).json(appointment);
  } catch (error) {
    console.error('Error in bookAppointment:', error);
    // MongoDB duplicate key error code is 11000
    if (error.code === 11000) {
      return res.status(400).json({ message: 'This slot is already booked' });
    }
    res.status(500).json({ message: error.message });
  }
};

// Get user's appointments (all for admins/super_admins, only own for regular users)
const getMyAppointments = async (req, res) => {
  try {
    let appointments;
    if (req.user.role === 'admin' || req.user.role === 'super_admin') {
      appointments = await Appointment.find({}).populate('user', 'name email').sort({ date: 1, startTime: 1 });
    } else {
      appointments = await Appointment.find({ user: req.user._id }).populate('user', 'name email').sort({ date: 1, startTime: 1 });
    }
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Cancel appointment
const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    // Check if user owns the appointment OR is admin/super_admin
    if (
      appointment.user.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin' &&
      req.user.role !== 'super_admin'
    ) {
      return res.status(401).json({ message: 'Not authorized' });
    }

    // Constraint: Regular students cannot cancel within 2 hours of start time
    if (req.user.role !== 'admin' && req.user.role !== 'super_admin') {
      const appointmentDateTime = new Date(`${appointment.date}T${appointment.startTime}:00`);
      const limitTime = subHours(appointmentDateTime, 2);
      const currentDateTime = new Date();

      if (isBefore(limitTime, currentDateTime)) {
        return res.status(400).json({ message: 'You can only cancel an appointment at least 2 hours before the start time' });
      }
    }

    appointment.status = 'cancelled';
    await appointment.save();

    res.json({ message: 'Appointment cancelled successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = { getSlots, bookAppointment, getMyAppointments, cancelAppointment };
