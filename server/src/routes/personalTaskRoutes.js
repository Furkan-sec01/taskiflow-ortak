const express = require("express");
const router = express.Router();
const personalTaskController = require("../controllers/personalTaskController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/", personalTaskController.getMyTasks);
router.post("/", personalTaskController.createTask);
router.patch("/:id/status", personalTaskController.updateStatus);
router.delete("/:id", personalTaskController.deleteTask);

module.exports = router;