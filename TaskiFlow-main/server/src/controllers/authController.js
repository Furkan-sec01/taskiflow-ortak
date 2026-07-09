const {PrismaClient} = require("@prisma/client");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET;

//kayıt ol
exports.register = async (req, res) => {
  const { email, password, name } = req.body;

  try {
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

    const {password: _, ...userData} = result.user;
    res.status(201).json({ message: "Kayıt Başarılı", token, user: userData });

  } catch (error) {
    console.error("Register Error:", error);
    res.status(500).json({ error: "Kayıt işlemi başarısız oldu." });
  }
};


//login
exports.login = async (req,res) => {
  const {email, password} = req.body;

  try{
    const user= await prisma.user.findUnique({
      where: {email},
      include:  {
        organizations: {
          select: {
            organizationId: true,
            organization: true,
            role: true
          }
        }
      }
    });


    if(!user) return await res.status(404).json({error: "Kullanıcı Yok."});

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) return res.status(401).json({ error: "Şifre yanlış." });

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

    const {password: _, ...userData} = user;
    res.json({ message: "Giriş Başarılı", token, user: userData, userOrganizations: user.organizations });

  }catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ error: "Sunucu hatası" });
  }
}