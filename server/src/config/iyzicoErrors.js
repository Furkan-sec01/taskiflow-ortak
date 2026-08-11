/**
 * iyzico hata kodları -> kullanıcıya gösterilecek mesaj eşlemesi.
 *
 * AMAÇ
 * iyzico başarısız bir yanıt döndüğünde iki farklı durum vardır:
 *
 *   USER   : Sorunu müşteri çözebilir (kart limiti yetersiz, CVC yanlış,
 *            kartın süresi dolmuş, bankası izin vermiyor...). Bu durumda
 *            müşteriye NE olduğunu söylemek gerekir, yoksa tekrar dener ve
 *            yine aynı duvara toslar.
 *
 *   SYSTEM : Sorun bizde ya da iyzico/banka altyapısındadır (API anahtarı
 *            hatalı, gönderdiğimiz veri geçersiz, terminal yetkisiz, banka
 *            cevap vermiyor...). Müşterinin yapabileceği bir şey yoktur ve
 *            teknik detayı ona göstermek hem faydasız hem de bilgi sızdırır.
 *            Bu durumda tek tip genel mesaj döneriz, gerçek hatayı loglarız.
 *
 * SINIFLANDIRMA KURALI
 * "Müşteri kendi kontrolündeki bir şeyi değiştirerek (başka kart, doğru CVC,
 * bankasını aramak) bunu çözebilir mi?" Cevap evet ise USER, değilse SYSTEM.
 *
 * MESAJLAR NEDEN iyzico'nunkiyle AYNI DEĞİL
 * iyzico'nun bazı mesajları kart sahibine değil, POS başındaki operatöre
 * yazılmıştır ("Kayıp kart, karta el koyunuz"). Bunları olduğu gibi
 * göstermek saçma olur; o yüzden burada kendi müşteri diliyle yazıyoruz.
 *
 * LİSTE NEDEN TAM DEĞİL
 * iyzico zamanla yeni kod ekleyebilir. Bu yüzden tabloda olmayan kodlar için
 * aşağıdaki aralık (range) mantığı devreye girer; asla "kod yoksa patla"
 * durumuna düşmeyiz.
 *
 * Kaynak: https://docs.iyzico.com/en/add-ons/error-codes
 */

const ERROR_AUDIENCE = {
  USER: "USER",
  SYSTEM: "SYSTEM",
};

// Sorun bizdeyken müşteriye gösterilen tek mesaj.
const GENERIC_SYSTEM_MESSAGE =
  "Ödeme işlemi sırasında sistemimizde bir sorun oluştu. Kartınızdan para çekilmedi, lütfen birazdan tekrar deneyin.";

// Banka reddetti ama kodu tanımıyoruz ve iyzico da mesaj vermediyse.
const GENERIC_USER_MESSAGE =
  "Ödeme bankanız tarafından onaylanmadı. Lütfen kart bilgilerinizi kontrol edin veya başka bir kart deneyin.";

/**
 * Bilinen kodlar. Banka hataları 10000'den başlar.
 * group alanı iyzico'nun errorGroup değeridir; loglarda arama kolaylığı için.
 */
