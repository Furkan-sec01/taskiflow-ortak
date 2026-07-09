const { PrismaClient } = require("@prisma/client");
const Iyzipay = require("iyzipay");

const prisma = new PrismaClient();

const iyzipay = new Iyzipay({
  apiKey: process.env.IYZICO_API_KEY,
  secretKey: process.env.IYZICO_SECRET_KEY,
  uri: process.env.IYZICO_BASE_URL,
});

const getUserId = (req) => {
  return req.user?.id || req.user?.userId;
};

const planPrices = {
  FREE: 0,
  PRO: 99,
  BUSINESS: 499,
};

const getPlanFromAmount = (amount) => {
  const val = Number(amount);
  if (val >= 99 && val < 200) return "PRO";
  if (val >= 499) return "BUSINESS";
  return "FREE";
};

const expireOldPendingPayments = async (userId = null) => {
  const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);

  await prisma.payment.updateMany({
    where: {
      status: "PENDING",
      createdAt: {
        lt: tenMinutesAgo,
      },
      ...(userId ? { userId } : {}),
    },
    data: {
      status: "FAILED",
    },
  });
};

const getBillingOverview = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    await expireOldPendingPayments(userId);

    let subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    if (!subscription) {
      return res.json({
        subscription: {
          plan: "FREE",
        },
        billingProfile: null,
        payments: [],
      });
    }

    const billingProfile = await prisma.billingProfile.findUnique({
      where: { userId },
    });

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json({
      subscription,
      billingProfile,
      payments,
    });
  } catch (error) {
    console.error("Billing overview hatası:", error);
    return res.status(500).json({ message: "Ödeme bilgileri alınamadı." });
  }
};

const updateBillingProfile = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    const {
      fullName,
      companyName,
      taxNumber,
      taxOffice,
      address,
      city,
      country,
    } = req.body;

    const billingProfile = await prisma.billingProfile.upsert({
      where: { userId },
      update: {
        fullName,
        companyName,
        taxNumber,
        taxOffice,
        address,
        city,
        country,
      },
      create: {
        userId,
        fullName,
        companyName,
        taxNumber,
        taxOffice,
        address,
        city,
        country,
      },
    });

    return res.json({
      message: "Fatura bilgileri güncellendi.",
      billingProfile,
    });
  } catch (error) {
    console.error("Fatura profili güncelleme hatası:", error);
    return res.status(500).json({ message: "Fatura bilgileri güncellenemedi." });
  }
};

const changeSubscriptionPlan = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    const { plan } = req.body;

    const allowedPlans = ["FREE", "PRO", "BUSINESS"];

    if (!allowedPlans.includes(plan)) {
      return res.status(400).json({ message: "Geçersiz plan seçimi." });
    }

    if (plan !== "FREE") {
      return res.status(400).json({
        message: "Ücretli planlar için 3D Secure ödeme başlatılmalıdır.",
      });
    }

    const existingSub = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    let subscription;

    if (existingSub) {
      subscription = await prisma.subscription.update({
        where: { id: existingSub.id },
        data: {
          plan: "FREE",
          status: "ACTIVE",
          endDate: null,
        },
      });
    } else {
      subscription = await prisma.subscription.create({
        data: {
          userId,
          plan: "FREE",
          status: "ACTIVE",
        },
      });
    }

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: 0,
        currency: "TRY",
        status: "PAID",
        provider: "manual",
        description: "FREE plan aboneliği",
      },
    });

    return res.json({
      message: "Ücretsiz plan aktifleştirildi.",
      subscription,
      payment,
    });
  } catch (error) {
    console.error("Plan değiştirme hatası:", error);
    return res.status(500).json({ message: "Plan değiştirilemedi." });
  }
};

