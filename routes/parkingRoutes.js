const express = require("express");
const router = express.Router();
const { findParkingSpots } = require("../controllers/parkingController");
const { verifyToken } = require("../middleware/authMiddleware");

router.get("/spots", verifyToken, findParkingSpots);

module.exports = router;
