const User = require("../models/userModel");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { email, password, role = "role" } = req.body;
    const existingUser = await User.findByEmail(email);
    if (existingUser)
      return res.status(400).json({ message: "This email is already Used" });
    const user = await User.create(email, password, role);
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );
    return res.status(200).json({
      message: "User registered Successfully",
      token,
      user: {
        id: user.id,
        email: user.id,
        role: user.role,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findByEmail(email);
    if (!user) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const isValidPassword = await User.validatePassword(
      password,
      user.password
    );
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid Credentials" });
    }
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Error logging in", error: error.message });
  }
};

module.exports = { register, login };
