const express = require("express");
const router = express.Router();
const { register, login } = require("../controllers/authController");
const { verifyToken } = require("../middleware/authMiddleware");

router.post("/register", register);
router.post("/login", login);

router.get("/protected", verifyToken, (req, res) => {
  res.json({
    message: "You have access to this protected route",
    user: req.user,
  });
});

module.exports = router;
