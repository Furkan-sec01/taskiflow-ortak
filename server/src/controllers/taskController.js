const {PrismaClient} = require("@prisma/client");
const fs = require("fs");
const path = require("path");
const { detectType } = require("../middleware/documentUpload");
const { collectDocumentPaths, removeFiles } = require("../utils/fileCleanup");
const prisma = new PrismaClient();

/**
 * Görevi bulur ve kullanıcının o göreve erişip erişemeyeceğini söyler.
 * Erişim kuralı, projenin panosuyla aynı: proje sahibi ya da proje üyesi.
 * Yorum/ek uçlarının hepsi bunu kullanıyor ki yetki mantığı tek yerde dursun.
 */
async function getTaskAccess(userId, taskId) {
    const task = await prisma.task.findUnique({
        where: { id: taskId },
        include: { project: { select: { id: true, ownerId: true } } }
    });

    if (!task) return { task: null, allowed: false };

    if (task.project.ownerId === userId) return { task, allowed: true };

    const membership = await prisma.user_Project.findUnique({
        where: { userId_projectId: { userId, projectId: task.projectId } }
    });

    return { task, allowed: !!membership };
}


exports.createTask = async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const {title,assigneeMail,priority,date,description} = req.body;
    const {projectId,columnId} = req.params;
    
    if(!title ||!assigneeMail || !priority || !date || !description){
        res.status(400).json({
            error: "Gerekli alanları doldurmalısınız."
        });

        return;
    }

    try{
        const user = await prisma.user.findUnique({
            where: {
                id: userId
            }
        });

        if(!user){
            res.status(404).json({
                error: "Kullanıcı bulunamadı."
            });

            return;
        }

        const assignee = await prisma.user.findUnique({
            where: {
                email: assigneeMail
            }
        });

        if(!assignee){
            res.status(404).json({
                error: "Görevi yapcak üye bulunamadı."
            });

            return;
        }

        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        });

        if(!project){
            return res.status(404).json({error: "Proje Bulunamadı."});
        }

if(userId !== project.ownerId){
    return res.status(400).json({error: "Görev ekleme yetkiniz yok."});
}

    // Atanan kişinin gerçekten bu projenin üyesi (veya sahibi) olduğunu doğrula
        if (assignee.id !== project.ownerId) {
            const assigneeMembership = await prisma.user_Project.findUnique({
        where: {
            userId_projectId: { userId: assignee.id, projectId }
        }
    });

         if (!assigneeMembership) {
            return res.status(400).json({ error: "Bu kişi bu projenin üyesi değil." });
    }
} 

await prisma.task.create({
            data: {
                title: title,
                ownerId: user.id,
                assigneeId: assignee.id,
                priority: priority,
                dueDate: new Date(date),
                description: description,
                columnId: columnId,
                projectId: projectId,
                totalTime: 0,
                isTracking: false,
                lastStartedAt: null
            }
        });

        await prisma.notification.create({
            data: {
                title: "Yeni Görev",
                message: `${user.name} size yeni bir görev verdi`,
                userId: assignee.id,
                type: "TASK",
                
            }
        })

        res.status(200).json({
            message: "Görev verildi."
        });
    }catch(error){
        res.status(500).json({
            error: "Server Hatası"
        });
        console.log("createTask hatası.");
    }

}

exports.deleteTask = async (req, res) => {
    const {taskId} = req.params;
    const userId = req.user.id || req.user.userId;


    try{
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: {
                project: {
                    select: { ownerId: true }
                }
            }
        });

        if(!task){
            res.status(404).json({
                error: "Görev bulunamadı."
            });

            return;
        }

        if(userId !== task.project.ownerId){
            return res.status(403).json({ error: "Bu görevi silme yetkiniz yok." });
        }

        // Ek dosyalarının yolları silmeden ÖNCE toplanmalı: Document.taskId
        // cascade olduğu için görev silinince kayıtlar da gider ve yollara
        // bir daha ulaşılamaz.
        const attachmentPaths = await collectDocumentPaths(prisma, { taskId });

        await prisma.task.delete({
            where: {
                id: taskId
            }
        });

        removeFiles(attachmentPaths);

        res.status(200).json({
            message: "Görev silindi."
        });


    }catch(error){
        console.log("deleteTask hatası: ",error);
        res.status(500).json({ error: "Görev silinirken bir sunucu hatası oluştu." });
    }
}