const IYZICO_ERRORS = {
  // ── Kart / kart sahibi kaynaklı: müşteriye göster ──
  10005: {
    group: "DO_NOT_HONOUR",
    audience: ERROR_AUDIENCE.USER,
    message:
      "Bankanız bu işlemi onaylamadı. Lütfen bankanızla görüşün veya başka bir kart deneyin.",
  },
  10012: {
    group: "INVALID_TRANSACTION",
    audience: ERROR_AUDIENCE.USER,
    message: "Bankanız bu işleme izin vermedi. Lütfen başka bir kart deneyin.",
  },
  10034: {
    group: "FRAUD_SUSPECT",
    audience: ERROR_AUDIENCE.USER,
    message:
      "Bankanız işlemi güvenlik nedeniyle durdurdu. Lütfen bankanızı arayın.",
  },
  10041: {
    group: "LOST_CARD",
    audience: ERROR_AUDIENCE.USER,
    message: "Bu kart kullanıma kapalı. Lütfen bankanızla iletişime geçin.",
  },
  10043: {
    group: "STOLEN_CARD",
    audience: ERROR_AUDIENCE.USER,
    message: "Bu kart kullanıma kapalı. Lütfen bankanızla iletişime geçin.",
  }, //ÇALINTI KART KULLANICI HAKKINDA ÖZEL BİR LOG TUTULABİLİR.
  10051: {
    group: "NOT_SUFFICIENT_FUNDS",
    audience: ERROR_AUDIENCE.USER,
    message: "Kart limitiniz veya bakiyeniz bu işlem için yeterli değil.",
  },
  10054: {
    group: "EXPIRED_CARD",
    audience: ERROR_AUDIENCE.USER,
    message: "Kartınızın son kullanma tarihi geçmiş.",
  },
  10057: {
    group: "NOT_PERMITTED_TO_CARDHOLDER",
    audience: ERROR_AUDIENCE.USER,
    message: "Kartınız bu tür işlemlere kapalı. Lütfen bankanızı arayın.",
  },
  10084: {
    group: "INVALID_CVC2",
    audience: ERROR_AUDIENCE.USER,
    message: "Girdiğiniz CVC (güvenlik) kodu hatalı.",
  },
  10093: {
    group: "RESTRICTED_BY_LAW",
    audience: ERROR_AUDIENCE.USER,
    message:
      "Kartınız internetten alışverişe kapalı. Bankanızı arayarak açtırabilirsiniz.",
  },
  10201: {
    group: "CARD_NOT_PERMITTED",
    audience: ERROR_AUDIENCE.USER,
    message: "Kartınız bu işleme izin vermedi. Lütfen başka bir kart deneyin.",
  },
  10205: {
    group: "INVALID_CHARS_IN_EMAIL",
    audience: ERROR_AUDIENCE.USER,
    message: "Girdiğiniz e-posta adresi geçerli bir formatta değil.",
  },
  10206: {
    group: "INVALID_CVC2_LENGTH",
    audience: ERROR_AUDIENCE.USER,
    message: "CVC (güvenlik) kodu eksik veya fazla haneli.",
  },
  10207: {
    group: "REFER_TO_CARD_ISSUER",
    audience: ERROR_AUDIENCE.USER,
    message:
      "İşlem için bankanızdan onay almanız gerekiyor. Lütfen bankanızı arayın.",
  },
  10209: {
    group: "BLOCKED_CARD",
    audience: ERROR_AUDIENCE.USER,
    message: "Kartınız bloke durumda. Lütfen bankanızla iletişime geçin.",
  },
  10212: {
    group: "CVC2_MAX_ATTEMPT",
    audience: ERROR_AUDIENCE.USER,
    message:
      "CVC kodunu çok kez hatalı girdiniz. Bankanız kartı geçici olarak kapattı.",
  },
  10213: {
    group: "BIN_NOT_FOUND",
    audience: ERROR_AUDIENCE.USER,
    message: "Kart numarası tanınmadı. Lütfen kontrol edip tekrar deneyin.",
  },
  10215: {
    group: "INVALID_CARD_NUMBER",
    audience: ERROR_AUDIENCE.USER,
    message: "Girdiğiniz kart numarası geçersiz.",
  },
  10216: {
    group: "NO_SUCH_ISSUER",
    audience: ERROR_AUDIENCE.USER,
    message:
      "Kartınızın bankası bulunamadı. Lütfen kart numarasını kontrol edin.",
  },
  10217: {
    group: "DEBIT_CARDS_REQUIRES_3DS",
    audience: ERROR_AUDIENCE.USER,
    message:
      "Banka kartınız bu işlem için kullanılamıyor. Lütfen bir kredi kartı deneyin.",
  },
  10218: {
    group: "DEBIT_CARDS_INSTALLMENT_NOT_ALLOWED",
    audience: ERROR_AUDIENCE.USER,
    message: "Banka kartlarıyla taksitli işlem yapılamıyor.",
  },
  10220: {
    group: "DECLINED",
    audience: ERROR_AUDIENCE.USER,
    message:
      "Ödeme bankanız tarafından reddedildi. Lütfen başka bir kart deneyin.",
  },
  10221: {
    group: "NOT_PERMITTED_TO_FOREIGN_CARD",
    audience: ERROR_AUDIENCE.USER,
    message:
      "Yurt dışı kartlar kabul edilmiyor. Lütfen Türkiye'de verilmiş bir kart kullanın.",
  },
  10224: {
    group: "EXCEEDS_WITHDRAWAL_AMOUNT_LIMIT",
    audience: ERROR_AUDIENCE.USER,
    message: "Kartınızın işlem limiti aşıldı.",
  },
  10225: {
    group: "RESTRICTED_CARD",
    audience: ERROR_AUDIENCE.USER,
    message: "Kartınız kısıtlı durumda. Lütfen bankanızla iletişime geçin.",
  },
  10226: {
    group: "EXCEEDS_ALLOWABLE_PIN_TRIES",
    audience: ERROR_AUDIENCE.USER,
    message:
      "İzin verilen şifre deneme sayısı aşıldı. Lütfen bankanızı arayın.",
  },
  10227: {
    group: "INVALID_PIN",
    audience: ERROR_AUDIENCE.USER,
    message: "Girdiğiniz şifre hatalı.",
  },
  10229: {
    group: "INVALID_EXPIRE_YEAR_MONTH",
    audience: ERROR_AUDIENCE.USER,
    message: "Kartın son kullanma tarihi geçersiz. Lütfen kontrol edin.",
  },
  10230: {
    group: "REQUEST_BLOCKED_BY_BANK",
    audience: ERROR_AUDIENCE.USER,
    message: "İşlem bankanız tarafından engellendi. Lütfen bankanızı arayın.",
  },
  10233: {
    group: "INVALID_CARD_TYPE",
    audience: ERROR_AUDIENCE.USER,
    message: "Bu kart tipi desteklenmiyor. Lütfen başka bir kart deneyin.",
  },
  10234: {
    group: "NOT_SUFFICIENT_AWARD",
    audience: ERROR_AUDIENCE.USER,
    message: "Kartınızdaki puan bu işlem için yeterli değil.",
  },
  10235: {
    group: "AMEX_CAN_USE_ONLY_MR",
    audience: ERROR_AUDIENCE.USER,
    message: "American Express kartınız bu işlem için kullanılamıyor.",
  },

  // ── Bizim yapılandırmamız / iyzico / banka altyapısı: genel mesaj göster ──
  10058: {
    group: "NOT_PERMITTED_TO_TERMINAL",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Terminalin bu işlemi yapmaya yetkisi yok.",
  },
  10202: {
    group: "UNKNOWN",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Ödeme sırasında bilinmeyen bir hata oluştu.",
  },
  10203: {
    group: "APPROVED_COMPLETED",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "İşlem daha önce onaylanmış.",
  },
  10204: {
    group: "UNKNOWN",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Ödeme sırasında bilinmeyen bir hata oluştu.",
  },
  10208: {
    group: "INVALID_MERCHANT_OR_SP",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Üye iş yeri kategori kodu hatalı.",
  },
  10210: {
    group: "INVALID_CAVV",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "3D Secure doğrulama verisi geçersiz.",
  },
  10211: {
    group: "INVALID_ECI",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "3D Secure ECI bilgisi geçersiz.",
  },
  10214: {
    group: "COMMUNICATION_OR_SYSTEM_ERROR",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Banka ile iletişimde sistem hatası.",
  },
  10219: {
    group: "REQUEST_TIMEOUT",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Bankaya gönderilen istek zaman aşımına uğradı.",
  },
  10222: {
    group: "NOT_PERMITTED_TO_INSTALLMENT",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Terminal taksitli işleme kapalı.",
  },
  10223: {
    group: "REQUIRES_DAY_END",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Banka tarafında gün sonu işlemi bekleniyor.",
  },
  10228: {
    group: "ISSUER_OR_SWITCH_INOPERATIVE",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Banka şu anda işlem yapamıyor.",
  },
  10231: {
    group: "SALES_AMOUNT_LESS_THAN_AWARD",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Satış tutarı ödül puanından düşük olamaz.",
  },
  10232: {
    group: "INVALID_AMOUNT",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Gönderilen tutar geçersiz.",
  },
  10236: {
    group: "UNKNOWN",
    audience: ERROR_AUDIENCE.SYSTEM,
    message: "Ödeme sırasında bilinmeyen bir hata oluştu.",
  },
};

