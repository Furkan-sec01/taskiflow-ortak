const express = require("express");
const router = express.Router();
const sprintController = require("../controllers/sprintController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/project/:projectId", sprintController.getSprints);
router.post("/project/:projectId", sprintController.createSprint);
router.patch("/:sprintId", sprintController.updateSprint);
router.patch("/:sprintId/start", sprintController.startSprint);
router.patch("/:sprintId/complete", sprintController.completeSprint);
router.delete("/:sprintId", sprintController.deleteSprint);

module.exports = router;