exports.toggleTimer = async (req, res)=>{
    const {taskId} = req.params;
    const {action} =req.body;
    const userId = req.user.id || req.user.userId;

    try{

        const task = await prisma.task.findUnique({
            where: {
                id: taskId
            }
        });

        if (!task) {
            return res.status(404).json({ error: "Görev bulunamadı." });
        }

        if(userId !== task.assigneeId){
            res.status(403).json({
                error: "Sadece kendi görevinizin süresini başlatıp durdurabilirsiniz."
            });

            return;
        }

        if(action == "START"){
            if (task.isTracking) return res.status(400).json({ error: "Sayaç zaten çalışıyor." });

            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: {
                    isTracking: true,
                    lastStartedAt: new Date() // Başlangıç zamanını şu an yap
                }
            });

            return res.status(200).json({ message: "Sayaç başlatıldı.", task: updatedTask });
        } 

        else if(action == "STOP"){
            if (!task.isTracking || !task.lastStartedAt) {
                return res.status(400).json({ error: "Çalışmayan bir sayaç durdurulamaz." });
            }

            const now = new Date();
            const start = new Date(task.lastStartedAt);
            const secondsPassed = Math.floor((now - start) / 1000); 

            const updatedTask = await prisma.task.update({
                where: { id: taskId },
                data: {
                    isTracking: false,
                    lastStartedAt: null, 
                    totalTime: {
                        increment: secondsPassed 
                    }
                }
            });

            return res.status(200).json({ message: "Sayaç durduruldu.", task: updatedTask });
        }
        else{
            return res.status(400).json({ error: "Geçersiz işlem." });
        }


    }catch(error){
        console.error("toggleTimer Hatası:", error);
        res.status(500).json({ error: "Zaman güncellenirken bir hata oluştu." });
    }
}


exports.assignSprint = async (req, res) => {
    const { taskId } = req.params;
    const { sprintId } = req.body;
    const userId = req.user.id || req.user.userId;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });

        if (!task) {
            return res.status(404).json({ error: "Görev bulunamadı." });
        }

        const isOwner = task.project.ownerId === userId;
        const membership = await prisma.user_Project.findUnique({
            where: { userId_projectId: { userId, projectId: task.projectId } }
        });

        if (!isOwner && !membership) {
            return res.status(403).json({ error: "Bu görevi düzenleme yetkiniz yok." });
        }

        if (sprintId) {
            const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
            if (!sprint || sprint.projectId !== task.projectId) {
                return res.status(400).json({ error: "Geçersiz sprint." });
            }
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { sprintId: sprintId || null }
        });

        res.status(200).json({
            message: sprintId ? "Görev sprinte eklendi." : "Görev sprintten çıkarıldı.",
            task: updatedTask
        });
    } catch (error) {
        console.error("assignSprint Hatası:", error);
        res.status(500).json({ error: "Görev güncellenirken bir hata oluştu." });
    }
};


