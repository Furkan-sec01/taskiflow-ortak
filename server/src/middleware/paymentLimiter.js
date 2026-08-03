const rateLimit = require("express-rate-limit");

const paymentLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req) => req.user?.id || req.user?.userId || req.ip,
  message: { message: "Çok fazla ödeme denemesi yaptınız. Lütfen birkaç dakika sonra tekrar deneyin." },
});

module.exports = paymentLimiter;