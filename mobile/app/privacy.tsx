// app/privacy.tsx
import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  ScrollView,
  StatusBar,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import {
  SafeAreaView,
  useSafeAreaInsets,
} from "react-native-safe-area-context";

export default function Privacy() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.topBackground} />

      {/* HEADER */}
      <View style={[styles.header, { paddingTop: insets.top + 8 }]}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backText}>←</Text>
        </Pressable>

        <View style={{ flex: 1 }}>
          <Text style={styles.headerTitle}>Gizlilik Politikası</Text>
          <Text style={styles.headerSub}>Son Güncelleme: 1 Ocak 2025</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>🛡️</Text>
        </View>

        <View style={styles.card}>
          <Section
            title="1. Gizliliğinize Önem Veriyoruz"
            icon="🔒"
            text="TaskiFlow olarak, kişisel verilerinizin gizliliğini korumak bizim önceliğimizdir. Bu gizlilik politikası, hangi bilgileri topladığımızı, nasıl kullandığımızı ve koruduğumuzu açıklamaktadır."
          />

          <Section
            title="2. Topladığımız Bilgiler"
            icon="🗄️"
            text="Hizmetlerimizi sağlamak için aşağıdaki bilgileri topluyoruz:"
            bullets={[
              "Hesap Bilgileri: Ad, e-posta adresi, şifre (şifrelenmiş)",
              "Kullanım Verileri: Görevler, projeler, ekip üyeleri ve platform içi etkileşimleriniz",
              "Teknik Bilgiler: IP adresi, tarayıcı türü, cihaz bilgileri, kullanım zamanları",
              "İletişim Bilgileri: Destek talepleriniz ve bizimle yaptığınız iletişimler",
            ]}
          />

          <Section
            title="3. Bilgilerinizi Nasıl Kullanıyoruz?"
            icon="👁️"
            text="Topladığımız bilgileri aşağıdaki amaçlarla kullanıyoruz:"
            bullets={[
              "Hizmetlerimizi sağlamak ve iyileştirmek",
              "Hesabınızı yönetmek ve kimlik doğrulama yapmak",
              "Müşteri desteği sağlamak ve sorularınızı yanıtlamak",
              "Güvenlik ihlallerini tespit etmek ve önlemek",
              "Yasal yükümlülüklerimizi yerine getirmek",
              "Size önemli bildirimler göndermek (izin verdiğiniz takdirde)",
            ]}
          />

          <Section
            title="4. Bilgilerinizin Güvenliği"
            icon="🛡️"
            text="Verilerinizin güvenliğini sağlamak için endüstri standardı güvenlik önlemleri kullanıyoruz:"
            bullets={[
              "SSL/TLS şifreleme ile veri aktarımı",
              "Şifrelerin bcrypt ile hash'lenmesi",
              "Düzenli güvenlik denetimleri ve güncellemeler",
              "Sınırlı erişim kontrolleri",
              "Güvenli veritabanı yönetimi",
            ]}
          />

          <Section
            title="5. Bilgilerin Paylaşımı"
            icon="🤝"
            text="Kişisel bilgilerinizi aşağıdaki durumlar dışında üçüncü taraflarla paylaşmıyoruz:"
            bullets={[
              "Yasal Zorunluluklar: Yasal bir talep veya mahkeme kararı durumunda",
              "Hizmet Sağlayıcılar: Veri depolama, hosting vb. için güvenilir üçüncü taraflar",
              "İş Transferleri: Şirket birleşmesi, devri veya varlık satışı durumunda",
              "İzin: Açıkça izin verdiğiniz durumlarda",
            ]}
          />

          <Section
            title="6. Çerezler (Cookies)"
            icon="🍪"
            text="Platformumuz, deneyiminizi iyileştirmek için çerezler kullanır. Çerezler, tarayıcınızda saklanan küçük veri dosyalarıdır. Çerezleri tarayıcı ayarlarından yönetebilirsiniz; ancak bu durumda bazı özellikler düzgün çalışmayabilir."
          />

          <Section
            title="7. Haklarınız"
            icon="✅"
            text="KVKK kapsamında aşağıdaki haklara sahipsiniz:"
            bullets={[
              "Kişisel verilerinizin işlenip işlenmediğini öğrenme",
              "İşlenen kişisel verileriniz hakkında bilgi talep etme",
              "Kişisel verilerinizin silinmesini veya yok edilmesini isteme",
              "Otomatik analiz sonucu aleyhinize bir sonuca itiraz etme",
              "Kanuna aykırı işleme nedeniyle zararınızın giderilmesini talep etme",
            ]}
          />

          <Section
            title="8. Veri Saklama"
            icon="🕒"
            text="Kişisel verilerinizi, hesabınız aktif olduğu sürece ve yasal saklama yükümlülüklerimiz gereği saklıyoruz. Hesabınızı sildiğinizde, verileriniz 30 gün içinde kalıcı olarak silinir."
          />

          <Section
            title="9. Çocukların Gizliliği"
            icon="👶"
            text="Hizmetlerimiz 18 yaş altındaki kişilere yönelik değildir. Bilerek 18 yaş altındaki kişilerden kişisel bilgi toplamıyoruz."
          />

          <Section
            title="10. Politika Değişiklikleri"
            icon="📝"
            text="Bu gizlilik politikasını zaman zaman güncelleyebiliriz. Önemli değişiklikler durumunda e-posta veya platform içi bildirim ile sizi bilgilendireceğiz."
          />

          <Section
            title="11. İletişim"
            icon="📩"
            text="Gizlilik politikamız hakkında sorularınız veya haklarınızı kullanmak için bizimle iletişime geçebilirsiniz."
          />

          <Text style={styles.footerNote}>
            Bu belge KVKK ve GDPR uyumludur. Sorularınız için veri koruma sorumlusuna
            başvurabilirsiniz.
          </Text>
        </View>

        <View style={{ height: 18 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

function Section({
  title,
  icon,
  text,
  bullets,
}: {
  title: string;
  icon: string;
  text: string;
  bullets?: string[];
}) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle}>
        {icon} {title}
      </Text>
      <Text style={styles.sectionText}>{text}</Text>

      {bullets?.length ? (
        <View style={styles.bullets}>
          {bullets.map((b, i) => (
            <View key={i} style={styles.bulletRow}>
              <Text style={styles.bulletDot}>•</Text>
              <Text style={styles.bulletText}>{b}</Text>
            </View>
          ))}
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },

  topBackground: {
    position: "absolute",
    top: 0,
    width: "100%",
    height: 260,
    backgroundColor: "#EFF6FF",
  },

  header: {
    paddingHorizontal: 16,
    paddingBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },

  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    ...Platform.select({
      ios: {
        shadowColor: "#111827",
        shadowOpacity: 0.06,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
      android: { elevation: 2 },
    }),
  },
  backText: { fontSize: 18, fontWeight: "900", color: "#111827" },

  headerTitle: { fontSize: 18, fontWeight: "900", color: "#111827" },
  headerSub: { marginTop: 2, fontSize: 12, color: "#6B7280", fontWeight: "700" },

  content: {
    paddingHorizontal: 16,
    paddingBottom: 22,
  },

  heroIcon: {
    width: 64,
    height: 64,
    borderRadius: 18,
    backgroundColor: "#7C3AED",
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "center",
    marginTop: 6,
    marginBottom: 12,
  },
  heroIconText: { fontSize: 30 },

  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 16,
    backgroundColor: "#FFFFFF",
  },

  section: { marginBottom: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
  sectionText: { marginTop: 8, fontSize: 13, color: "#374151", lineHeight: 20 },

  bullets: { marginTop: 10, gap: 8 },
  bulletRow: { flexDirection: "row", gap: 10 },
  bulletDot: {
    fontSize: 16,
    lineHeight: 20,
    color: "#2563EB",
    fontWeight: "900",
  },
  bulletText: { flex: 1, fontSize: 13, color: "#374151", lineHeight: 20 },

  footerNote: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    textAlign: "center",
  },
});
