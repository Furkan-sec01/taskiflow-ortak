const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();

const PLAN_PROJECT_LIMITS = {
    FREE: 2,
    PRO: 10,
    BUSINESS: 999999
};

//projeleri getir
exports.getProjects = async (req, res) => {
    const { userId } = req.user;

    try {
        const projects = await prisma.project.findMany({
            where: {
                OR: [
                    { ownerId: userId },
                    { members: { some: { userId: userId } } }
                ]
            },
            include: {
                _count: {
                    select: { columns: true }
                }
            },
            orderBy: { createdAt: "desc" }
        });
        res.json(projects);
    } catch (error) {
        console.error("Proje Listeleme Hatası:", error.message);
        res.status(500).json({ error: "Projeler yüklenemedi." });
    }
};

//yeni proje
exports.createProject = async (req, res) => {
    const { title, description, organizationId } = req.body;
    const userId = req.user.id || req.user.userId;

    if (!title || !description) {
        return res.status(400).json({
            error: "Başlık ve Açıklama doldurulmalı."
        });
    }

    try {
        const subscription = await prisma.subscription.findFirst({
            where: {
                userId,
                status: "ACTIVE"
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        const currentPlan = subscription?.plan || "FREE";
        const projectLimit = PLAN_PROJECT_LIMITS[currentPlan] || 2;

        const userProjectCount = await prisma.project.count({
            where: {
                ownerId: userId
            }
        });

        if (userProjectCount >= projectLimit) {
            return res.status(403).json({
                error: `${currentPlan} planında en fazla ${projectLimit} proje oluşturabilirsiniz.`
            });
        }

        const newProject = await prisma.$transaction(async (tx) => {
            const project = await tx.project.create({
                data: {
                    title: title,
                    description: description,
                    orgId: organizationId || null,
                    ownerId: userId
                }
            });

            await tx.user_Project.create({
                data: {
                    userId: userId,
                    projectId: project.id
                }
            });

            return project;
        });

        res.status(201).json({
            message: "Proje başarıyla oluşturuldu.",
            project: newProject
        });
    } catch (error) {
        console.error("createProject Hatası:", error);
        res.status(500).json({ error: "Proje oluşturulurken bir hata oluştu." });
    }
};

exports.getProjectByOrg = async (req, res) => {
    const { orgId } = req.params;
    const userId = req.user.id || req.user.userId;

    try {
        const membership = await prisma.user_Organization.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: orgId
                }
            }
        });

        if (!membership) {
            return res.status(403).json({ error: "Bu organizasyonun projelerine erişim yetkiniz yok." });
        }

        const projects = await prisma.project.findMany({
            where: {
                orgId: orgId
            },
            include: {
                members: true,
                _count: {
                    select: {
                        tasks: true,
                        columns: true
                    }
                }
            },
            orderBy: {
                createdAt: "desc"
            }
        });

        res.json(projects);
    } catch (error) {
        console.error("getProjectByOrg Hatası:", error);
        res.status(500).json({ error: "Projeler yüklenirken bir hata oluştu." });
    }
};

exports.deleteProject = async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const { projectId } = req.params;

    try {
        const project = await prisma.project.findUnique({
            where: {
                id: projectId
            }
        });

        if (!project) {
            return res.status(404).json({ error: "Proje Bulunamadı." });
        }

        if (userId !== project.ownerId) {
            return res.status(403).json({ error: "Proje silme yetkini yok." });
        }

        await prisma.project.delete({
            where: {
                id: projectId
            }
        });

        res.status(200).json({ message: "Proje başarıyla silindi." });
    } catch (error) {
        console.log("deleteProject Hatası: ", error);
        res.status(500).json({ error: "Proje silinirken bir hata oluştu." });
    }
};

