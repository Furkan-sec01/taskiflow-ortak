const jwt = require("jsonwebtoken");
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const JWT_SECRET = process.env.JWT_SECRET;

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) return res.status(401).json({ error: "Erişim reddedildi. Token yok." });

  jwt.verify(token, JWT_SECRET, async (err, user) => {
    if (err) return res.status(403).json({ error: "Geçersiz veya süresi dolmuş token." });

    try {
      await prisma.session.update({
        where: { token },
        data: { lastActive: new Date() },
      });

      req.user = user;
      next();
    } catch (dbErr) {
      if (dbErr.code === "P2025") {
        return res.status(401).json({ error: "Oturumun sonlandırılmış. Lütfen tekrar giriş yap." });
      }
      console.error("authMiddleware DB Hatası:", dbErr);
      return res.status(500).json({ error: "Sunucu hatası." });
    }
  });
};

module.exports = authenticateToken;