const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();


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

        

        await prisma.task.delete({
            where: {
                id: taskId
            }
        });

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

        if (isDone) {
            // "Tamamlandı" kolonunu bul
            const completedColumn = await prisma.column.findFirst({
    where: {
        projectId: task.projectId,
        OR: [
            { title: { contains: "Tamamland" } },
            { title: { contains: "tamamland" } },
            { title: { contains: "done" } },
            { title: { contains: "completed" } },
        ]
    }
});
            if (completedColumn) {
                targetColumnId = completedColumn.id;
            }
        } else {
            // Geri alınırsa "Yapılacak" kolonuna taşı
            const todoColumn = await prisma.column.findFirst({
                where: {
                    projectId: task.projectId,
                   OR: [
    { title: { contains: "Tamamla" } },
    { title: { contains: "tamamla" } },
    { title: { contains: "Done" } },
    { title: { contains: "done" } },
    { title: { contains: "completed" } },
]
                }
            });

            if (todoColumn) {
                targetColumnId = todoColumn.id;
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