exports.getProjectBoard = async (req, res) => {
    const { projectId } = req.params;
    const userId = req.user.id || req.user.userId;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            select: {
                ownerId: true,
                orgId: true
            }
        });

        if (!project) return res.status(404).json({ error: "Proje bulunamadı." });

        const isProjectMember = await prisma.user_Project.findUnique({
            where: { userId_projectId: { userId, projectId } }
        });

        const isOrgMember = project.orgId ? await prisma.user_Organization.findUnique({
            where: { userId_organizationId: { userId, organizationId: project.orgId } }
        }) : null;

        if (project.ownerId !== userId && !isProjectMember && !isOrgMember) {
            return res.status(403).json({ error: "Bu projenin panosuna erişim yetkiniz yok." });
        }

        const projectBoard = await prisma.project.findUnique({
            where: { id: projectId },
            include: {
                columns: {
                    orderBy: { order: "asc" },
                    include: {
                        tasks: {
                            orderBy: { order: "asc" },
                            include: { assignee: { select: { name: true, email: true } } }
                        }
                    }
                }
            }
        });

        res.json(projectBoard);
    } catch (error) {
        res.status(500).json({ error: "Sunucu hatası oluştu." });
    }
};

exports.updateTaskPosition = async (req, res) => {
    const { taskId } = req.params;
    const { columnId } = req.body;

    try {
        const updatedTask = await prisma.task.update({
            where: { id: taskId },
            data: {
                columnId: columnId
            }
        });

        res.status(200).json({
            message: "Görev başarıyla taşındı.",
            task: updatedTask
        });
    } catch (error) {
        console.error("updateTaskPosition Hatası:", error);
        res.status(500).json({ error: "Görev taşınırken bir hata oluştu." });
    }
};

exports.inviteMember = async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const { projectId } = req.params;
    const { assigneeId } = req.body;

    try {
        const project = await prisma.project.findUnique({
            where: { id: projectId },
            include: { organization: true }
        });

        if (!project) {
            return res.status(404).json({ error: "Proje bulunamadı." });
        }

        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: "Giriş yapmalısınız." });
        }

        if (userId !== project.ownerId) {
            return res.status(403).json({ error: "Projeye üye ekleme yetkiniz yok." });
        }

        if (userId === assigneeId) {
            return res.status(400).json({ error: "Kendinizi davet edemezsiniz." });
        }

        const projectMember = await prisma.user_Project.findUnique({
            where: {
                userId_projectId: {
                    userId: assigneeId,
                    projectId: project.id
                }
            }
        });

        if (projectMember) {
            return res.status(403).json({ error: "Üye zaten bu projeye dahil." });
        }

        const newMember = await prisma.user_Project.create({
            data: {
                userId: assigneeId,
                projectId: project.id
            }
        });

        const notific = await prisma.notification.create({
            data: {
                userId: assigneeId,
                organizationId: project.organization?.id || null,
                title: "Proje Eklemesi",
                message: `${user.name} sizi ${project.title} projesine ekledi.`,
                type: "PROJECT"
            }
        });

        return res.status(200).json({
            message: "Üye başarıyla projeye eklendi.",
            member: newMember,
            notification: notific
        });
    } catch (error) {
        console.error("inviteMember hatası:", error);
        return res.status(500).json({ error: "Üye eklenirken sunucu hatası oluştu." });
    }
};

exports.getProjectByUser = async (req, res) => {
    const userId = req.user.userId || req.user.id;

    try {
        const user = await prisma.user.findUnique({ where: { id: userId } });

        if (!user) {
            return res.status(404).json({ error: "Kullanıcı bulunamadı." });
        }

        const user_projects = await prisma.user_Project.findMany({
            where: { userId: userId },
            include: {
                project: {
                    select: {
                        id: true,
                        title: true,
                        description: true,
                        members: {
                            select: {
                                user: {
                                    select: { id: true, name: true, email: true }
                                }
                            }
                        },
                        organization: {
                            select: { id: true, name: true }
                        }
                    }
                }
            }
        });

        const projects = user_projects.map((m) => {
            const p = m.project;
            return {
                id: p.id,
                title: p.title,
                description: p.description,
                organization: p.organization,
                members: p.members.map((me) => ({
                    id: me.user.id,
                    name: me.user.name,
                    email: me.user.email
                }))
            };
        });

        return res.status(200).json({
            message: "Projeler başarıyla getirildi.",
            projects: projects
        });
    } catch (error) {
        console.error("getProjectByUser Hatası: ", error);
        return res.status(500).json({ error: "Projeler getirilirken sunucu taraflı bir hata oluştu." });
    }
};