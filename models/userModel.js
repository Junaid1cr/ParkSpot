const pool = require("../configs/db");
const bcrypt = require("bcryptjs");

class User {
  static async create(email, password, role) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const query = `
    INSERT INTO users(email,password,role)
    VALUES ($1,$2,$3)
    RETURNING id,email,role
    `;
    try {
      const { rows } = await pool.query(query, [email, hashedPassword, role]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
  static async findByEmail(email) {
    const query = `SELECT * FROM users WHERE email=$1`;
    try {
      const { rows } = await pool.query(query, [email]);
      return rows[0];
    } catch (error) {
      throw error;
    }
  }
  static async validatePassword(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
  }
}

module.exports = User;
