const express = require("express");
const router = express.Router();
const { getAIChatResponse } = require("../controllers/aiController");
const authenticateToken = require("../middleware/authMiddleware");

// Kimlik doğrulaması olmadan herkes erişim sağlardı
router.use(authenticateToken);

router.post("/chat", getAIChatResponse);

module.exports = router;