const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const authenticateToken = require("../middleware/authMiddleware");
const { uploadAvatar } = require("../middleware/upload");

router.use(authenticateToken);


router.get("/me", userController.getMe);
router.put("/profile", userController.updateProfile);
router.post("/avatar", uploadAvatar.single("avatar"), userController.uploadAvatar);
router.put("/change-password", userController.changePassword);
// Geri alınamaz. Gövdede mevcut şifre beklenir (bkz. deleteAccount).
router.delete("/me", userController.deleteAccount);

module.exports = router;