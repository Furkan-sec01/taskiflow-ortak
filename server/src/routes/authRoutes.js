const express = require("express");
const rateLimit = require("express-rate-limit");
const router = express.Router();
const authController = require("../controllers/authController");

// kullanıcı 15 dakikada en fazla 10 deneme yapabilir
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: "Çok fazla deneme yaptınız. Lütfen 15 dakika sonra tekrar deneyin." },
  standardHeaders: true,
  legacyHeaders: false,
});

router.post("/register", authLimiter, authController.register);
router.post("/login", authLimiter, authController.login);

module.exports = router;