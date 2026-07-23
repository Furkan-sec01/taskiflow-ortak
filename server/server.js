require('dotenv').config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const app = express();

const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const userRoutes = require("./src/routes/userRoutes");
const orgRoutes = require("./src/routes/organizationRoutes");
const notificRoutes = require("./src/routes/notificationRoutes");
const columnRoutes = require("./src/routes/columnRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");
const notFound = require("./src/middleware/notFound");
const errorHandler = require("./src/middleware/errorHandler");
const sessionRoutes = require("./src/routes/sessionRoutes");
const documentRoutes = require("./src/routes/documentRoutes");

const allowedOrigins = process.env.FRONTEND_URL
  ? process.env.FRONTEND_URL.split(",").map((o) => o.trim())
  : ["http://localhost:5173", "http://localhost:3000"];

app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
}));
app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: true, limit: "1mb" }));
app.use("/uploads", express.static(require("path").join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/notifications", notificRoutes);
app.use("/api/column", columnRoutes);
app.use("/api/task", taskRoutes)
app.use("/api/tasks", taskRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/sessions", sessionRoutes);
app.use("/api/documents", documentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "TaskiFlow Backend çalışıyor! 🚀" });
});

const PORT = 5000;

app.use(notFound);
app.use(errorHandler);

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Full Mod (Auth + Task + Payment) çalışıyor: http://localhost:${PORT}`);
});