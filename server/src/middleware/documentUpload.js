const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const documentsDir = path.join(__dirname, "..", "..", "uploads", "documents");
if (!fs.existsSync(documentsDir)) {
  fs.mkdirSync(documentsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, documentsDir);
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${uuidv4()}${ext}`);
  },
});

const allowedMimeTypes = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  "image/jpeg",
  "image/png",
  "image/webp",
];

const fileFilter = (req, file, cb) => {
  if (!allowedMimeTypes.includes(file.mimetype)) {
    return cb(new Error("Desteklenmeyen dosya türü."));
  }
  cb(null, true);
};

function detectType(mimetype) {
  if (mimetype === "application/pdf") return "pdf";
  if (mimetype.startsWith("image/")) return "image";
  if (mimetype.includes("word")) return "doc";
  if (mimetype.includes("sheet") || mimetype.includes("excel")) return "sheet";
  if (mimetype.includes("presentation") || mimetype.includes("powerpoint")) return "slide";
  return "doc";
}

const uploadDocument = multer({
  storage,
  fileFilter,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20MB
});

module.exports = { uploadDocument, documentsDir, detectType };