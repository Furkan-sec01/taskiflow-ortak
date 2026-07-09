// app/terms.tsx
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

export default function Terms() {
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
          <Text style={styles.headerTitle}>Kullanım Şartları</Text>
          <Text style={styles.headerSub}>Son Güncelleme: 1 Ocak 2025</Text>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>📄</Text>
        </View>

        <View style={styles.card}>
          <Section
            title="1. Genel Hükümler"
            icon="1️⃣"
            text='TaskiFlow ("Biz", "Bizim", "Hizmet") hizmetlerini kullanarak, aşağıdaki kullanım şartlarını kabul etmiş sayılırsınız. Bu şartları kabul etmiyorsanız, lütfen hizmetlerimizi kullanmayın.'
          />

          <Section
            title="2. Hizmet Tanımı"
            icon="2️⃣"
            text="TaskiFlow, ekiplerin görevlerini, projelerini ve iş akışlarını yönetmelerine olanak sağlayan bir proje yönetim platformudur. Hizmetlerimiz şunları içerir:"
            bullets={[
              "Görev ve proje yönetimi",
              "Ekip işbirliği araçları",
              "Bildirim ve takip sistemleri",
              "Raporlama ve analitik özellikleri",
            ]}
          />

          <Section
            title="3. Kullanıcı Hesabı"
            icon="3️⃣"
            text="Hizmetlerimizi kullanmak için bir hesap oluşturmanız gerekir. Hesap oluştururken:"
            bullets={[
              "Doğru, güncel ve eksiksiz bilgiler sağlamalısınız",
              "Hesap bilgilerinizin güvenliğinden siz sorumlusunuz",
              "Hesabınızda meydana gelen tüm faaliyetlerden sorumlusunuz",
              "Şifrenizi başkalarıyla paylaşmamalısınız",
            ]}
          />

          <Section
            title="4. Kullanıcı Yükümlülükleri"
            icon="4️⃣"
            text="Hizmetlerimizi kullanırken aşağıdakilere uymalısınız:"
            bullets={[
              "Yasalara ve düzenlemelere uygun davranmak",
              "Başkalarının haklarına saygı göstermek",
              "Zararlı, tehdit edici, yanıltıcı veya yasadışı içerik paylaşmamak",
              "Virüs, kötü amaçlı yazılım veya zararlı kod yüklememek",
              "Hizmetlerimizin güvenliğini veya bütünlüğünü bozmaya çalışmamak",
            ]}
          />

          <Section
            title="5. Fikri Mülkiyet Hakları"
            icon="5️⃣"
            text="TaskiFlow platformu ve tüm içeriği (logo, tasarım, metin, grafik, yazılım vb.) bizim veya lisans verdiğimiz tarafların mülkiyetindedir. Bu içerikleri izinsiz kopyalayamaz, değiştiremez veya dağıtamazsınız."
          />

          <Section
            title="6. Veri ve Gizlilik"
            icon="6️⃣"
            text="Verilerinizin nasıl toplandığı, kullanıldığı ve korunduğu hakkında bilgi için Gizlilik Politikamızı inceleyebilirsiniz."
          />

          <View style={styles.linkRow}>
            <Pressable onPress={() => router.push("/privacy")} style={styles.linkBtn}>
              <Text style={styles.linkText}>Gizlilik Politikası →</Text>
            </Pressable>
          </View>

          <Section
            title="7. Hizmet Değişiklikleri ve Kesintiler"
            icon="7️⃣"
            text="Hizmetlerimizi herhangi bir zamanda değiştirme, askıya alma veya sonlandırma hakkını saklı tutarız. Bakım, güncelleme veya teknik sorunlar nedeniyle hizmetlerimizde geçici kesintiler olabilir."
          />

          <Section
            title="8. Sorumluluk Sınırlaması"
            icon="8️⃣"
            text="TaskiFlow, hizmetlerimizin kesintisiz, hatasız veya güvenli olacağını garanti etmez. Hizmetlerimizin kullanımından kaynaklanan doğrudan veya dolaylı zararlardan sorumlu değiliz."
          />

          <Section
            title="9. İptal ve İade"
            icon="9️⃣"
            text="Ücretli planlar için iptal ve iade koşulları, seçtiğiniz plana göre değişiklik gösterebilir. Detaylı bilgi için bizimle iletişime geçin."
          />

          <Section
            title="10. Değişiklikler"
            icon="🔟"
            text="Bu kullanım şartlarını herhangi bir zamanda değiştirme hakkını saklı tutarız. Önemli değişiklikler durumunda kullanıcıları bilgilendireceğiz. Değişikliklerden sonra hizmetlerimizi kullanmaya devam etmeniz, güncellenmiş şartları kabul ettiğiniz anlamına gelir."
          />

          <Section
            title="11. İletişim"
            icon="📩"
            text="Bu kullanım şartları hakkında sorularınız varsa, bizimle iletişime geçebilirsiniz."
          />

          <Text style={styles.footerNote}>
            Bu belge yasal bir dokümandır. Sorularınız için hukuk danışmanınıza
            başvurun.
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
    backgroundColor: "#2563EB",
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

  linkRow: { marginTop: -6, marginBottom: 12 },
  linkBtn: { alignSelf: "flex-start" },
  linkText: { color: "#2563EB", fontWeight: "900", fontSize: 13 },

  footerNote: {
    marginTop: 6,
    fontSize: 12,
    color: "#6B7280",
    lineHeight: 18,
    textAlign: "center",
  },
});
