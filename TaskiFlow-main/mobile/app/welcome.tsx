import React from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { LayoutDashboard, CheckSquare, Users } from "lucide-react-native";

export default function WelcomeScreen() {
  const router = useRouter();

  const highlights = [
    {
      icon: <LayoutDashboard size={20} color="#2563EB" />,
      title: "Görsel Panolar",
    },
    {
      icon: <CheckSquare size={20} color="#2563EB" />,
      title: "Akıllı Görev Takibi",
    },
    {
      icon: <Users size={20} color="#2563EB" />,
      title: "Ekip İşbirliği",
    },
  ];

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.container}>
          {/* Üst Alan */}
          <View style={styles.heroSection}>
            <View style={styles.logoBox}>
              <Text style={styles.logoText}>T</Text>
            </View>

            <Text style={styles.brand}>TaskiFlow</Text>

            <Text style={styles.title}>
              Projelerini yönet,{"\n"}
              ekibinle birlikte <Text style={styles.titleBlue}>ilerle</Text>
            </Text>

            <Text style={styles.subtitle}>
              Görevlerini, ekip süreçlerini ve proje akışını tek bir yerden
              kolayca takip et.
            </Text>
          </View>

          {/* Buton Alanı - daha ortada ve daha güçlü */}
          <View style={styles.buttonsCard}>
            <Pressable
              style={styles.registerBtn}
              onPress={() => router.push("/register")}
            >
              <Text style={styles.registerBtnText}>Kayıt Ol</Text>
            </Pressable>

            <Pressable
              style={styles.loginBtn}
              onPress={() => router.push("/login")}
            >
              <Text style={styles.loginBtnText}>Giriş Yap</Text>
            </Pressable>

            <Text style={styles.terms}>
              Devam ederek kullanım koşullarını kabul etmiş olursun.
            </Text>
          </View>

          {/* Alt mini özellikler */}
          <View style={styles.infoSection}>
            {highlights.map((item, index) => (
              <View key={index} style={styles.infoCard}>
                <View style={styles.infoIcon}>{item.icon}</View>
                <Text style={styles.infoTitle}>{item.title}</Text>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  scrollContent: {
    flexGrow: 1,
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 28,
    paddingBottom: 24,
    justifyContent: "center",
  },

  heroSection: {
    alignItems: "center",
    marginBottom: 28,
  },
  logoBox: {
    width: 82,
    height: 82,
    borderRadius: 24,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.2,
    shadowRadius: 14,
    elevation: 6,
  },
  logoText: {
    color: "#fff",
    fontSize: 34,
    fontWeight: "800",
  },
  brand: {
    fontSize: 16,
    fontWeight: "700",
    color: "#2563EB",
    marginBottom: 10,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#111827",
    textAlign: "center",
    lineHeight: 38,
    marginBottom: 10,
  },
  titleBlue: {
    color: "#2563EB",
  },
  subtitle: {
    fontSize: 15,
    lineHeight: 23,
    color: "#6B7280",
    textAlign: "center",
    paddingHorizontal: 8,
  },

  buttonsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 26,
    padding: 20,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 26,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 3,
  },
  registerBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    shadowColor: "#2563EB",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  registerBtnText: {
    color: "#FFFFFF",
    fontSize: 18,
    fontWeight: "800",
  },
  loginBtn: {
    height: 56,
    borderRadius: 18,
    backgroundColor: "#F9FAFB",
    borderWidth: 1,
    borderColor: "#D1D5DB",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
  },
  loginBtnText: {
    color: "#111827",
    fontSize: 18,
    fontWeight: "700",
  },
  terms: {
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
    lineHeight: 18,
  },

  infoSection: {
    gap: 12,
  },
  infoCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    paddingVertical: 15,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  infoTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#111827",
  },
});
