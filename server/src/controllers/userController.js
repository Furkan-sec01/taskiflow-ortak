const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();
const bcrypt = require("bcryptjs");
const path = require("path");
const fs = require("fs");

exports.getMe = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const user = await prisma.user.findUnique({
  where: { id: userId },
  select: {
    id: true,
    name: true,
    email: true,
    username: true,
    avatarUrl: true,
    notificationEnabled: true,
    phone: true,
    bio: true,
    department: true,
    profileRole: true,
    location: true,
    status: true,
    createdAt: true,

    organizations: {
      select: {
        role: true,
        organization: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    },

    subscriptions: {
      orderBy: {
        createdAt: "desc",
      },
      take: 1,
      select: {
        plan: true,
        status: true,
      },
    },

    notifications: {
      orderBy: {
        createdAt: "desc",
      },
      take: 10,
      select: {
        id: true,
        title: true,
        message: true,
        createdAt: true,
      },
    },
  },
});

    // Bu kontrol eskiden istatistiklerin ALTINDAYDI, yani user null geldiğinde
    // (silinmiş kullanıcı + hâlâ geçerli token) aşağıdaki organizations[0]
    // erişimi 500 ile patlıyor, buraya hiç gelinmiyordu.
    if (!user) {
      return res.status(404).json({
        error: "Kullanıcı bulunamadı.",
      });
    }

    // 🔥 İSTATİSTİKLER
    const primaryOrgId = user.organizations[0]?.organization.id;

    // organizationId undefined ile count çağrılırsa Prisma filtreyi tamamen
    // yok sayar ve VERİTABANINDAKİ TÜM üyelikleri sayar. Ekibi olmayan
    // kullanıcıya "312 ekip arkadaşı" yazmamak için önce kontrol ediyoruz.
    const teamMemberCount = primaryOrgId
      ? await prisma.user_Organization.count({
          where: { organizationId: primaryOrgId },
        })
      : 0;

    const projectCount = await prisma.project.count({
      where: {
        OR: [
          { ownerId: userId },
          {
            members: {
              some: { userId },
            },
          },
        ],
      },
    });

    const taskCount = await prisma.task.count({
      where: {
        OR: [
          { ownerId: userId },
          { assigneeId: userId },
        ],
      },
    });

    const completedTaskCount = await prisma.task.count({
      where: {
        isCompleted: true,
        OR: [
          { ownerId: userId },
          { assigneeId: userId },
        ],
      },
    });
const formattedUser = {
  ...user,

  myOrganizations: user.organizations.map((o) => ({
    id: o.organization.id,
    name: o.organization.name,
    role: o.role,
  })),

  role: user.organizations.find(o => o.role === "OWNER")?.role
        || user.organizations[0]?.role
        || "MEMBER",

  plan: user.subscriptions[0]?.plan || "FREE",

  subscriptionStatus: user.subscriptions.length
  ? user.subscriptions[0].status
  : "INACTIVE",
};

 return res.json({
  ...formattedUser,

  stats: {
    projectCount,
    taskCount,
    completedTaskCount,
    teamMemberCount,
  },
});
       

  } catch (error) {
    console.error("GetMe Hatası:", error);
    return res
      .status(500)
      .json({ error: "Kullanıcı bilgileri alınırken hata oluştu." });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const {
      name,
      email,
      username,
      phone,
      bio,
      department,
      profileRole,
      notificationEnabled,
      location,
    } = req.body;

    if (typeof name !== "string" || name.trim().length < 2) {
      return res
        .status(400)
        .json({ error: "İsim en az 2 karakter olmalıdır." });
    }

    if (typeof email !== "string" || !email.trim()) {
      return res.status(400).json({ error: "E-posta boş olamaz." });
    }

    if (username !== undefined && typeof username !== "string") {
      return res.status(400).json({ error: "Kullanıcı adı metin olmalıdır." });
    }

    if (phone !== undefined && typeof phone !== "string") {
      return res.status(400).json({ error: "Telefon metin olmalıdır." });
    }

    if (bio !== undefined && typeof bio !== "string") {
      return res.status(400).json({ error: "Biyografi metin olmalıdır." });
    }

    if (department !== undefined && typeof department !== "string") {
      return res.status(400).json({ error: "Departman metin olmalıdır." });
    }
    if (profileRole !== undefined && typeof profileRole !== "string") {
      return res.status(400).json({ error: "Rol metin olmalıdır." });
    }

    if (location !== undefined && typeof location !== "string") {
      return res.status(400).json({ error: "Konum metin olmalıdır." });
    }
    if (notificationEnabled !== undefined &&typeof notificationEnabled !== "boolean") {
      return res.status(400).json({ error: "Bildirim ayarı boolean olmalıdır." });
    }

    const trimmedName = name.trim();
    const trimmedEmail = email.trim().toLowerCase();
    const trimmedUsername = typeof username === "string" ? username.trim() : "";
    const trimmedPhone = typeof phone === "string" ? phone.trim() : "";
    const trimmedBio = typeof bio === "string" ? bio.trim() : "";
    const trimmedDepartment =
      typeof department === "string" ? department.trim() : "";
    const trimmedProfileRole =
      typeof profileRole === "string" ? profileRole.trim() : "";
    const trimmedLocation =
      typeof location === "string" ? location.trim() : "";

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailRegex.test(trimmedEmail)) {
      return res.status(400).json({ error: "Geçerli bir e-posta giriniz." });
    }

    if (trimmedUsername && trimmedUsername.length < 3) {
      return res
        .status(400)
        .json({ error: "Kullanıcı adı en az 3 karakter olmalıdır." });
    }

    const existingEmailUser = await prisma.user.findFirst({
      where: {
        email: trimmedEmail,
        NOT: {
          id: userId,
        },
      },
    });

    if (existingEmailUser) {
      return res.status(400).json({
        error: "Bu e-posta başka bir kullanıcı tarafından kullanılıyor.",
      });
    }

    if (trimmedUsername) {
      const existingUsernameUser = await prisma.user.findFirst({
        where: {
          username: trimmedUsername,
          NOT: {
            id: userId,
          },
        },
      });

      if (existingUsernameUser) {
        return res.status(400).json({
          error: "Bu kullanıcı adı başka bir kullanıcı tarafından kullanılıyor.",
        });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        name: trimmedName,
        email: trimmedEmail,
        username: trimmedUsername || null,
        phone: trimmedPhone || null,
        bio: trimmedBio || null,
        department: trimmedDepartment || null,
        profileRole: trimmedProfileRole || null,
        location: trimmedLocation || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        username: true,
        avatarUrl: true,
        phone: true,
        bio: true,
        department: true,
        profileRole: true,
        location: true,
        status: true,
        createdAt: true,
      },
    });

    return res.json({
      message: "Profiliniz başarıyla güncellendi.",
      user: updatedUser,
    });
  } catch (error) {
    console.error("UpdateProfile Hatası:", error);

    if (error?.code === "P2025") {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    if (error?.code === "P2002") {
      return res.status(400).json({
        error: "Bu bilgiler başka bir kullanıcı tarafından kullanılıyor.",
      });
    }

    return res
      .status(500)
      .json({ error: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const { currentPassword, newPassword, confirmPassword } = req.body;

    if (
      typeof currentPassword !== "string" ||
      typeof newPassword !== "string" ||
      typeof confirmPassword !== "string"
    ) {
      return res.status(400).json({ error: "Tüm alanlar zorunludur." });
    }

    const currentPasswordTrimmed = currentPassword.trim();
    const newPasswordTrimmed = newPassword.trim();
    const confirmPasswordTrimmed = confirmPassword.trim();

    if (
      !currentPasswordTrimmed ||
      !newPasswordTrimmed ||
      !confirmPasswordTrimmed
    ) {
      return res.status(400).json({ error: "Tüm alanlar doldurulmalıdır." });
    }

    if (newPasswordTrimmed.length < 6) {
      return res
        .status(400)
        .json({ error: "Yeni şifre en az 6 karakter olmalıdır." });
    }

    if (newPasswordTrimmed !== confirmPasswordTrimmed) {
      return res.status(400).json({ error: "Yeni şifreler eşleşmiyor." });
    }

    const user = await prisma.user.findUnique({
 
      where: { id: userId },
      select: {
        id: true,
        email: true,
        password: true,
      },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ error: "Bu kullanıcı için şifre bilgisi bulunamadı." });
    }

    const isMatch = await bcrypt.compare(currentPasswordTrimmed, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Mevcut şifre yanlış." });
    }

    const sameAsOld = await bcrypt.compare(newPasswordTrimmed, user.password);

    if (sameAsOld) {
      return res
        .status(400)
        .json({ error: "Yeni şifre mevcut şifre ile aynı olamaz." });
    }

    const hashedPassword = await bcrypt.hash(newPasswordTrimmed, 10);

    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedPassword,
      },
    });

    return res.json({ message: "Şifre başarıyla güncellendi." });
  } catch (error) {
    console.error("ChangePassword Hatası:", error);
    return res
      .status(500)
      .json({ error: "Sunucu hatası. Lütfen daha sonra tekrar deneyin." });
  }

};
  
  exports.uploadAvatar = async (req, res) => {
    try {
      const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    if (!req.file) {
      return res.status(400).json({ error: "Resim dosyası bulunamadı." });
    }

    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { avatarUrl: true },
    });

    const avatarUrl = `/uploads/avatars/${req.file.filename}`;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { avatarUrl },
      select: { id: true, avatarUrl: true },
    });

    if (existingUser?.avatarUrl) {
      const oldFilePath = path.join(__dirname, "..", "..", existingUser.avatarUrl);
      fs.unlink(oldFilePath, () => {});
    }

    return res.json({
      message: "Profil fotoğrafı güncellendi.",
      avatarUrl: updatedUser.avatarUrl,
    });
  } catch (error) {
    console.error("UploadAvatar Hatası:", error);
    return res.status(500).json({ error: "Fotoğraf yüklenirken bir hata oluştu." });
  }
};

