const express = require("express");
const router = express.Router();
const orgController = require("../controllers/organizationController")
const authenticateToken = require("../middleware/authMiddleware");


router.use(authenticateToken);

//yeni route lar gelicek
router.get("/:orgId/members", orgController.getMembers);
router.post("/create",orgController.createOrg);
router.post("/invite",orgController.inviteMember);
router.post("/:orgId/delete-member", orgController.deleteMember);
router.post("/:orgId/leave", orgController.leaveOrganization);
router.get("/", orgController.getUserOrganizations);
router.delete("/:orgId",orgController.deleteOrg);
module.exports = router;