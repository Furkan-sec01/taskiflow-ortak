const { PrismaClient } = require("@prisma/client");
const Iyzipay = require("iyzipay");
const {
  resolveIyzicoError,
  GENERIC_SYSTEM_MESSAGE,
} = require("../config/iyzicoErrors");

const prisma = new PrismaClient();

// iyzipay istemcisi modül yüklenirken kurulur ve eksik/boş bir env değişkeni
// varsa senkron olarak patlar ("uri cannot be empty"). Bu dosya server.js'in
// require zincirinde olduğu için, o hata tüm API'yi ayağa kalkmadan öldürürdü.
// Bu yüzden kurulumu try/catch'e alıyoruz: iyzico yapılandırılmamışsa sadece
// ödeme uçları 503 döner, uygulamanın geri kalanı çalışmaya devam eder.
const IYZICO_ENV_KEYS = [
  "IYZICO_API_KEY",
  "IYZICO_SECRET_KEY",
  "IYZICO_BASE_URL",
];

let iyzipay = null;
let iyzicoInitError = null;

const missingIyzicoEnv = IYZICO_ENV_KEYS.filter((key) => !process.env[key]);

if (missingIyzicoEnv.length > 0) {
  iyzicoInitError = `Eksik ortam değişkeni: ${missingIyzicoEnv.join(", ")}`;
} else {
  try {
    iyzipay = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY,
      secretKey: process.env.IYZICO_SECRET_KEY,
      uri: process.env.IYZICO_BASE_URL,
    });
  } catch (error) {
    iyzicoInitError = error.message;
  }
}

if (!iyzipay) {
  console.error(
    `[ÖDEME DEVRE DIŞI] iyzico istemcisi kurulamadı: ${iyzicoInitError}. ` +
      `Ödeme uçları 503 dönecek, sunucunun geri kalanı normal çalışıyor.`,
  );
}

// callbackUrl boşsa iyzico 3DS başlatmayı reddeder; bunu istekten önce
// yakalayıp anlaşılır bir hata dönmek, iyzico'dan gelen kriptik koddan iyidir.
const isPaymentConfigured = () =>
  Boolean(iyzipay) && Boolean(process.env.IYZICO_CALLBACK_URL);

const getUserId = (req) => {
  return req.user?.id || req.user?.userId;
};

const planPrices = {
  FREE: 0,
  PRO: 99,
  BUSINESS: 499,
};

// Kullanıcının kendi başına 3D Secure ile satın alabileceği planlar.
// BUSINESS listede DEĞİL: arayüzde "Özel fiyatlandırma" olarak sunulup
// /contact akışına yönlendiriliyor (bkz. client/src/config/plans.ts).
// Buraya eklenirse, ekranda "Özel" yazarken sunucu sessizce 499 TL çeker.
const PURCHASABLE_PLANS = ["PRO"];

