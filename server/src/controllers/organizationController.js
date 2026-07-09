const {PrismaClient} = require("@prisma/client");
const { join } = require("@prisma/client/runtime/library");
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

        await prisma.organization.delete({
            where: {
                id: orgId
            }
        });

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

    try{

        const inviter = await prisma.user.findUnique({
            where: {id: inviterId}
        });

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

        const members = await prisma.user_Organization.findMany({
            where: {organizationId: orgId},
            include:{
                user: true
            }
        });

        const uniqueMembers = Array.from(new Map(members.map(m => [m.user.id, m])).values());

        const formattedMembers = uniqueMembers.map(m => ({
            id: m.user.id,
            name: m.user.name,
            email: m.user.email,
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