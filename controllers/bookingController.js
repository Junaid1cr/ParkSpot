const Booking = require("../models/Booking");
const ParkingSpot = require("../models/ParkingSpot");
const pool = require("../configs/db");

const createBooking = async (req, res) => {
  try {
    const { spotId, estimatedHours } = req.body;
    const userId = req.user.id;

    const booking = await Booking.create(pool, {
      userId,
      spotId,
      startTime: new Date(),
      estimatedHours,
    });

    res.json({
      message: "Booking created successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error creating booking",
      error: error.message,
    });
  }
};

const completeBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const booking = await Booking.complete(pool, bookingId);

    res.json({
      message: "Booking completed successfully",
      data: booking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error completing booking",
      error: error.message,
    });
  }
};

const getCurrentBooking = async (req, res) => {
  try {
    const userId = req.user.id;
    const activeBooking = await Booking.getUserActiveBooking(pool, userId);

    if (!activeBooking) {
      return res.status(200).json(null);
    }

    res.json({
      message: "Active booking fetched successfully",
      data: activeBooking,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error fetching current booking",
      error: error.message,
    });
  }
};

module.exports = {
  createBooking,
  completeBooking,
  getCurrentBooking,
};
