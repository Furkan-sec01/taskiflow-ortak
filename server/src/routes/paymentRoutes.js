const express = require("express");
const {
  getBillingOverview,
  updateBillingProfile,
  changeSubscriptionPlan,
  getPaymentHistory,
  initialize3DSPayment,
  complete3DSPayment,
  cancelSubscription,
} = require("../controllers/paymentController.js");

const authenticateToken = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/complete-3ds", complete3DSPayment);

router.use(authenticateToken);

router.get("/overview", getBillingOverview);
router.get("/history", getPaymentHistory);
router.put("/billing-profile", updateBillingProfile);
router.post("/change-plan", changeSubscriptionPlan);
router.post("/initialize-3ds", initialize3DSPayment);

// 🔥 DÜZELTİLDİ
router.post("/cancel-subscription", cancelSubscription);

module.exports = router;