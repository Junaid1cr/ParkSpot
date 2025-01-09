class Booking {
  static async create(pool, { userId, spotId, startTime, estimatedHours }) {
    const query = `
    WITH spot_check AS (
        SELECT id, available_spaces, cost_per_hour
        FROM parking_spots
        WHERE id = $1 AND available_spaces > 0
        FOR UPDATE
    )
    INSERT INTO bookings (
        user_id, parking_spot_id, start_time, 
        estimated_end_time, estimated_cost, status
    )
    SELECT 
        $2, $1, $3::timestamp, 
        $3::timestamp + interval '1 hour' * $4,
        (SELECT cost_per_hour FROM spot_check) * $4,
        'active'
    FROM spot_check
    RETURNING id, estimated_cost;
`;

    // Rest of the method remains the same
    const updateSpotQuery = `
          UPDATE parking_spots
          SET available_spaces = available_spaces - 1
          WHERE id = $1;
      `;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(query, [
        spotId,
        userId,
        startTime,
        estimatedHours,
      ]);

      if (rows.length === 0) {
        throw new Error("Parking spot not available");
      }

      await client.query(updateSpotQuery, [spotId]);
      await client.query("COMMIT");

      return rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
  static async complete(pool, bookingId) {
    const query = `
          UPDATE bookings
          SET 
              status = 'completed',
              end_time = CURRENT_TIMESTAMP,
              final_cost = 
                  (SELECT cost_per_hour FROM parking_spots ps 
                   JOIN bookings b ON b.parking_spot_id = ps.id 
                   WHERE b.id = $1) * 
                  EXTRACT(EPOCH FROM (CURRENT_TIMESTAMP - start_time))/3600
          WHERE id = $1
          RETURNING *;
      `;

    const updateSpotQuery = `
          UPDATE parking_spots
          SET available_spaces = available_spaces + 1
          WHERE id = (SELECT parking_spot_id FROM bookings WHERE id = $1);
      `;

    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      const { rows } = await client.query(query, [bookingId]);
      await client.query(updateSpotQuery, [bookingId]);
      await client.query("COMMIT");
      return rows[0];
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }

  static async getUserActiveBooking(pool, userId) {
    const query = `
          SELECT b.*, ps.name as spot_name, ps.latitude, ps.longitude
          FROM bookings b
          JOIN parking_spots ps ON b.parking_spot_id = ps.id
          WHERE b.user_id = $1 AND b.status = 'active'
          ORDER BY b.start_time DESC
          LIMIT 1;
      `;

    try {
      const { rows } = await pool.query(query, [userId]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
}

module.exports = Booking;
