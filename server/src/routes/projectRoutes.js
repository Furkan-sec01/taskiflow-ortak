
const express = require("express");
const router = express.Router();
const projectController = require("../controllers/projectController");
const authenticateToken = require("../middleware/authMiddleware");

router.use(authenticateToken);

router.get("/:projectId/board", projectController.getProjectBoard);
router.get("/", projectController.getProjects); 
router.get("/org/:orgId", projectController.getProjectByOrg);
router.post("/", projectController.createProject); 
router.delete("/:projectId", projectController.deleteProject);
router.put("/task/:taskId/move", projectController.updateTaskPosition);
router.post("/:projectId/invite", projectController.inviteMember);
router.get("/my-projects", projectController.getProjectByUser);

module.exports = router;