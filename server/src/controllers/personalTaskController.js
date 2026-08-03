const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getMyTasks = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  try {
    const tasks = await prisma.personalTask.findMany({
      where: { userId },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }],
    });
    res.json(tasks);
  } catch (error) {
    console.error("getMyTasks Hatası:", error);
    res.status(500).json({ error: "Görevler yüklenemedi." });
  }
};

exports.createTask = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { title, dueDate, priority } = req.body;

  if (!title || !title.trim()) {
    return res.status(400).json({ error: "Görev başlığı zorunludur." });
  }

  try {
    const task = await prisma.personalTask.create({
      data: {
        title: title.trim(),
        dueDate: dueDate ? new Date(dueDate) : null,
        priority: priority || "MEDIUM",
        userId,
      },
    });
    res.status(201).json(task);
  } catch (error) {
    console.error("createTask (personal) Hatası:", error);
    res.status(500).json({ error: "Görev oluşturulamadı." });
  }
};

exports.updateStatus = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;
  const { status } = req.body;

  if (!["TODO", "DONE"].includes(status)) {
    return res.status(400).json({ error: "Geçersiz durum." });
  }

  try {
    const task = await prisma.personalTask.findUnique({ where: { id } });
    if (!task || task.userId !== userId) {
      return res.status(404).json({ error: "Görev bulunamadı." });
    }

    const updated = await prisma.personalTask.update({
      where: { id },
      data: { status },
    });
    res.json(updated);
  } catch (error) {
    console.error("updateStatus (personal) Hatası:", error);
    res.status(500).json({ error: "Görev güncellenemedi." });
  }
};

exports.deleteTask = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { id } = req.params;

  try {
    const task = await prisma.personalTask.findUnique({ where: { id } });
    if (!task || task.userId !== userId) {
      return res.status(404).json({ error: "Görev bulunamadı." });
    }

    await prisma.personalTask.delete({ where: { id } });
    res.json({ message: "Görev silindi." });
  } catch (error) {
    console.error("deleteTask (personal) Hatası:", error);
    res.status(500).json({ error: "Görev silinemedi." });
  }
};