const initialize3DSPayment = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    const { plan, card, email } = req.body;

    if (!["PRO", "BUSINESS"].includes(plan)) {
      return res.status(400).json({ message: "3D ödeme sadece ücretli planlar için başlatılır." });
    }

    const price = planPrices[plan];

    if (!price || price <= 0) {
      return res.status(400).json({ message: "Geçersiz plan fiyatı." });
    }

    if (!card?.name || !card?.number || !card?.expMonth || !card?.expYear || !card?.cvc) {
      return res.status(400).json({ message: "Kart bilgileri eksik." });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        location: true,
      },
    });

    if (!user) {
      return res.status(404).json({ message: "Kullanıcı bulunamadı." });
    }

    const paymentRecord = await prisma.payment.create({
      data: {
        userId,
        amount: price,
        currency: "TRY",
        status: "PENDING",
        provider: "iyzico",
        conversationId: "",
        description: `${plan} plan aboneliği`,
        plan: plan,
      },
    });

    await prisma.payment.update({
      where: { id: paymentRecord.id },
      data: {
        conversationId: paymentRecord.id,
      },
    });

    const buyerNameParts = (user.name || card.name || "Test User").trim().split(" ");
    const buyerName = buyerNameParts[0] || "Test";
    const buyerSurname = buyerNameParts.slice(1).join(" ") || "User";

    const request = {
      locale: Iyzipay.LOCALE.TR,
      conversationId: paymentRecord.id,
      price: price.toString(),
      paidPrice: price.toString(),
      currency: Iyzipay.CURRENCY.TRY,
      installment: "1",
      basketId: paymentRecord.id,
      paymentChannel: Iyzipay.PAYMENT_CHANNEL.WEB,
      paymentGroup: Iyzipay.PAYMENT_GROUP.PRODUCT,
      callbackUrl: process.env.IYZICO_CALLBACK_URL,

      paymentCard: {
        cardHolderName: card.name,
        cardNumber: card.number,
        expireMonth: card.expMonth,
        expireYear: card.expYear,
        cvc: card.cvc,
        registerCard: "0",
      },

      buyer: {
        id: user.id,
        name: buyerName,
        surname: buyerSurname,
        gsmNumber: user.phone || "+905350000000",
        email: email || user.email || "test@test.com",
        identityNumber: "11111111111",
        lastLoginDate: "2026-04-24 12:00:00",
        registrationDate: "2026-04-24 12:00:00",
        registrationAddress: user.location || "Istanbul",
        ip: req.ip || "85.34.78.112",
        city: "Istanbul",
        country: "Turkey",
        zipCode: "34000",
      },

      shippingAddress: {
        contactName: `${buyerName} ${buyerSurname}`,
        city: "Istanbul",
        country: "Turkey",
        address: "TaskiFlow Dijital Hizmet",
        zipCode: "34000",
      },

      billingAddress: {
        contactName: `${buyerName} ${buyerSurname}`,
        city: "Istanbul",
        country: "Turkey",
        address: "TaskiFlow Dijital Hizmet",
        zipCode: "34000",
      },

      basketItems: [
        {
          id: paymentRecord.id,
          name: `${plan} Plan Aboneliği`,
          category1: "Subscription",
          category2: "SaaS",
          itemType: Iyzipay.BASKET_ITEM_TYPE.VIRTUAL,
          price: price.toString(),
        },
      ],
    };

    console.log("IYZICO 3DS INIT REQUEST:", {
      conversationId: request.conversationId,
      plan,
      price,
      email: request.buyer.email,
      callbackUrl: request.callbackUrl,
    });

    iyzipay.threedsInitialize.create(request, async (err, result) => {
      console.log("IYZICO INIT ERR:", err);
      console.log("IYZICO INIT RESULT:", result);

      if (err) {
        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: { status: "FAILED" },
        });

        return res.status(500).json({
          message: "iyzico bağlantı hatası.",
          error: err,
        });
      }

      if (!result || result.status !== "success") {
        await prisma.payment.update({
          where: { id: paymentRecord.id },
          data: { status: "FAILED" },
        });

        return res.status(400).json({
          message: result?.errorMessage || "3D Secure ödeme başlatılamadı.",
          iyzicoResult: result,
        });
      }

      const decodedHtml = Buffer.from(result.threeDSHtmlContent, "base64").toString("utf8");

      return res.json({
        message: "3D Secure ödeme başlatıldı.",
        paymentId: paymentRecord.id,
        conversationId: paymentRecord.id,
        htmlContent: decodedHtml,
      });
    });
  } catch (error) {
    console.error("3D ödeme başlatma hatası:", error);
    return res.status(500).json({ message: "Ödeme başlatılamadı." });
  }
};