/**
 * Tabloda olmayan kodlar için aralık bazlı sınıflandırma.
 * Banka aralığı (10000+) dışındaki her şey bizim isteğimizle ilgilidir:
 * yanlış API anahtarı, eksik alan, geçersiz veri... hepsi SYSTEM.
 */
const ERROR_CODE_RANGES = [
  {
    min: 1,
    max: 27,
    audience: ERROR_AUDIENCE.SYSTEM,
    label: "Genel istek hatası",
  },
  {
    min: 1000,
    max: 1009,
    audience: ERROR_AUDIENCE.SYSTEM,
    label: "Kimlik doğrulama / imza hatası (API anahtarları)",
  },
  {
    min: 2000,
    max: 2030,
    audience: ERROR_AUDIENCE.SYSTEM,
    label: "Üye iş yeri kayıt hatası",
  },
  {
    min: 3000,
    max: 3013,
    audience: ERROR_AUDIENCE.SYSTEM,
    label: "Kart saklama hatası",
  },
  {
    min: 4000,
    max: 4006,
    audience: ERROR_AUDIENCE.SYSTEM,
    label: "Marketplace ödeme aktarım hatası",
  },
  {
    min: 5000,
    max: 6001,
    audience: ERROR_AUDIENCE.SYSTEM,
    label: "Doğrulama hatası (gönderdiğimiz veri geçersiz)",
  },
  {
    min: 10000,
    max: 19999,
    audience: ERROR_AUDIENCE.USER,
    label: "Banka reddi",
  },
];

