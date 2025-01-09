const pool = require("../configs/db");
class ParkingSpot {
  static async findNearby(pool, userLocation, radius = 5000) {
    const query = `
          SELECT *,
          ST_Distance(
              ST_MakePoint($1, $2)::geography,
              ST_MakePoint(longitude, latitude)::geography
          ) as distance
          FROM parking_spots
          WHERE ST_DWithin(
              ST_MakePoint($1, $2)::geography,
              ST_MakePoint(longitude, latitude)::geography,
              $3
          )
          AND available_spaces > 0
          AND is_active = true
          ORDER BY distance
          LIMIT 10;
      `;

    try {
      const { rows } = await pool.query(query, [
        userLocation.lng,
        userLocation.lat,
        radius,
      ]);
      return rows;
    } catch (error) {
      throw error;
    }
  }

  static async updateAvailability(pool, spotId, spaces) {
    const query = `
          UPDATE parking_spots
          SET available_spaces = $2,
              updated_at = CURRENT_TIMESTAMP
          WHERE id = $1
          RETURNING *;
      `;

    try {
      const { rows } = await pool.query(query, [spotId, spaces]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = ParkingSpot;
