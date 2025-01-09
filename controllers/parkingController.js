const ParkingSpot = require("../models/ParkingSpot");
const MapServices = require("../configs/mapServices");
const pool = require("../configs/db");
const findParkingSpots = async (req, res) => {
  try {
    const { lat, lng, radius, sortBy = "distance" } = req.query;

    if (!lat || !lng) {
      return res.status(400).json({ message: "Location coordinates required" });
    }

    const userLocation = { lat: parseFloat(lat), lng: parseFloat(lng) };

    // Fetch nearby parking spots
    const spots = await ParkingSpot.findNearby(
      pool,
      userLocation,
      parseFloat(radius)
    );

    // Calculate routes and distances for each parking spot
    const spotsWithRoutes = await Promise.all(
      spots.map(async (spot) => {
        const destination = { lat: spot.latitude, lng: spot.longitude };

        try {
          const routeInfo = await MapServices.getRoute(
            userLocation,
            destination
          );

          return {
            ...spot,
            route: routeInfo.route,
            polyline: routeInfo.route.geometry,
            duration: routeInfo.duration, // in seconds
            distance: routeInfo.distance, // in meters
          };
        } catch (err) {
          console.error(
            `Error getting route for spot ${spot.id}:`,
            err.message
          );
          return {
            ...spot,
            route: null,
            polyline: null,
            duration: Infinity,
            distance: Infinity,
          };
        }
      })
    );

    const sortedSpots = spotsWithRoutes.sort((a, b) => {
      switch (sortBy) {
        case "cost":
          return a.cost_per_hour - b.cost_per_hour;
        case "time":
          return a.duration - b.duration; // Sorting by duration in seconds
        default:
          return a.distance - b.distance; // Sorting by distance in meters
      }
    });

    return res.json({
      message: "Parking spots found successfully",
      data: sortedSpots,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error finding parking spots",
      error: error.message,
    });
  }
};

module.exports = { findParkingSpots };