const audienceFromRange = (code) => {
  if (!Number.isFinite(code)) return ERROR_AUDIENCE.SYSTEM;

  const range = ERROR_CODE_RANGES.find((r) => code >= r.min && code <= r.max);

  // Hiçbir aralığa girmiyorsa güvenli tarafta kal: müşteriye teknik detay verme.
  return range ? range.audience : ERROR_AUDIENCE.SYSTEM;
};

/**
 * iyzico'nun başarısız yanıtını (ya da bağlantı hatasını) alıp
 * müşteriye ne göstereceğimizi ve loga ne yazacağımızı döndürür.
 *
 * @param {object|null} result - iyzico yanıtı (errorCode, errorGroup, errorMessage)
 * @param {Error|null}  err    - SDK/ağ hatası; varsa her zaman SYSTEM'dir
 * @returns {{ audience: string, userMessage: string, code: number|null,
 *             group: string|null, providerMessage: string|null }}
 */
const resolveIyzicoError = (result, err = null) => {
  // Ağ/SDK hatası: iyzico'ya ulaşamadık, müşterinin kartıyla ilgisi yok.
  if (err || !result) {
    return {
      audience: ERROR_AUDIENCE.SYSTEM,
      userMessage: GENERIC_SYSTEM_MESSAGE,
      code: null,
      group: null,
      providerMessage: err?.message || null,
    };
  }

  const code = Number(result.errorCode);
  const known = IYZICO_ERRORS[code];
  const audience = known ? known.audience : audienceFromRange(code);

  let userMessage;

  if (audience === ERROR_AUDIENCE.SYSTEM) {
    userMessage = GENERIC_SYSTEM_MESSAGE;
  } else if (known) {
    userMessage = known.message;
  } else {
    // Bilmediğimiz bir banka kodu: iyzico'nun kendi Türkçe mesajı
    // kart sahibine yazıldığı için gösterilebilir.
    userMessage = result.errorMessage || GENERIC_USER_MESSAGE;
  }

  return {
    audience,
    userMessage,
    code: Number.isFinite(code) ? code : null,
    group: known?.group || result.errorGroup || null,
    providerMessage: result.errorMessage || null,
  };
};

module.exports = {
  ERROR_AUDIENCE,
  GENERIC_SYSTEM_MESSAGE,
  GENERIC_USER_MESSAGE,
  IYZICO_ERRORS,
  ERROR_CODE_RANGES,
  resolveIyzicoError,
};
