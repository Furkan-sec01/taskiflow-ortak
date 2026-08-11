const {PrismaClient} = require("@prisma/client");
const { collectDocumentPaths, removeFiles } = require("../utils/fileCleanup");
const prisma = new PrismaClient();


exports.createOrg = async (req, res)  => {
    const {name} = req.body;
    const userId = req.user.id || req.user.userId;

    if(!name){
        return res.status(400).json({ error: "Organizasyon adı zorunludur." });
    }

    try{
        const newOrganization = await prisma.$transaction(async (tx) => {
            const org = await tx.organization.create({
                data: {
                    name: name,
                    ownerId: userId
                },
            });

            await tx.user_Organization.create({
                data: {
                    userId: userId,
                    organizationId: org.id,
                    role: "OWNER"
                },
            });

            return org
        });

        res.status(201).json({
            message: "Organizasyon Başarıyla Kuruldu.",
            organization: newOrganization
        });
    }catch(error){
        console.error("CreateOrg Hatası:", error);
        res.status(500).json({ error: "Organizasyon oluşturulurken bir hata oluştu." });
    }

}

exports.deleteOrg = async (req, res) => {
    const userId = req.user.id || req.user.userId;
    const {orgId} = req.params;

    try{
        const org = await prisma.organization.findUnique({
            where: {
                id: orgId
            }
        });

        if(!org){
            res.status(404).json({
                error: "Organizasyon Bulunamadı."
            });
            return;
        }

        const owner = org.ownerId;
        if(userId !== owner){
            res.status(403).json({
                error: "Sadece ekip lideri ekibi silebilir."
            });

            return;
        }

        // Ekip silinince hem ekip belgeleri hem de ekibin projelerindeki
        // görev ekleri cascade ile gidiyor. İki grubu da diskten temizlemek
        // için yolları önce topluyoruz.
        const filePaths = await collectDocumentPaths(prisma, {
            OR: [
                { orgId },
                { task: { project: { orgId } } }
            ]
        });

        await prisma.organization.delete({
            where: {
                id: orgId
            }
        });

        removeFiles(filePaths);

        res.status(200).json({
            message: "Ekip başarıyla silindi."
        });

    }catch(error){
        res.status(500).json({
            error: "Sunucu Hatası."
        });

        console.log("deleteOrg Hatası",error);
    }
}


exports.inviteMember = async (req, res) => {
    const {email, orgId} = req.body;
    const inviterId = req.user.id || req.user.userId;

    if(!orgId){
        return res.status(400).json({ error: "orgId zorunludur." });
    }

    try{

        const inviter = await prisma.user.findUnique({
            where: {id: inviterId}
        });

        // 🔒 Davet edenin gerçekten bu organizasyona üye olup olmadığını doğrula
        const inviterMembership = await prisma.user_Organization.findUnique({
            where: {
                userId_organizationId: {
                    userId: inviterId,
                    organizationId: orgId
                }
            }
        });

        if(!inviterMembership){
            return res.status(403).json({ error: "Bu ekibe üye davet etme yetkiniz yok." });
        }

        // Sadece ekip sahibi (OWNER) yeni üye davet edebilsin
        if(inviterMembership.role !== "OWNER"){
            return res.status(403).json({ error: "Sadece ekip sahibi yeni üye davet edebilir." });
        }

        const targetUser = await prisma.user.findUnique({
            where: {email}
        });

        if(!targetUser){
            res.status(404).json({
                error: "Böyle bir kullanıcı yok. Kayıt olmasını isteyin."
            });

            return;
        }

        const existingMembership = await prisma.user_Organization.findUnique({
            where:{
                userId_organizationId: {
                    userId: targetUser.id,
                    organizationId: orgId
                }
            }
        });

        if(existingMembership){
            res.status(400).json({
                error:"Bu kullanıcı zaten bu ekibe üye."
            });

            return;
        }

        await prisma.notification.create({
            data: {
                userId: targetUser.id,
                organizationId: orgId,
                title: "Ekip Daveti",
                message: `${inviter.name} sizi bir ekibe davet etti.`,
                type: "INVITE"
            }
        });

        res.json({ message: "Davet bildirimi gönderildi." });
    }catch(error){
        console.log("inviteMember hatası: ",error);
        res.status(500).json({ error: "Davet hatası." });
    }
}


    
exports.getMembers = async (req , res) => {
    try{
        const {orgId} = req.params;
        const userId = req.user.id || req.user.userId;

        const requesterMembership = await prisma.user_Organization.findUnique({
            where: {
                userId_organizationId: {
                    userId: userId,
                    organizationId: orgId
                }
            }
        });

        if (!requesterMembership) {
            return res.status(403).json({ error: "Bu organizasyonun üye listesine erişim yetkiniz yok." });
        }

        const members = await prisma.user_Organization.findMany({
            where: {organizationId: orgId},
            include:{
                // include: { user: true } şifre dahil tüm kullanıcı alanlarını
                // çekiyordu; sadece ekranda kullanılanları seçiyoruz.
                user: {
                    select: {
                        id: true,
                        name: true,
                        email: true,
                        status: true
                    }
                }
            }
        });

        const uniqueMembers = Array.from(new Map(members.map(m => [m.user.id, m])).values());

        const formattedMembers = uniqueMembers.map(m => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
            // status eksikti; istemci "active" bekleyip undefined bulduğu için
            // bütün üyeleri "Pasif" gösteriyordu.
            status: m.user.status,
            role: m.role,
            joinedAt: m.joinedAt
        }));

        res.json(formattedMembers);


    }catch(error){
        console.log("GetMembers Hatası: ", error);
        res.status(500).json({ error: "Üye listesi alınırken bir hata oluştu." });
    }
}

