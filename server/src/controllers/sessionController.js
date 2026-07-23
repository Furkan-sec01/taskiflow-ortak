const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.getSessions = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const currentToken = req.headers.authorization?.split(" ")[1];

  try {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { lastActive: "desc" },
    });

    const result = sessions.map((s) => ({
      id: s.id,
      deviceName: s.deviceName,
      deviceType: s.deviceType,
      lastActive: s.lastActive,
      current: s.token === currentToken,
    }));

    res.json(result);
  } catch (error) {
    console.error("getSessions Hatası:", error);
    res.status(500).json({ error: "Oturumlar yüklenemedi." });
  }
};

exports.deleteSession = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { sessionId } = req.params;

  try {
    const session = await prisma.session.findUnique({ where: { id: sessionId } });

    if (!session || session.userId !== userId) {
      return res.status(404).json({ error: "Oturum bulunamadı." });
    }

    await prisma.session.delete({ where: { id: sessionId } });
    res.json({ message: "Oturum sonlandırıldı." });
  } catch (error) {
    console.error("deleteSession Hatası:", error);
    res.status(500).json({ error: "Oturum sonlandırılamadı." });
  }
};

exports.deleteOtherSessions = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const currentToken = req.headers.authorization?.split(" ")[1];

  try {
    await prisma.session.deleteMany({
      where: { userId, NOT: { token: currentToken } },
    });
    res.json({ message: "Diğer tüm oturumlar sonlandırıldı." });
  } catch (error) {
    console.error("deleteOtherSessions Hatası:", error);
    res.status(500).json({ error: "Oturumlar sonlandırılamadı." });
  }
};