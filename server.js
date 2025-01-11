require("dotenv").config();
const express = require("express");
const cors = require("cors");
const pool = require("./configs/db");

const app = express();

pool.connect((err, client, release) => {
  if (err) {
    return console.error("Error acquiring client", err.stack);
  }
  console.log("Connected to Database");
  release();
});

app.use(
  cors({
    origin: "*",
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: "error",
    message:
      process.env.NODE_ENV === "development"
        ? err.message
        : "Internal server error",
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

app.use("/api/auth", require("./routes/authRoutes"));

app.use("/api/parking", require("./routes/parkingRoutes"));

app.use("/api/bookings", require("./routes/bookingRoutes"));

app.use((req, res) => {
  res.status(404).json({
    status: "error",
    message: "Route not found",
  });
});

module.exports = pool;
