const express = require("express");
const router = express.Router();
const documentController = require("../controllers/documentController");
const authenticateToken = require("../middleware/authMiddleware");
const { uploadDocument } = require("../middleware/documentUpload");

router.use(authenticateToken);

router.get("/:orgId", documentController.getDocuments);
router.post("/:orgId", uploadDocument.single("file"), documentController.uploadDocument);
router.patch("/:docId/star", documentController.toggleStar);
router.patch("/:docId/rename", documentController.renameDocument);
router.delete("/:docId", documentController.deleteDocument);

module.exports = router;