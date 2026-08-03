const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const JWT_SECRET = process.env.JWT_SECRET;

//kayıt ol
exports.register = async (req, res) => {
  const { password, name } = req.body;
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  try {
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: "Geçerli bir e-posta adresi giriniz." });
    }

    if (typeof name !== "string" || name.trim().length < 2) {
      return res.status(400).json({ error: "İsim en az 2 karakter olmalıdır." });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ error: "Şifre en az 6 karakter olmalıdır." });
    }

    const user = await prisma.user.findUnique({
      where: {email}
    });

    if(user){
      res.status(400).json({
        error: "Mail adresi kullanımda."
      });

      return;
    }

    const hashedPassword = await bcrypt.hash(password,10);
    
    const result = await prisma.$transaction(async  (tx) => {

      //kullanıcı
      const newUser = await tx.user.create({
        data: {
          email,
          password: hashedPassword,
          name,
          status: "active"
        }
      });

      //kullanıcı org
      const newOrg = await tx.organization.create({
        data: {
          name: `${name}'s Workspace`,
          ownerId: newUser.id
        }
      });

      //ara tabloya yaz
      await tx.user_Organization.create({
        data: {
          userId: newUser.id,
          organizationId: newOrg.id,
          role: "OWNER"
        }
      });

      return {
        user: newUser,
        organization: newOrg
      };
    });

    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        organizationId: result.organization.id
      },
      JWT_SECRET,
      {expiresIn: '24h'}
    );

    const userAgent = req.headers["user-agent"] || "Bilinmeyen Cihaz";
    const isMobile = /mobile/i.test(userAgent);

    await prisma.session.create({
      data: {
        userId: result.user.id,
        token: token,
        deviceName: userAgent.slice(0, 100),
        deviceType: isMobile ? "mobile" : "web",
        ipAddress: req.ip,
      },
    });

    const {password: _, ...userData} = result.user;
    res.status(201).json({ message: "Kayıt Başarılı", token, user: userData });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Kayıt işlemi başarısız oldu." });
  }
};


//login
exports.login = async (req,res) => {
  const password = req.body.password;
  const email = typeof req.body.email === "string" ? req.body.email.trim().toLowerCase() : "";

  const invalidCredentials = () => res.status(401).json({ error: "E-posta veya şifre hatalı." });

  try{
    if (!email || typeof password !== "string" || !password) {
      return invalidCredentials();
    }

    const user= await prisma.user.findUnique({
      where: {email},
      include: {
        organizations: {
          select: {
            organizationId: true,
            organization: true,
            role: true
          }
        }
      }
    });

    // Kullanıcı bulunamadıysa da şifre yanlışmış gibi aynı mesajı dön 
    if(!user || !user.password) return invalidCredentials();

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return invalidCredentials();

    const activeOrgId = user.organizations.length > 0 ? user.organizations[0].organizationId : null;


    const token = jwt.sign(
      {
        userId:user.id,
        email: user.email,
        organizationId: activeOrgId
      },
      JWT_SECRET,
      {expiresIn: '24h'}
    );
    const userAgent = req.headers["user-agent"] || "Bilinmeyen Cihaz";
    const isMobile = /mobile/i.test(userAgent);

    await prisma.session.create({
      data: {
        userId: user.id,
        token: token,
        deviceName: userAgent.slice(0, 100),
        deviceType: isMobile ? "mobile" : "web",
        ipAddress: req.ip,
      },
    });
    const {password: _, ...userData} = user;
    res.json({ message: "Giriş Başarılı", token, user: userData, userOrganizations: user.organizations });

  }catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}
  //çıkış yap
exports.logout = async (req, res) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(400).json({ error: "Token bulunamadı." });
  }

  try {
    await prisma.session.deleteMany({ where: { token } });
    res.json({ message: "Çıkış yapıldı." });
  } catch (error) {
    console.error("Logout Error:", error);
    res.status(500).json({ error: "Çıkış işlemi başarısız oldu." });
  }
};