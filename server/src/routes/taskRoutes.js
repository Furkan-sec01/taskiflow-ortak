const express = require("express");
const router = express.Router();
const taskController = require("../controllers/taskController");
const authenticateToken = require("../middleware/authMiddleware");
const { uploadDocument } = require("../middleware/documentUpload");

router.use(authenticateToken);
router.post("/create/:projectId/:columnId", taskController.createTask);
router.delete("/delete/:taskId", taskController.deleteTask);
router.patch("/:taskId/timer", taskController.toggleTimer);
router.patch("/:taskId/complete", taskController.completeTask);
router.patch("/:taskId/sprint", taskController.assignSprint);
router.patch("/:taskId/points", taskController.updateStoryPoints);

// Görev yorumları
router.get("/:taskId/comments", taskController.getComments);
router.post("/:taskId/comments", taskController.addComment);
router.delete("/:taskId/comments/:commentId", taskController.deleteComment);

// Görev ekleri (belge yükleme altyapısı yeniden kullanılıyor)
router.post("/:taskId/attachments", uploadDocument.single("file"), taskController.addAttachment);
router.delete("/:taskId/attachments/:attachmentId", taskController.deleteAttachment);

module.exports = router;