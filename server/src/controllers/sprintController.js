const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

async function getProjectAccess(userId, projectId) {
  const project = await prisma.project.findUnique({ where: { id: projectId } });
  if (!project) return { project: null, allowed: false };

  const isOwner = project.ownerId === userId;
  const membership = await prisma.user_Project.findUnique({
    where: { userId_projectId: { userId, projectId } },
  });

  return { project, allowed: isOwner || !!membership };
}

function computeMetrics(tasks) {
  const committedPoints = tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
  const completedTasks = tasks.filter((t) => t.isCompleted);
  const completedPoints = completedTasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

  return {
    totalTasks: tasks.length,
    completedTasks: completedTasks.length,
    committedPoints,
    completedPoints,
    completionRate: tasks.length ? Math.round((completedTasks.length / tasks.length) * 100) : 0,
  };
}

exports.getSprints = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { projectId } = req.params;

  try {
    const { allowed } = await getProjectAccess(userId, projectId);
    if (!allowed) {
      return res.status(403).json({ error: "Bu projeye erişim yetkiniz yok." });
    }

    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      include: {
        tasks: {
          select: { id: true, title: true, storyPoints: true, isCompleted: true, priority: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    const withMetrics = sprints.map((s) => ({
      ...s,
      metrics: computeMetrics(s.tasks),
    }));

    res.json(withMetrics);
  } catch (error) {
    console.error("getSprints Hatası:", error);
    res.status(500).json({ error: "Sprintler yüklenemedi." });
  }
};

exports.createSprint = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { projectId } = req.params;
  const { name, goal, startDate, endDate } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Sprint adı zorunludur." });
  }

  try {
    const { allowed } = await getProjectAccess(userId, projectId);
    if (!allowed) {
      return res.status(403).json({ error: "Bu projeye erişim yetkiniz yok." });
    }

    const sprint = await prisma.sprint.create({
      data: {
        name: name.trim(),
        goal: goal || null,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        projectId,
      },
    });

    res.status(201).json({ message: "Sprint oluşturuldu.", sprint });
  } catch (error) {
    console.error("createSprint Hatası:", error);
    res.status(500).json({ error: "Sprint oluşturulamadı." });
  }
};

exports.updateSprint = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { sprintId } = req.params;
  const { name, goal, startDate, endDate } = req.body;

  try {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) return res.status(404).json({ error: "Sprint bulunamadı." });

    const { allowed } = await getProjectAccess(userId, sprint.projectId);
    if (!allowed) {
      return res.status(403).json({ error: "Bu sprinti düzenleme yetkiniz yok." });
    }

    const updated = await prisma.sprint.update({
      where: { id: sprintId },
      data: {
        ...(name !== undefined && { name: name.trim() }),
        ...(goal !== undefined && { goal }),
        ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
        ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
      },
    });

    res.json({ message: "Sprint güncellendi.", sprint: updated });
  } catch (error) {
    console.error("updateSprint Hatası:", error);
    res.status(500).json({ error: "Sprint güncellenemedi." });
  }
};

exports.startSprint = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { sprintId } = req.params;

  try {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) return res.status(404).json({ error: "Sprint bulunamadı." });

    const { allowed } = await getProjectAccess(userId, sprint.projectId);
    if (!allowed) {
      return res.status(403).json({ error: "Bu sprinti başlatma yetkiniz yok." });
    }

    if (sprint.status !== "PLANNED") {
      return res.status(400).json({ error: "Sadece planlanan bir sprint başlatılabilir." });
    }

    const activeSprint = await prisma.sprint.findFirst({
      where: { projectId: sprint.projectId, status: "ACTIVE" },
    });
    if (activeSprint) {
      return res.status(400).json({
        error: `Önce aktif olan "${activeSprint.name}" sprintini tamamlamalısınız.`,
      });
    }

    const updated = await prisma.sprint.update({
      where: { id: sprintId },
      data: { status: "ACTIVE", startDate: sprint.startDate || new Date() },
    });

    res.json({ message: "Sprint başlatıldı.", sprint: updated });
  } catch (error) {
    console.error("startSprint Hatası:", error);
    res.status(500).json({ error: "Sprint başlatılamadı." });
  }
};

exports.completeSprint = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { sprintId } = req.params;

  try {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) return res.status(404).json({ error: "Sprint bulunamadı." });

    const { allowed } = await getProjectAccess(userId, sprint.projectId);
    if (!allowed) {
      return res.status(403).json({ error: "Bu sprinti tamamlama yetkiniz yok." });
    }

    if (sprint.status !== "ACTIVE") {
      return res.status(400).json({ error: "Sadece aktif bir sprint tamamlanabilir." });
    }

    const updated = await prisma.sprint.update({
      where: { id: sprintId },
      data: { status: "COMPLETED", endDate: new Date(), completedAt: new Date() },
      include: { tasks: true },
    });

    res.json({
      message: "Sprint tamamlandı ve geçmişe kaydedildi.",
      sprint: { ...updated, metrics: computeMetrics(updated.tasks) },
    });
  } catch (error) {
    console.error("completeSprint Hatası:", error);
    res.status(500).json({ error: "Sprint tamamlanamadı." });
  }
};

exports.deleteSprint = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { sprintId } = req.params;

  try {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) return res.status(404).json({ error: "Sprint bulunamadı." });

    const { allowed } = await getProjectAccess(userId, sprint.projectId);
    if (!allowed) {
      return res.status(403).json({ error: "Bu sprinti silme yetkiniz yok." });
    }

    await prisma.sprint.delete({ where: { id: sprintId } });

    res.json({ message: "Sprint silindi." });
  } catch (error) {
    console.error("deleteSprint Hatası:", error);
    res.status(500).json({ error: "Sprint silinemedi." });
  }
};