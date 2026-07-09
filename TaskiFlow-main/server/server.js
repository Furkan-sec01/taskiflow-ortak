require('dotenv').config();
const express = require("express");
const cors = require("cors");
const app = express();

const authRoutes = require("./src/routes/authRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const userRoutes = require("./src/routes/userRoutes");
const orgRoutes = require("./src/routes/organizationRoutes");
const notificRoutes = require("./src/routes/notificationRoutes");
const columnRoutes = require("./src/routes/columnRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const paymentRoutes = require("./src/routes/paymentRoutes");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", authRoutes);
app.use("/api/project", projectRoutes);
app.use("/api/users", userRoutes);
app.use("/api/organizations", orgRoutes);
app.use("/api/notifications", notificRoutes);
app.use("/api/column", columnRoutes);
app.use("/api/task", taskRoutes)
app.use("/api/tasks", taskRoutes);
app.use("/api/payments", paymentRoutes);

app.get("/", (req, res) => {
  res.json({ message: "TaskiFlow Backend çalışıyor! 🚀" });
});

const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server Full Mod (Auth + Task + Payment) çalışıyor: http://localhost:${PORT}`);
});