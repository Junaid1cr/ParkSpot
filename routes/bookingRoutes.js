const express = require("express");
const router = express.Router();
const { verifyToken } = require("../middleware/authMiddleware");
const {
  createBooking,
  completeBooking,
  getCurrentBooking,
} = require("../controllers/bookingController");

router.post("/create", verifyToken, createBooking);
router.post("/:bookingId/complete", verifyToken, completeBooking);
router.get("/current", verifyToken, getCurrentBooking);

module.exports = router;