// Tutardan plana geri dönüş. Sadece plan alanı boş olan ESKİ kayıtlar için
// yedek; yeni kayıtlarda payment.plan her zaman dolu.
const getPlanFromAmount = (amount) => {
  const val = Number(amount);
  if (val >= planPrices.BUSINESS) return "BUSINESS";
  if (val >= planPrices.PRO) return "PRO";
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

const expireOldSubscriptions = async (userId = null) => {
  const now = new Date();

  await prisma.subscription.updateMany({
    where: {
      status: "ACTIVE",
      endDate: {
        not: null,
        lt: now,
      },
      ...(userId ? { userId } : {}),
    },
    data: {
      status: "EXPIRED",
      plan: "FREE",
    },
  });
};

const getBillingOverview = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    await expireOldPendingPayments(userId);
    await expireOldSubscriptions(userId);

    const subscription = await prisma.subscription.findFirst({
      where: {
        userId,
        status: "ACTIVE",
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    // Fatura profili ve ödeme geçmişi aboneliğe bağlı DEĞİL. Eskiden abonelik
    // yoksa buradan boş liste dönülüyordu; aboneliği biten ya da iptal eden
    // kullanıcı geçmiş faturalarını hiç göremiyordu. Oysa geçmişi en çok
    // ihtiyaç duyan kullanıcı tam olarak o.
    const [billingProfile, payments] = await Promise.all([
      prisma.billingProfile.findUnique({ where: { userId } }),
      prisma.payment.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
      }),
    ]);

    return res.json({
      // Aktif abonelik yoksa kullanıcı ücretsiz plandadır.
      subscription: subscription || { plan: "FREE" },
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
      return res
        .status(401)
        .json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
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
    return res
      .status(500)
      .json({ message: "Fatura bilgileri güncellenemedi." });
  }
};

const changeSubscriptionPlan = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
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
      return res
        .status(401)
        .json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    if (!isPaymentConfigured()) {
      console.error(
        "3DS başlatma reddedildi: iyzico yapılandırması eksik.",
        iyzicoInitError || "IYZICO_CALLBACK_URL tanımlı değil.",
      );

      return res.status(503).json({
        message:
          "Ödeme altyapısı şu anda kullanılamıyor. Lütfen daha sonra tekrar deneyin.",
      });
    }

    const { plan, card, email } = req.body;

    if (!PURCHASABLE_PLANS.includes(plan)) {
      return res.status(400).json({
        message:
          "Bu plan online satın alınamaz. Lütfen satış ekibimizle iletişime geçin.",
      });
    }

    const price = planPrices[plan];

    if (!price || price <= 0) {
      return res.status(400).json({ message: "Geçersiz plan fiyatı." });
    }

    if (
      !card?.name ||
      !card?.number ||
      !card?.expMonth ||
      !card?.expYear ||
      !card?.cvc
    ) {
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

    const buyerNameParts = (user.name || card.name || "Test User")
      .trim()
      .split(" ");
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

    // DİKKAT: Bu callback, dıştaki try/catch bloğu return ettikten SONRA
    // çalışır. Yani buradan fırlayan bir hatayı dıştaki catch yakalayamaz;
    // yakalanmazsa unhandled rejection olur ve istemciye hiç yanıt gitmez
    // (istek zaman aşımına kadar asılı kalır). Bu yüzden callback'in tamamı
    // kendi try/catch'i içinde.
    iyzipay.threedsInitialize.create(request, async (err, result) => {
      try {
        if (err || !result || result.status !== "success") {
          const failure = resolveIyzicoError(result, err);

          // Teknik detay sadece logda kalır; istemciye sızdırmıyoruz.
          console.error("IYZICO INIT FAILED:", {
            paymentId: paymentRecord.id,
            audience: failure.audience,
            code: failure.code,
            group: failure.group,
            providerMessage: failure.providerMessage,
          });

          await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: { status: "FAILED" },
          });

          // Kart/banka kaynaklı hatalar 400, bizim taraf 502.
          const httpStatus = failure.audience === "USER" ? 400 : 502;

          return res.status(httpStatus).json({
            message: failure.userMessage,
            errorCode: failure.code,
          });
        }

        // status "success" olsa bile bu alan boş gelebilir; Buffer.from(undefined)
        // fırlatır. Kontrol etmezsek yukarıdaki senaryonun aynısına düşeriz.
        if (!result.threeDSHtmlContent) {
          console.error("IYZICO INIT: threeDSHtmlContent boş.", {
            paymentId: paymentRecord.id,
          });

          await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: { status: "FAILED" },
          });

          return res.status(502).json({
            message: GENERIC_SYSTEM_MESSAGE,
          });
        }

        const decodedHtml = Buffer.from(
          result.threeDSHtmlContent,
          "base64",
        ).toString("utf8");

        return res.json({
          message: "3D Secure ödeme başlatıldı.",
          paymentId: paymentRecord.id,
          conversationId: paymentRecord.id,
          htmlContent: decodedHtml,
        });
      } catch (callbackError) {
        console.error("IYZICO INIT callback hatası:", callbackError);

        // Kaydı PENDING bırakmamak için son bir deneme; bu da patlarsa
        // expireOldPendingPayments 10 dakika sonra toparlar.
        try {
          await prisma.payment.update({
            where: { id: paymentRecord.id },
            data: { status: "FAILED" },
          });
        } catch (updateError) {
          console.error("Ödeme FAILED işaretlenemedi:", updateError);
        }

        if (res.headersSent) return;

        return res.status(500).json({ message: "Ödeme başlatılamadı." });
      }
    });
  } catch (error) {
    console.error("3D ödeme başlatma hatası:", error);
    return res.status(500).json({ message: "Ödeme başlatılamadı." });
  }
};