exports.updateStoryPoints = async (req, res) => {
    const { taskId } = req.params;
    const { storyPoints } = req.body;
    const userId = req.user.id || req.user.userId;

    if (storyPoints === undefined || storyPoints === null || Number(storyPoints) < 0) {
        return res.status(400).json({ error: "Geçerli bir puan girin." });
    }

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });

        if (!task) {
            return res.status(404).json({ error: "Görev bulunamadı." });
        }

        const isOwner = task.project.ownerId === userId;
        const membership = await prisma.user_Project.findUnique({
            where: { userId_projectId: { userId, projectId: task.projectId } }
        });

        if (!isOwner && !membership) {
            return res.status(403).json({ error: "Bu görevi düzenleme yetkiniz yok." });
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: { storyPoints: Number(storyPoints) }
        });

        res.status(200).json({ message: "Puan güncellendi.", task: updatedTask });
    } catch (error) {
        console.error("updateStoryPoints Hatası:", error);
        res.status(500).json({ error: "Puan güncellenirken bir hata oluştu." });
    }
};
exports.completeTask = async (req, res) => {
    const { taskId } = req.params;
    const { action } = req.body; // "COMPLETED" veya "NONE"
    const userId = req.user.id || req.user.userId;

    try {
        const task = await prisma.task.findUnique({
            where: { id: taskId },
            include: { project: true }
        });

        if (!task) {
            return res.status(404).json({ error: "Görev bulunamadı." });
        }

        // Yetki kontrolü - assignee, owner veya proje sahibi olabilir
        const isAuthorized = userId === task.assigneeId || 
                             userId === task.ownerId || 
                             userId === task.project?.ownerId;

        if (!isAuthorized) {
            return res.status(403).json({
                error: "Bu görevin durumunu değiştirme yetkiniz yok."
            });
        }

        const isDone = action === "COMPLETED";

        let targetColumnId = task.columnId;

        // Sütun adları kullanıcı tarafından serbestçe yazıldığı için başlıkta
        // anahtar kelime arıyoruz. mode: "insensitive" sayesinde her kelimeyi
        // ayrıca büyük/küçük harfli varyantlarıyla listelemeye gerek yok.
        const titleMatches = (keywords) =>
            keywords.map((word) => ({
                title: { contains: word, mode: "insensitive" },
            }));

        if (isDone) {
            const completedColumn = await prisma.column.findFirst({
                where: {
                    projectId: task.projectId,
                    OR: titleMatches(["tamamland", "bitti", "done", "complete"]),
                },
                orderBy: { order: "asc" },
            });

            if (completedColumn) {
                targetColumnId = completedColumn.id;
            }
        } else {
            // Geri alınırsa "Yapılacak" kolonuna taşı.
            // DİKKAT: Burada tamamlanma kelimelerini aramak görevi geri almak
            // yerine yine "Tamamlandı" sütununa taşır - eski hata buydu.
            const todoColumn = await prisma.column.findFirst({
                where: {
                    projectId: task.projectId,
                    OR: titleMatches([
                        "yapılacak",
                        "yapilacak",
                        "todo",
                        "to do",
                        "backlog",
                        "beklemede",
                    ]),
                },
                orderBy: { order: "asc" },
            });

            // Eşleşen sütun yoksa panonun ilk sütununa dön; görevi
            // "Tamamlandı"da bırakmaktan her hâlükârda daha doğru.
            const fallbackColumn = todoColumn
                ? null
                : await prisma.column.findFirst({
                      where: { projectId: task.projectId },
                      orderBy: { order: "asc" },
                  });

            const destination = todoColumn || fallbackColumn;

            if (destination) {
                targetColumnId = destination.id;
            }
        }

        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                isCompleted: isDone,
                completedAt: isDone ? new Date() : null,
                columnId: targetColumnId
            }
        });

        return res.status(200).json({
            message: isDone ? "Görev tamamlandı olarak işaretlendi." : "Görev durumu geri alındı.",
            task: updatedTask
        });

    } catch (error) {
        console.error("completeTask hatası:", error);
        res.status(500).json({ error: "Sunucu hatası oluştu." });
    }
};

/* ─────────────────────────── GÖREV YORUMLARI ─────────────────────────── */

// Yazarı silinmiş yorumlarda arayüzün tutarlı bir ad göstermesi için.
const formatComment = (comment) => ({
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    author: comment.author
        ? { id: comment.author.id, name: comment.author.name, email: comment.author.email }
        : null
});

exports.getComments = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id || req.user.userId;

    try {
        const { task, allowed } = await getTaskAccess(userId, taskId);

        if (!task) return res.status(404).json({ error: "Görev bulunamadı." });
        if (!allowed) return res.status(403).json({ error: "Bu görevin yorumlarını görme yetkiniz yok." });

        const comments = await prisma.taskComment.findMany({
            where: { taskId },
            include: { author: { select: { id: true, name: true, email: true } } },
            orderBy: { createdAt: "asc" }
        });

        res.json(comments.map(formatComment));
    } catch (error) {
        console.error("getComments Hatası:", error);
        res.status(500).json({ error: "Yorumlar yüklenemedi." });
    }
};

exports.addComment = async (req, res) => {
    const { taskId } = req.params;
    const { content } = req.body;
    const userId = req.user.id || req.user.userId;

    if (typeof content !== "string" || !content.trim()) {
        return res.status(400).json({ error: "Yorum boş olamaz." });
    }

    if (content.length > 2000) {
        return res.status(400).json({ error: "Yorum en fazla 2000 karakter olabilir." });
    }

    try {
        const { task, allowed } = await getTaskAccess(userId, taskId);

        if (!task) return res.status(404).json({ error: "Görev bulunamadı." });
        if (!allowed) return res.status(403).json({ error: "Bu göreve yorum yapma yetkiniz yok." });

        const comment = await prisma.taskComment.create({
            data: { content: content.trim(), taskId, authorId: userId },
            include: { author: { select: { id: true, name: true, email: true } } }
        });

        // Görevin sahibine/atanana haber ver; kendi yorumun için bildirim gitmez.
        const notifyIds = [task.assigneeId, task.ownerId].filter(
            (id, i, arr) => id && id !== userId && arr.indexOf(id) === i
        );

        if (notifyIds.length > 0) {
            await prisma.notification.createMany({
                data: notifyIds.map((id) => ({
                    userId: id,
                    title: "Göreve Yeni Yorum",
                    message: `${comment.author?.name || "Bir kullanıcı"} "${task.title}" görevine yorum yaptı.`,
                    type: "TASK"
                }))
            });
        }

        res.status(201).json(formatComment(comment));
    } catch (error) {
        console.error("addComment Hatası:", error);
        res.status(500).json({ error: "Yorum eklenemedi." });
    }
};

