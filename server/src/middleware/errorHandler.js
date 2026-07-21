// Merkezi hata yönetimi
function errorHandler(err, req, res, next) {
  const statusCode = err.statusCode || 500;

  console.error(`[HATA] ${req.method} ${req.originalUrl} ->`, err);

  if (err.name === "MulterError" || err.message?.includes("JPEG, PNG veya WEBP")) {
    return res.status(400).json({ error: err.message || "Dosya yüklenirken bir hata oluştu." });
  }

  if (err.code === "P2002") {
    return res.status(409).json({ error: "Bu kayıt zaten mevcut (benzersizlik ihlali)." });
  }
  if (err.code === "P2025") {
    return res.status(404).json({ error: "İlgili kayıt bulunamadı." });
  }

  res.status(statusCode).json({
    error: statusCode === 500 ? "Sunucu hatası oluştu." : err.message,
  });
}

module.exports = errorHandler;