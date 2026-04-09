const express = require("express");
const { signup, login } = require("../controllers/authController");
const authMiddleware = require("../middleware/auth");

const router = express.Router();

router.post("/signup", signup);
router.post("/login", login);
router.get("/me", authMiddleware, (req, res) => {
  res.json(req.user);
});

module.exports = router;