const complete3DSPayment = async (req, res) => {
  const FRONTEND_URL = (process.env.FRONTEND_URL || "http://localhost:5173")
    .split(",")[0]
    .trim();

  try {
    console.log("IYZICO CALLBACK BODY:", req.body);

    const { conversationId, paymentId, conversationData, status } = req.body;

    if (!conversationId || !paymentId) {
      return res.redirect(
        `${FRONTEND_URL}/plans?paymentError=missing_callback`,
      );
    }

    const payment = await prisma.payment.findUnique({
      where: { id: conversationId },
    });

    if (!payment) {
      return res.redirect(`${FRONTEND_URL}/plans?paymentError=not_found`);
    }

    // Bu ödeme zaten tamamlanmış: hiçbir şey yapmadan başarı ekranına gönder.
    // Endpoint'in idempotent olması için gerekli, çünkü tekrar çalıştırılırsa
    // asagidaki iki adim da PAID kaydi bozar:
    //   1) threedsPayment.create ayni paymentId ile ikinci kez cagrilirsa iyzico
    //      hata doner ("zaten kullanildi"). Bu hata "odeme basarisiz" ile ayni
    //      goründügü icin catch bloğu PAID kaydi FAILED'a çevirir.
    //   2) status alani gövdeden geldiği icin sahte bir "failed" da ayni zarari
    //      verir. O yüzden bu kontrol status kontrolünün ÜSTÜNDE durmalı.
    // Şu an tarayıcı yönlendirmesi POST/Redirect/GET olduğu için tekrar çağrı
    // pek olası değil; ancak iyzico webhook (IPN) devreye alınırsa 15 dk arayla
    // 3 kez tekrar denendiği için bu koruma zorunlu hale gelir.
    if (payment.status === "PAID") {
      const settledPlan = payment.plan || getPlanFromAmount(payment.amount);

      return res.redirect(
        `${FRONTEND_URL}/payment-success?plan=${encodeURIComponent(settledPlan)}&price=${encodeURIComponent(payment.amount)}`,
      );
    }

    if (status !== "success") {
      // updateMany + status filtresi: bu uç kimlik doğrulaması olmadan
      // çağrılabildiği (iyzico'nun POST edebilmesi için öyle olmak zorunda) ve
      // "status" alanı doğrudan gövdeden geldiği için, sadece PENDING kayıtlara
      // dokunuyoruz. Aksi halde uydurma bir "failed" gövdesi zaten sonuçlanmış
      // bir kaydı bozabilir. conversationId tahmin edilemez bir UUID olduğu
      // için asıl koruma bu, ama durum filtresi de bedava.
      await prisma.payment.updateMany({
        where: { id: conversationId, status: "PENDING" },
        data: {
          status: "FAILED",
          iyzicoPaymentId: paymentId,
        },
      });

      return res.redirect(
        `${FRONTEND_URL}/plans?paymentError=verification_failed&paymentMessage=${encodeURIComponent(
          "3D Secure doğrulaması tamamlanamadı. Lütfen tekrar deneyin.",
        )}`,
      );
    }

    if (!iyzipay) {
      // Buraya normalde düşülmez (ödeme başlatılabilmişse istemci kuruludur),
      // ama süreç yeniden başlatıldıysa mümkün. Kaydı PENDING bırakıyoruz ki
      // yanlışlıkla "başarısız" damgası yemesin; 10 dk sonra süresi dolar.
      console.error("3DS tamamlama reddedildi: iyzico istemcisi yok.");

      return res.redirect(
        `${FRONTEND_URL}/plans?paymentError=service_unavailable&paymentMessage=${encodeURIComponent(
          GENERIC_SYSTEM_MESSAGE,
        )}`,
      );
    }

    const authRequest = {
      locale: Iyzipay.LOCALE.TR,
      conversationId,
      paymentId,
      conversationData,
    };

    // initialize3DSPayment'taki ile aynı tuzak: bu callback dıştaki try/catch
    // return ettikten sonra çalışır, oradan fırlayan hatayı kimse yakalamaz ve
    // kullanıcı ödeme sonrası bomboş bir sayfada kalır. Tamamı korumalı.
    iyzipay.threedsPayment.create(authRequest, async (err, result) => {
      try {
        if (err || !result || result.status !== "success") {
          const failure = resolveIyzicoError(result, err);

          console.error("IYZICO AUTH FAILED:", {
            paymentId: conversationId,
            audience: failure.audience,
            code: failure.code,
            group: failure.group,
            providerMessage: failure.providerMessage,
          });

          await prisma.payment.updateMany({
            where: { id: conversationId, status: "PENDING" },
            data: {
              status: "FAILED",
              iyzicoPaymentId: paymentId,
            },
          });

          // Tarayıcı yönlendirmesi olduğu için mesajı query string ile taşıyoruz.
          return res.redirect(
            `${FRONTEND_URL}/plans?paymentError=auth_failed&paymentMessage=${encodeURIComponent(failure.userMessage)}`,
          );
        }

        const finalPlan = payment.plan || getPlanFromAmount(payment.amount);
        const periodEnd = new Date();
        periodEnd.setDate(periodEnd.getDate() + 30);

        // Ödeme kaydı ve abonelik tek transaction'da güncellenir: para
        // tahsil edilip aboneliğin açılmadığı ara duruma düşmeyelim.
        await prisma.$transaction(async (tx) => {
          await tx.payment.update({
            where: { id: conversationId },
            data: {
              status: "PAID",
              iyzicoPaymentId: paymentId,
            },
          });

          const existingSub = await tx.subscription.findFirst({
            where: { userId: payment.userId },
            orderBy: { createdAt: "desc" },
          });

          if (existingSub) {
            await tx.subscription.update({
              where: { id: existingSub.id },
              data: {
                plan: finalPlan,
                status: "ACTIVE",
                startDate: new Date(),
                endDate: periodEnd,
              },
            });
          } else {
            await tx.subscription.create({
              data: {
                userId: payment.userId,
                plan: finalPlan,
                status: "ACTIVE",
                endDate: periodEnd,
              },
            });
          }
        });

        return res.redirect(
          `${FRONTEND_URL}/payment-success?plan=${encodeURIComponent(finalPlan)}&price=${encodeURIComponent(payment.amount)}`,
        );
      } catch (callbackError) {
        // Para çekilmiş ama kaydı işleyemedik. Kaydı FAILED'a çevirmiyoruz:
        // bu durumda tahsilat gerçek, sorun bizde. PENDING kalsın ki manuel
        // mutabakatta gözden kaçmasın.
        console.error("IYZICO AUTH callback hatası:", {
          paymentId: conversationId,
          iyzicoPaymentId: paymentId,
          error: callbackError,
        });

        if (res.headersSent) return;

        return res.redirect(
          `${FRONTEND_URL}/plans?paymentError=server_error&paymentMessage=${encodeURIComponent(
            "Ödemeniz alındı ancak hesabınıza işlenirken bir sorun oluştu. Lütfen destek ekibimizle iletişime geçin.",
          )}`,
        );
      }
    });
  } catch (error) {
    console.error("3D ödeme tamamlama hatası:", error);
    return res.redirect(`${FRONTEND_URL}/plans?paymentError=server_error`);
  }
};

const cancelSubscription = async (req, res) => {
  try {
    const userId = getUserId(req);

    if (!userId) {
      return res
        .status(401)
        .json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
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
      return res
        .status(401)
        .json({ message: "Yetkisiz işlem. Kullanıcı bulunamadı." });
    }

    await expireOldPendingPayments(userId);
    await expireOldSubscriptions(userId);

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
  expireOldSubscriptions,
};
