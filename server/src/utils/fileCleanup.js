const fs = require("fs");
const path = require("path");

/**
 * Belge kayıtları silinirken diskteki dosyaları da temizlemek için.
 *
 * NEDEN GEREKLİ: Görev ekleri Document olarak saklanıyor ve Document.taskId
 * üzerinde onDelete: Cascade var. Yani bir görev (ya da onu kapsayan sütun /
 * proje) silindiğinde veritabanı kaydı kendiliğinden gidiyor, ama dosya
 * diskte kalıyor. Kimsenin erişemediği bu dosyalar zamanla birikir.
 *
 * Cascade veritabanı seviyesinde çalıştığı için Prisma middleware'i de
 * tetiklenmez; bu yüzden silme işleminden ÖNCE dosya yollarını toplayıp
 * işlem başarılı olduktan sonra elle siliyoruz.
 */

// filePath veritabanında "/uploads/documents/x.pdf" biçiminde tutuluyor;
// diskteki karşılığı server/uploads/documents/x.pdf.
const toDiskPath = (filePath) =>
  path.join(__dirname, "..", "..", filePath.replace(/^\/uploads/, "uploads"));

/**
 * Verilen Prisma filtresine uyan belgelerin dosya yollarını toplar.
 * Silme işleminden ÖNCE çağrılmalı, çünkü sonrasında kayıtlar kaybolur.
 *
 * @param {import("@prisma/client").PrismaClient} prisma
 * @param {object} where - Document modeli için Prisma where filtresi
 * @returns {Promise<string[]>} silinecek dosyaların disk yolları
 */
async function collectDocumentPaths(prisma, where) {
  const documents = await prisma.document.findMany({
    where,
    select: { filePath: true },
  });

  return documents.map((doc) => toDiskPath(doc.filePath));
}

/**
 * Toplanan dosyaları diskten siler. Hata durumunda sessiz kalır: veritabanı
 * kaydı çoktan silinmiş olur ve artakalan bir dosya, isteği başarısız
 * saymayı gerektirecek kadar önemli değildir.
 */
function removeFiles(diskPaths) {
  for (const diskPath of diskPaths) {
    fs.unlink(diskPath, () => {});
  }
}

module.exports = { collectDocumentPaths, removeFiles, toDiskPath };