exports.deleteMember = async (req, res) =>{
    const {memberId} = req.body;
    const userId = req.user.id || req.user.userId;
    const {orgId} = req.params;

    try{
        const requesterMembership = await prisma.user_Organization.findUnique({
            where: {
                userId_organizationId:{
                    userId: userId,
                    organizationId: orgId,
                }
                
            }
        });

        if(!requesterMembership || requesterMembership.role !== "OWNER"){
            return res.status(403).json({ error: "Bu işlem için yetkiniz yok. Sadece ekip sahipleri üye silebilir." });
        }

        if(memberId === userId){
            return res.status(400).json({ error: "Kendi üyeliğinizi buradan silemezsiniz. Lütfen 'Ekipten Ayrıl' seçeneğini kullanın." });
        }

        await prisma.user_Organization.delete({
            where: {
                userId_organizationId: {
                    userId: memberId,
                    organizationId: orgId
                }
            }
        });

        res.json({ message: "Üye başarıyla ekipten çıkarıldı." });


    }catch(error){
        console.error("DeleteMember Hatası:", error);
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "Üye bu organizasyonda bulunamadı." });
        }
        res.status(500).json({ error: "Üye silinirken bir sunucu hatası oluştu." });
    }
}

exports.leaveOrganization = async(req, res) => {
    const currentUserId = req.user.id || req.user.userId;
    const {orgId} = req.params;

    try{

        const requesterMembership = await prisma.user_Organization.findUnique({
            where: {
                userId_organizationId: {
                    userId: currentUserId,
                    organizationId: orgId
                }
            }
        });

        if(!requesterMembership || requesterMembership.role === "OWNER"){
            res.status(403).json({
                error: "Ekip yöneticisi ayrılamaz."
            });

            return;
        }

        await prisma.user_Organization.delete({
            where: {
                userId_organizationId:{
                    userId: currentUserId,
                    organizationId: orgId
                }
            }
        });

        res.json({
            message: "Ekipten Ayrıldınız."
        });

    }catch(error){
        console.log("leaveOrganization Hatası: ",error);
        res.status(500).json({
            error: "Ekipten Ayrılırken Hata Oluştu."
        });
    }
}

/**
 * Ekip sahipliğini başka bir üyeye devreder.
 *
 * NEDEN GEREKLİ: Sahiplik iki ayrı yerde tutuluyor - Organization.ownerId ve
 * User_Organization.role. İkisi birden güncellenmezse ekip tutarsız duruma
 * düşer. Ayrıca sahiplik devri olmadan ekip sahibi:
 *   - ekipten ayrılamıyor (leaveOrganization OWNER'ı reddediyor),
 *   - hesabını silemiyor (deleteAccount 409 dönüyor),
 * yani tek çıkışı ekibi tamamen silmek oluyordu.
 *
 * PROJELER: Varsayılan olarak devreden kişinin BU EKİPTEKİ projelerinin
 * sahipliği de yeni sahibe geçer. Aksi hâlde kişi ekibi devretse bile
 * projelere bağlı kaldığı için hâlâ ayrılamaz/hesabını silemez.
 * İstenmiyorsa gövdede transferProjects: false gönderilebilir.
 */
