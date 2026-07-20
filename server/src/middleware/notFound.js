function notFound(req, res) {
  res.status(404).json({ error: `Rota bulunamadı: ${req.method} ${req.originalUrl}` });
}

module.exports = notFound;