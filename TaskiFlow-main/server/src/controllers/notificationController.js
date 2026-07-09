const {PrismaClient} = require("@prisma/client");
const prisma = new PrismaClient();
const jwt = require("jsonwebtoken");

exports.getNotifications = async (req, res) =>{
    const userId = req.user.id || req.user.userId;

    try{

        const notifications = await prisma.notification.findMany({
            where: {
                userId,
                isRead: false
            },
            include: {
                organization: {
                    select: {
                        name: true
                    }
                }
            },
            orderBy: {
                createdAt: 'desc'
            }
        });
        res.json(notifications);

    } catch(error){
        console.log("Bildirim Hatası: ",error)
        res.status(500).json({
            error: error.message
        });
    }
}

exports.respondToInvıte = async (req, res) => {
    const {notificationId, action} = req.body;
    const currentUserId = req.user.id || req.user.userId;

    try{
        const invitation = await prisma.notification.findUnique({
            where: {id: notificationId},
        });

        if(!invitation || invitation.type !== "INVITE"){
            return res.status(404).json({ error: "Geçerli bir davet kaydı bulunamadı." });
        }

        if(action === "ACCEPT"){
            await prisma.$transaction(async (tx) => {
                const isAlreadyMember = await tx.user_Organization.findUnique({
                    where: {
                        userId_organizationId:{
                            userId: currentUserId,
                            organizationId: invitation.organizationId
                        }
                    }
                });

                if(!isAlreadyMember){
                    await tx.user_Organization.create({
                        data: {
                            userId: currentUserId,
                            organizationId: invitation.organizationId,
                            role: "MEMBER"
                        }
                    });
                }

                await tx.notification.delete({
                    where: { id: notificationId }
                });
            });

        }else if (action === "REJECT"){
            await prisma.notification.delete({
                where: { id: notificationId }
            });
        }


        return res.json({
            message: action === "ACCEPT" ? "Başarıyla ekibe katıldınız!" : "Davet reddedildi.",
        });
    }catch(error){
        console.error("respondToInvıte", error);
        res.status(500).json({ error: "Davet yanıtlanırken bir sunucu hatası oluştu." });
    }
};

exports.markAsRead = async (req, res) => {
  try {
    await prisma.notification.update({
      where: { id: req.params.id },
      data: { isRead: true }
    });
    res.json({ message: "Okundu işaretlendi." });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};