exports.transferOwnership = async (req, res) => {
    const { orgId } = req.params;
    const { newOwnerId, transferProjects = true } = req.body;
    const currentUserId = req.user.id || req.user.userId;

    if (!newOwnerId) {
        return res.status(400).json({ error: "Yeni sahip seçilmedi." });
    }

    try {
        const organization = await prisma.organization.findUnique({
            where: { id: orgId }
        });

        if (!organization) {
            return res.status(404).json({ error: "Ekip bulunamadı." });
        }

        // Yetki kontrolü, gövdedeki verinin doğrulanmasından ÖNCE gelir.
        // Aksi hâlde ekiple ilgisi olmayan biri kendini newOwnerId olarak
        // gönderdiğinde 403 yerine 400 alıyor ve isteğinin neden reddedildiği
        // konusunda yanıltıcı bilgi ediniyordu.
        if (organization.ownerId !== currentUserId) {
            return res.status(403).json({ error: "Sadece ekip sahibi sahipliği devredebilir." });
        }

        if (newOwnerId === currentUserId) {
            return res.status(400).json({ error: "Sahipliği kendinize devredemezsiniz." });
        }

        // Yeni sahip zaten ekibin üyesi olmalı. Aksi hâlde ekibe hiç ilgisi
        // olmayan birine sahiplik verilebilirdi.
        const newOwnerMembership = await prisma.user_Organization.findUnique({
            where: {
                userId_organizationId: {
                    userId: newOwnerId,
                    organizationId: orgId
                }
            },
            include: {
                user: { select: { id: true, name: true, email: true } }
            }
        });

        if (!newOwnerMembership) {
            return res.status(400).json({ error: "Yeni sahip bu ekibin üyesi olmalı." });
        }

        const currentUser = await prisma.user.findUnique({
            where: { id: currentUserId },
            select: { name: true }
        });

        let movedProjectCount = 0;

        await prisma.$transaction(async (tx) => {
            await tx.organization.update({
                where: { id: orgId },
                data: { ownerId: newOwnerId }
            });

            await tx.user_Organization.update({
                where: {
                    userId_organizationId: {
                        userId: newOwnerId,
                        organizationId: orgId
                    }
                },
                data: { role: "OWNER" }
            });

            // Eski sahip ekipte kalır, sadece rolü düşer.
            await tx.user_Organization.update({
                where: {
                    userId_organizationId: {
                        userId: currentUserId,
                        organizationId: orgId
                    }
                },
                data: { role: "MEMBER" }
            });

            if (transferProjects) {
                const result = await tx.project.updateMany({
                    where: { orgId: orgId, ownerId: currentUserId },
                    data: { ownerId: newOwnerId }
                });
                movedProjectCount = result.count;
            }

            await tx.notification.create({
                data: {
                    userId: newOwnerId,
                    organizationId: orgId,
                    title: "Ekip Sahipliği Devredildi",
                    message: `${currentUser?.name || "Bir kullanıcı"} size "${organization.name}" ekibinin sahipliğini devretti.`,
                    type: "ORGANIZATION"
                }
            });
        });

        return res.json({
            message: `Sahiplik ${newOwnerMembership.user.name || newOwnerMembership.user.email} kullanıcısına devredildi.`,
            organization: { id: orgId, name: organization.name, ownerId: newOwnerId },
            transferredProjectCount: movedProjectCount
        });
    } catch (error) {
        console.error("transferOwnership Hatası:", error);
        return res.status(500).json({ error: "Sahiplik devredilirken bir hata oluştu." });
    }
};

exports.getUserOrganizations = async (req, res) => {
  const userId = req.user.id || req.user.userId;

  try {
    const memberships = await prisma.user_Organization.findMany({
      where: { userId: userId },
      include: {
        organization: true 
      }
    });

    const organizations = memberships.map(m => ({
      id: m.organization.id,
      name: m.organization.name,
      role: m.role 
    }));

    res.json(organizations);
  } catch (error) {
    console.error("Liste Çekme Hatası:", error);
    res.status(500).json({ error: "Ekipleriniz yüklenirken bir hata oluştu." });
  }
};