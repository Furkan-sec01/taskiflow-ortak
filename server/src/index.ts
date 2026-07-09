import express from "express";
import cors from "cors";
import dotenv from "dotenv";

const authRoutes = require("./routes/authRoutes");
const paymentRoutes = require("./routes/paymentRoutes");

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 🔐 API Rotaları
app.use("/api/auth", authRoutes);
app.use("/api/payments", paymentRoutes);

// ✅ Test Rotası
app.get("/", async (req, res) => {
  res.json({ message: "TaskiFlow Backend çalışıyor! 🚀" });
});

app.listen(PORT, () => {
  console.log(`Sunucu http://localhost:${PORT} adresinde çalışıyor`);
});