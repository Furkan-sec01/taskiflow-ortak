const express = require("express");
const router = express.Router();
const notificController = require("../controllers/notificationController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", notificController.getNotifications);
router.post("/respond-invite", notificController.respondToInvıte);

router.patch("/read-all", notificController.markAllAsRead); // <-- bunu ekle
router.patch("/:id/read", notificController.markAsRead);

router.delete("/:id", notificController.deleteNotification);

module.exports = router;