const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const fs = require("fs");
const path = require("path");
const { detectType } = require("../middleware/documentUpload");

async function checkMembership(userId, orgId) {
  const membership = await prisma.user_Organization.findUnique({
    where: { userId_organizationId: { userId, organizationId: orgId } },
  });
  return !!membership;
}


async function canAccessDocument(userId, doc) {
  if (!doc) return false;
  if (doc.orgId) {
    return checkMembership(userId, doc.orgId);
  }
  return doc.uploaderId === userId;
}

exports.getDocuments = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { orgId } = req.params;

  try {
    if (!(await checkMembership(userId, orgId))) {
      return res.status(403).json({ error: "Bu organizasyona erişim yetkiniz yok." });
    }

    const documents = await prisma.document.findMany({
      where: { orgId },
      orderBy: { updatedAt: "desc" },
    });

    res.json(documents);
  } catch (error) {
    console.error("getDocuments Hatası:", error);
    res.status(500).json({ error: "Belgeler yüklenemedi." });
  }
};

exports.uploadDocument = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { orgId } = req.params;

  try {
    if (!(await checkMembership(userId, orgId))) {
      return res.status(403).json({ error: "Bu organizasyona erişim yetkiniz yok." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Dosya bulunamadı." });
    }

    const document = await prisma.document.create({
      data: {
        name: req.file.originalname,
        type: detectType(req.file.mimetype),
        size: req.file.size,
        filePath: `/uploads/documents/${req.file.filename}`,
        orgId,
        uploaderId: userId,
      },
    });

    res.status(201).json({ message: "Belge yüklendi.", document });
  } catch (error) {
    console.error("uploadDocument Hatası:", error);
    res.status(500).json({ error: "Belge yüklenemedi." });
  }
};

// Kişisel Belgeler

exports.getPersonalDocuments = async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const documents = await prisma.document.findMany({
      where: { uploaderId: userId, orgId: null },
      orderBy: { updatedAt: "desc" },
    });

    res.json(documents);
  } catch (error) {
    console.error("getPersonalDocuments Hatası:", error);
    res.status(500).json({ error: "Belgeler yüklenemedi." });
  }
};

exports.uploadPersonalDocument = async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    if (!req.file) {
      return res.status(400).json({ error: "Dosya bulunamadı." });
    }

    const document = await prisma.document.create({
      data: {
        name: req.file.originalname,
        type: detectType(req.file.mimetype),
        size: req.file.size,
        filePath: `/uploads/documents/${req.file.filename}`,
        orgId: null,
        uploaderId: userId,
      },
    });

    res.status(201).json({ message: "Belge yüklendi.", document });
  } catch (error) {
    console.error("uploadPersonalDocument Hatası:", error);
    res.status(500).json({ error: "Belge yüklenemedi." });
  }
};

exports.toggleStar = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { docId } = req.params;

  try {
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc || !(await canAccessDocument(userId, doc))) {
      return res.status(404).json({ error: "Belge bulunamadı." });
    }

    const updated = await prisma.document.update({
      where: { id: docId },
      data: { starred: !doc.starred },
    });

    res.json(updated);
  } catch (error) {
    console.error("toggleStar Hatası:", error);
    res.status(500).json({ error: "İşlem başarısız oldu." });
  }
};

exports.renameDocument = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { docId } = req.params;
  const { name } = req.body;

  if (!name || !name.trim()) {
    return res.status(400).json({ error: "Geçerli bir isim girin." });
  }

  try {
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc || !(await canAccessDocument(userId, doc))) {
      return res.status(404).json({ error: "Belge bulunamadı." });
    }

    const updated = await prisma.document.update({
      where: { id: docId },
      data: { name: name.trim() },
    });

    res.json(updated);
  } catch (error) {
    console.error("renameDocument Hatası:", error);
    res.status(500).json({ error: "Yeniden adlandırılamadı." });
  }
};

exports.deleteDocument = async (req, res) => {
  const userId = req.user.id || req.user.userId;
  const { docId } = req.params;

  try {
    const doc = await prisma.document.findUnique({ where: { id: docId } });
    if (!doc || !(await canAccessDocument(userId, doc))) {
      return res.status(404).json({ error: "Belge bulunamadı." });
    }

    const fullPath = path.join(__dirname, "..", "..", doc.filePath.replace(/^\/uploads/, "uploads"));
    fs.unlink(fullPath, () => {});

    await prisma.document.delete({ where: { id: docId } });

    res.json({ message: "Belge silindi." });
  } catch (error) {
    console.error("deleteDocument Hatası:", error);
    res.status(500).json({ error: "Belge silinemedi." });
  }
};