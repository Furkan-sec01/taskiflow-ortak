const rateLimit = require("express-rate-limit");

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Çok fazla ödeme denemesi yaptınız. Lütfen birkaç dakika sonra tekrar deneyin." },
});

module.exports = paymentLimiter;