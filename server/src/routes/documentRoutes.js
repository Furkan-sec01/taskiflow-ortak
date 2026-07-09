const express = require("express");
const router = express.Router();

// Test amaçlı temel bir rota (ileride döküman yükleme kodlarını buraya eklersin)
router.get("/", (req, res) => {
  res.json({ message: "Döküman rotası çalışıyor!" });
});

// Sunucunun çökmesini engelleyen asıl eksik kısım:
module.exports = router;