/**
 * Hesabı kalıcı olarak siler.
 *
 * NEDEN BU KADAR UZUN: prisma.user.delete() tek başına ÇALIŞMAZ. Şemada
 * User'a bakan iki zorunlu ilişki var ve ikisinde de onDelete tanımlı değil,
 * yani Prisma varsayılanı Restrict:
 *   - Project.owner    (proje sahibi olan kullanıcı silinemez)
 *   - Document.uploader (dosya yüklemiş kullanıcı silinemez)
 * Bunlar önce temizlenmezse silme P2003 ile patlar - ki pratikte her
 * kullanıcı en az bir projeye ya da dosyaya sahip olur.
 *
 * Ayrıca Organization.ownerId düz bir String; User'a giden bir @relation
 * DEĞİL. Yani kullanıcı silinince veritabanı hiçbir uyarı vermez ama ekip
 * sahipsiz kalır. deleteOrg "userId !== org.ownerId" kontrolü yaptığı için o
 * ekip bir daha KİMSE tarafından silinemez. Bu yüzden sahip olunan ekipleri
 * burada elle hallediyoruz.
 *
 * KURAL: başkasının emeğini silmiyoruz. Kullanıcı, içinde başka üye bulunan
 * bir ekibin ya da projenin sahibiyse silme 409 ile reddedilir; önce o
 * kayıtları devretmesi ya da silmesi gerekir.
 */
exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user?.userId || req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: "Yetkisiz erişim." });
    }

    const { password } = req.body;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, password: true, avatarUrl: true },
    });

    if (!user) {
      return res.status(404).json({ error: "Kullanıcı bulunamadı." });
    }

    // Geri alınamaz bir işlem: çalınmış bir token'ın hesabı silebilmesini
    // engellemek için mevcut şifre tekrar sorulur.
    if (typeof password !== "string" || !password) {
      return res.status(400).json({ error: "Hesabı silmek için şifrenizi girin." });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ error: "Bu hesap için şifre bilgisi bulunamadı." });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ error: "Şifre hatalı." });
    }

    // --- 1) Engel kontrolü: başka üyesi olan ekipler ve projeler ---

    const ownedOrganizations = await prisma.organization.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        name: true,
        _count: { select: { members: true } },
      },
    });

    const blockingOrganizations = ownedOrganizations
      .filter((org) => org._count.members > 1)
      .map((org) => ({
        id: org.id,
        name: org.name,
        memberCount: org._count.members,
      }));

    const ownedProjects = await prisma.project.findMany({
      where: { ownerId: userId },
      select: {
        id: true,
        title: true,
        members: { select: { userId: true } },
      },
    });

    const blockingProjects = ownedProjects
      .filter((project) =>
        project.members.some((member) => member.userId !== userId),
      )
      .map((project) => ({ id: project.id, title: project.title }));

    if (blockingOrganizations.length > 0 || blockingProjects.length > 0) {
      const parts = [];

      if (blockingOrganizations.length > 0) {
        parts.push(
          `içinde başka üyeler bulunan ekiplerin sahibisiniz: ${blockingOrganizations
            .map((o) => `"${o.name}"`)
            .join(", ")}`,
        );
      }

      if (blockingProjects.length > 0) {
        parts.push(
          `içinde başka üyeler bulunan projelerin sahibisiniz: ${blockingProjects
            .map((p) => `"${p.title}"`)
            .join(", ")}`,
        );
      }

      return res.status(409).json({
        error: `Hesabınızı silemiyoruz çünkü ${parts.join(
          " ve ",
        )}. Başkalarının çalışmasını silmemek için önce bunları devredin ya da silin.`,
        blockingOrganizations,
        blockingProjects,
      });
    }

    // --- 2) Diskten silinecek dosyaları topla ---
    // Kayıtlar gidince filePath'lere bir daha ulaşamayız, o yüzden önce
    // topluyoruz; asıl silme işlemi transaction başarılı olursa yapılır.

    const ownedOrgIds = ownedOrganizations.map((org) => org.id);

    const documentsToRemove = await prisma.document.findMany({
      where: {
        OR: [
          { uploaderId: userId },
          ...(ownedOrgIds.length > 0
            ? [
                { orgId: { in: ownedOrgIds } },
                // Silinen ekiplerin görevlerine BAŞKALARININ yüklediği ekler.
                // Bunların orgId'si null (taskId dolu) olduğu için üstteki
                // filtreye takılmıyor, ama ekiple birlikte cascade ile
                // siliniyorlar; dosyaları da gitmeli.
                { task: { project: { orgId: { in: ownedOrgIds } } } },
              ]
            : []),
          // Başkasının ekibinde açılmış ama bu kullanıcıya ait projelerin
          // görev ekleri (proje aşağıda siliniyor).
          { task: { project: { ownerId: userId } } },
        ],
      },
      select: { filePath: true },
    });

    // --- 3) Silme ---

    // Prisma'nın etkileşimli transaction varsayılanı 5 saniye. Buradaki
    // silme zinciri (ekipler -> projeler -> sütunlar -> görevler -> yorumlar
    // ve ekler) çok kayıtlı bir hesapta bunu rahatlıkla aşar ve hesap hiçbir
    // zaman silinemez hâle gelirdi.
    await prisma.$transaction(async (tx) => {
      // Sahip olunan ekipler: proje -> sütun -> görev ve belgeler veritabanı
      // seviyesinde cascade ile gider.
      if (ownedOrgIds.length > 0) {
        await tx.organization.deleteMany({
          where: { id: { in: ownedOrgIds } },
        });
      }

      // Başkasının ekibinde açılmış ama bu kullanıcıya ait projeler.
      // Project.owner zorunlu (Restrict) olduğu için kullanıcıdan önce gitmeli.
      await tx.project.deleteMany({ where: { ownerId: userId } });

      // Document.uploader da zorunlu (Restrict): kişisel belgeler ve
      // başkasının ekibine yüklenmiş dosyalar burada temizlenir.
      await tx.document.deleteMany({ where: { uploaderId: userId } });

      // Geri kalanı cascade: Session, Notification, Subscription, Payment,
      // BillingProfile, PersonalTask, User_Organization, User_Project.
      // Task.ownerId / assigneeId opsiyonel olduğu için null'a çekilir,
      // yani başkasının projesindeki görevler silinmez, sadece atamasız kalır.
      await tx.user.delete({ where: { id: userId } });
    }, {
      maxWait: 10000,
      timeout: 30000,
    });

    // --- 4) Diskteki dosyalar ---
    // Veritabanı işlemi bittikten sonra; burada bir hata olsa bile hesap
    // silinmiş olur, artakalan dosya veri sızıntısı değil sadece çöptür.

    for (const doc of documentsToRemove) {
      const fullPath = path.join(
        __dirname,
        "..",
        "..",
        doc.filePath.replace(/^\/uploads/, "uploads"),
      );
      fs.unlink(fullPath, () => {});
    }

    if (user.avatarUrl) {
      fs.unlink(path.join(__dirname, "..", "..", user.avatarUrl), () => {});
    }

    console.log(`Hesap silindi: ${userId}`);

    return res.json({ message: "Hesabınız kalıcı olarak silindi." });
  } catch (error) {
    console.error("DeleteAccount Hatası:", error);

    // Gözden kaçan bir Restrict ilişkisi kalırsa kullanıcıya "sunucu hatası"
    // yerine ne olduğunu söyleyelim.
    if (error?.code === "P2003" || error?.code === "P2014") {
      return res.status(409).json({
        error:
          "Hesabınıza bağlı bazı kayıtlar silinemedi. Lütfen destek ekibiyle iletişime geçin.",
      });
    }

    // P2028: transaction zaman aşımı. Hiçbir şey silinmedi (geri alındı),
    // dolayısıyla tekrar denemek güvenli.
    if (error?.code === "P2028") {
      return res.status(503).json({
        error:
          "Silme işlemi zaman aşımına uğradı ve hiçbir veri silinmedi. Lütfen birazdan tekrar deneyin.",
      });
    }

    return res
      .status(500)
      .json({ error: "Hesap silinirken bir hata oluştu. Lütfen tekrar deneyin." });
  }
};