const complete3DSPayment = async (req, res) => {
  try {
    console.log("IYZICO CALLBACK BODY:", req.body);

    const { conversationId, paymentId, conversationData, status } = req.body;

    if (!conversationId || !paymentId) {
      return res.status(400).send("Eksik callback bilgisi.");
    }

    const payment = await prisma.payment.findUnique({
      where: { id: conversationId },
    });

    if (!payment) {
      return res.status(404).send("Payment not found");
    }

    if (status !== "success") {
      await prisma.payment.update({
        where: { id: conversationId },
        data: {
          status: "FAILED",
          iyzicoPaymentId: paymentId,
        },
      });

      return res.send("Ödeme doğrulaması başarısız.");
    }

    const authRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      paymentId,
      conversationData,
    };

    iyzipay.threedsPayment.create(authRequest, async (err, result) => {
      console.log("IYZICO AUTH ERR:", err);
      console.log("IYZICO AUTH RESULT:", result);

      if (err || !result || result.status !== "success") {
        await prisma.payment.update({
          where: { id: conversationId },
          data: {
            status: "FAILED",
            iyzicoPaymentId: paymentId,
          },
        });

        return res.send("Ödeme tamamlanamadı.");
      }

      await prisma.payment.update({
        where: { id: conversationId },
        data: {
          status: "PAID",
          iyzicoPaymentId: paymentId,
        },
      });

      const existingSub = await prisma.subscription.findFirst({
        where: { userId: payment.userId },
        orderBy: { createdAt: "desc" },
      });

      console.log("PLAN:", payment.plan);

      if (existingSub) {
        await prisma.subscription.update({
          where: { id: existingSub.id },
          data: {
            
            
            plan: payment.plan || getPlanFromAmount(payment.amount),
            status: "ACTIVE",
            endDate: null,
          },
        });
      } else {
        await prisma.subscription.create({
          data: {
            userId: payment.userId,
            plan: payment.plan || getPlanFromAmount(payment.amount),
            status: "ACTIVE",
          },
        });
      }

      return res.send("OK");
    });
  } catch (error) {
    console.error("3D ödeme tamamlama hatası:", error);
    return res.status(500).send("ERROR");
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    const subscription = await prisma.subscription.findFirst({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    if (!subscription) {
      return res.status(404).json({ message: "Abonelik bulunamadı." });
    }

    const updatedSubscription = await prisma.subscription.update({
      where: { id: subscription.id },
      data: {
        plan: "FREE",
        status: "CANCELED",
        endDate: new Date(),
      },
    });

    const payment = await prisma.payment.create({
      data: {
        userId,
        amount: 0,
        currency: "TRY",
        status: "PAID",
        provider: "manual",
        description: "Abonelik iptal edildi. FREE plana geçildi.",
      },
    });

    return res.json({
      message: "Abonelik iptal edildi. Ücretsiz plana geçildi.",
      subscription: updatedSubscription,
      payment,
    });
  } catch (error) {
    console.error("Abonelik iptal hatası:", error);
    return res.status(500).json({ message: "Abonelik iptal edilemedi." });
  }
};

const getPaymentHistory = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res.status(401).json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    await expireOldPendingPayments(userId);

    const payments = await prisma.payment.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
    });

    return res.json(payments);
  } catch (error) {
    console.error("Ödeme geçmişi hatası:", error);
    return res.status(500).json({ message: "Ödeme geçmişi alınamadı." });
  }
};

module.exports = {
  getBillingOverview,
  updateBillingProfile,
  changeSubscriptionPlan,
  getPaymentHistory,
  initialize3DSPayment,
  complete3DSPayment,
  cancelSubscription,
};