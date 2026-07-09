// controllers/columnController.js
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

exports.createColumn = async (req, res) => {
    const { title } = req.body;
    const { projectId } = req.params; 
    const userId = req.user.id || req.user.userId;

    if (!title) {
        return res.status(400).json({ error: "Sütun adı boş bırakılamaz." });
    }

    try {

        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        });

        if(!project){
            return res.status(404).json({error: "Proje Bulunamadı."});
        }

        if(userId !== project.ownerId){
            return res.status(400).json({error: "Sütun ekleme yetkiniz yok."});
        }

        const columnCount = await prisma.column.count({
            where: { projectId: projectId }
        });

        const newColumn = await prisma.column.create({
            data: {
                title: title,
                projectId: projectId,
                order: columnCount 
            }
        });

        res.status(201).json({
            message: "Sütun başarıyla oluşturuldu.",
            column: newColumn
        });

    } catch (error) {
        console.error("createColumn Hatası: ", error);
        res.status(500).json({ error: "Sütun oluşturulurken bir hata oluştu." });
    }
}

exports.deleteColumn = async (req, res) => {
    const { projectId, columnId } = req.params; 
    const userId = req.user.id || req.user.userId;

    try {
        
        const column = await prisma.column.findUnique({
            where: { id: columnId },
            include: { project: true }
        });

        if (!column) {
            return res.status(404).json({ error: "Silinecek sütun bulunamadı." });
        }

        if (userId !== column.project.ownerId) {
            return res.status(403).json({ error: "Sütun silme yetkiniz yok." });
        }

        await prisma.column.delete({
            where: { id: columnId }
        });

        res.status(200).json({ message: "Sütun başarıyla silindi." });

    } catch (error) {
        console.error("deleteColumn Hatası:", error);
        res.status(500).json({ error: "Sütun silinirken sunucu hatası oluştu." });
    }
}