exports.deleteComment = async (req, res) => {
    const { taskId, commentId } = req.params;
    const userId = req.user.id || req.user.userId;

    try {
        const { task, allowed } = await getTaskAccess(userId, taskId);

        if (!task) return res.status(404).json({ error: "Görev bulunamadı." });
        if (!allowed) return res.status(403).json({ error: "Bu göreve erişim yetkiniz yok." });

        const comment = await prisma.taskComment.findUnique({ where: { id: commentId } });

        if (!comment || comment.taskId !== taskId) {
            return res.status(404).json({ error: "Yorum bulunamadı." });
        }

        // Yorumu yazan kişi veya proje sahibi silebilir.
        const canDelete = comment.authorId === userId || task.project.ownerId === userId;

        if (!canDelete) {
            return res.status(403).json({ error: "Bu yorumu silme yetkiniz yok." });
        }

        await prisma.taskComment.delete({ where: { id: commentId } });

        res.json({ message: "Yorum silindi." });
    } catch (error) {
        console.error("deleteComment Hatası:", error);
        res.status(500).json({ error: "Yorum silinemedi." });
    }
};

/* ──────────────────────────── GÖREV EKLERİ ───────────────────────────── */

const formatAttachment = (doc) => ({
    id: doc.id,
    name: doc.name,
    type: doc.type,
    size: doc.size,
    url: doc.filePath,
    createdAt: doc.createdAt,
    uploader: doc.uploader
        ? { id: doc.uploader.id, name: doc.uploader.name, email: doc.uploader.email }
        : null
});

// Yükleme başarısız olduğunda multer'ın diske yazdığı dosyayı geride bırakma.
const removeUploadedFile = (file) => {
    if (file?.path) fs.unlink(file.path, () => {});
};

exports.addAttachment = async (req, res) => {
    const { taskId } = req.params;
    const userId = req.user.id || req.user.userId;

    try {
        if (!req.file) {
            return res.status(400).json({ error: "Dosya bulunamadı." });
        }

        const { task, allowed } = await getTaskAccess(userId, taskId);

        if (!task) {
            removeUploadedFile(req.file);
            return res.status(404).json({ error: "Görev bulunamadı." });
        }

        if (!allowed) {
            removeUploadedFile(req.file);
            return res.status(403).json({ error: "Bu göreve dosya ekleme yetkiniz yok." });
        }

        const document = await prisma.document.create({
            data: {
                name: req.file.originalname,
                type: detectType(req.file.mimetype),
                size: req.file.size,
                filePath: `/uploads/documents/${req.file.filename}`,
                taskId,
                orgId: null,
                uploaderId: userId
            },
            include: { uploader: { select: { id: true, name: true, email: true } } }
        });

        res.status(201).json(formatAttachment(document));
    } catch (error) {
        console.error("addAttachment Hatası:", error);
        removeUploadedFile(req.file);
        res.status(500).json({ error: "Dosya eklenemedi." });
    }
};

exports.deleteAttachment = async (req, res) => {
    const { taskId, attachmentId } = req.params;
    const userId = req.user.id || req.user.userId;

    try {
        const { task, allowed } = await getTaskAccess(userId, taskId);

        if (!task) return res.status(404).json({ error: "Görev bulunamadı." });
        if (!allowed) return res.status(403).json({ error: "Bu göreve erişim yetkiniz yok." });

        const document = await prisma.document.findUnique({ where: { id: attachmentId } });

        if (!document || document.taskId !== taskId) {
            return res.status(404).json({ error: "Ek bulunamadı." });
        }

        // Dosyayı yükleyen kişi veya proje sahibi silebilir.
        const canDelete = document.uploaderId === userId || task.project.ownerId === userId;

        if (!canDelete) {
            return res.status(403).json({ error: "Bu eki silme yetkiniz yok." });
        }

        await prisma.document.delete({ where: { id: attachmentId } });

        const fullPath = path.join(
            __dirname, "..", "..",
            document.filePath.replace(/^\/uploads/, "uploads")
        );
        fs.unlink(fullPath, () => {});

        res.json({ message: "Ek silindi." });
    } catch (error) {
        console.error("deleteAttachment Hatası:", error);
        res.status(500).json({ error: "Ek silinemedi." });
    }
};
