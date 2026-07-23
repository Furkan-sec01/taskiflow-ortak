const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/sessionController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", sessionController.getSessions);
router.delete("/others", sessionController.deleteOtherSessions);
router.delete("/:sessionId", sessionController.deleteSession);

module.exports = router;