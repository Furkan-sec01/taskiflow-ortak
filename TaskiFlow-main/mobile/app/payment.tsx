import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";

type PlanId = "starter" | "pro" | "enterprise";
type Period = "monthly" | "yearly";
type BackendPlan = "FREE" | "PRO" | "BUSINESS";

const PLAN_MAP: Record<
  PlanId,
  { name: string; priceMonthly: number; priceYearly: number; backendPlan: BackendPlan }
> = {
  starter: {
    name: "Başlangıç",
    priceMonthly: 0,
    priceYearly: 0,
    backendPlan: "FREE",
  },
  pro: {
    name: "Profesyonel",
    priceMonthly: 99,
    priceYearly: 999,
    backendPlan: "PRO",
  },
  enterprise: {
    name: "Şirketler",
    priceMonthly: 499,
    priceYearly: 4999,
    backendPlan: "BUSINESS",
  },
};

function onlyDigits(s: string) {
  return s.replace(/\D/g, "");
}

function formatCardNumber(input: string) {
  const d = onlyDigits(input).slice(0, 16);
  return d.replace(/(.{4})/g, "$1 ").trim();
}

function formatExpiry(input: string) {
  const d = onlyDigits(input).slice(0, 4);
  if (d.length <= 2) return d;
  return `${d.slice(0, 2)}/${d.slice(2)}`;
}

export default function Payment() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const planId = (params.planId as PlanId) || "pro";
  const period = (params.period as Period) || "monthly";

  const plan = PLAN_MAP[planId] ?? PLAN_MAP.pro;

  const price = useMemo(() => {
    return period === "yearly" ? plan.priceYearly : plan.priceMonthly;
  }, [period, plan.priceMonthly, plan.priceYearly]);

  const periodText = period === "yearly" ? "Yıllık" : "Aylık";

  const [cardNumber, setCardNumber] = useState("");
  const [cardName, setCardName] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const validate = () => {
    if (price > 0 && onlyDigits(cardNumber).length !== 16) {
      Alert.alert("Hata", "Kart numarası 16 haneli olmalıdır.");
      return false;
    }

    if (price > 0 && cardName.trim().length < 3) {
      Alert.alert("Hata", "Kart üzerindeki adı giriniz.");
      return false;
    }

    if (price > 0 && expiry.length !== 5) {
      Alert.alert("Hata", "Son kullanma tarihi MM/YY formatında olmalıdır.");
      return false;
    }

    if (price > 0 && onlyDigits(cvv).length !== 3) {
      Alert.alert("Hata", "CVV 3 haneli olmalıdır.");
      return false;
    }

    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

    if (!emailOk) {
      Alert.alert("Hata", "Geçerli bir e-posta adresi giriniz.");
      return false;
    }

    return true;
  };

  const submit = async () => {
    if (!validate()) return;

    try {
      setLoading(true);

      const token = await AsyncStorage.getItem("token");

      if (!token) {
        Alert.alert("Oturum Hatası", "Lütfen tekrar giriş yapınız.");
        router.replace("/login");
        return;
      }

      if (price === 0) {
        const response = await fetch(`${API_URL}/payments/change-plan`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            plan: plan.backendPlan,
          }),
        });

        const data = await response.json().catch(() => null);

        if (!response.ok) {
          Alert.alert("Hata", data?.message || "Plan güncellenemedi.");
          return;
        }

        router.replace({
          pathname: "/payment-success",
          params: {
            planId,
            period,
            amount: String(price),
          },
        });

        return;
      }

      const cleanCardNumber = onlyDigits(cardNumber);
      const cleanCvv = onlyDigits(cvv);

      const [expMonthRaw, expYearShortRaw] = expiry.split("/");

      const expMonth = expMonthRaw?.trim();
      const expYearShort = expYearShortRaw?.trim();

      if (!expMonth || !expYearShort) {
        Alert.alert("Hata", "Son kullanma tarihi geçersiz.");
        return;
      }

      const expYear = `20${expYearShort}`;

      const response = await fetch(`${API_URL}/payments/initialize-3ds`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          plan: plan.backendPlan,
          email: email.trim().toLowerCase(),
          card: {
            name: cardName.trim(),
            number: cleanCardNumber,
            expMonth,
            expYear,
            cvc: cleanCvv,
          },
        }),
      });

      const data = await response.json().catch(() => null);

      if (!response.ok) {
        Alert.alert("Hata", data?.message || "3D Secure ödeme başlatılamadı.");
        return;
      }

      if (!data?.htmlContent) {
        Alert.alert("Hata", "3D Secure ekranı alınamadı.");
        return;
      }

      router.push({
        pathname: "/three-ds",
        params: {
          html: data.htmlContent,
          paymentId: data.conversationId || data.paymentId,
          planId,
          period,
          amount: String(price),
        },
      });
    } catch (error) {
      console.log("Ödeme hatası:", error);
      Alert.alert("Bağlantı Hatası", "Sunucuya bağlanılamadı.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </Pressable>

            <View style={{ flex: 1 }}>
              <Text style={styles.title}>Ödeme Bilgileri</Text>
              <Text style={styles.subtitle}>
                {plan.name} • {periodText}{" "}
                <Text style={{ fontWeight: "900", color: "#2563EB" }}>
                  {price === 0 ? "Ücretsiz" : `₺${price}`}
                </Text>
              </Text>
            </View>
          </View>

          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Sipariş Özeti</Text>

            <View style={styles.row}>
              <Text style={styles.muted}>Plan</Text>
              <Text style={styles.bold}>{plan.name}</Text>
            </View>

            <View style={styles.row}>
              <Text style={styles.muted}>Periyot</Text>
              <Text style={styles.bold}>{periodText}</Text>
            </View>

            <View style={[styles.row, { marginTop: 6 }]}>
              <Text style={styles.totalLabel}>Toplam</Text>
              <Text style={styles.totalValue}>
                {price === 0 ? "Ücretsiz" : `₺${price}`}
              </Text>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kart Bilgileri</Text>

            {price === 0 ? (
              <View style={styles.infoBox}>
                <Text style={styles.infoText}>
                  Bu plan için kart bilgisi alınmayacaktır. Devam ettiğinizde
                  plan bilginiz backend tarafında güncellenecektir.
                </Text>
              </View>
            ) : (
              <>
                <Text style={styles.label}>Kart Numarası</Text>
                <TextInput
                  style={styles.input}
                  value={cardNumber}
                  onChangeText={(t) => setCardNumber(formatCardNumber(t))}
                  placeholder="1234 5678 9012 3456"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="number-pad"
                  maxLength={19}
                />

                <Text style={[styles.label, { marginTop: 12 }]}>
                  Kart Üzerindeki Ad Soyad
                </Text>
                <TextInput
                  style={styles.input}
                  value={cardName}
                  onChangeText={setCardName}
                  placeholder="AD SOYAD"
                  placeholderTextColor="#9CA3AF"
                  autoCapitalize="characters"
                />

                <View style={{ flexDirection: "row", gap: 10, marginTop: 12 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.label}>Son Kullanma</Text>
                    <TextInput
                      style={styles.input}
                      value={expiry}
                      onChangeText={(t) => setExpiry(formatExpiry(t))}
                      placeholder="MM/YY"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={5}
                    />
                  </View>

                  <View style={{ width: 110 }}>
                    <Text style={styles.label}>CVV</Text>
                    <TextInput
                      style={styles.input}
                      value={cvv}
                      onChangeText={(t) => setCvv(onlyDigits(t).slice(0, 3))}
                      placeholder="123"
                      placeholderTextColor="#9CA3AF"
                      keyboardType="number-pad"
                      maxLength={3}
                      secureTextEntry
                    />
                  </View>
                </View>
              </>
            )}

            <Text style={[styles.label, { marginTop: 12 }]}>
              E-posta (Fatura / Bilgilendirme)
            </Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ad.soyad@firma.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
            />

            <Pressable
              style={[styles.payBtn, loading && styles.disabledBtn]}
              onPress={submit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.payText}>
                  {price === 0 ? "Devam Et" : `₺${price} 3D Secure ile Öde`}
                </Text>
              )}
            </Pressable>

            <Text style={styles.hint}>
              Kart bilgileri veritabanına kaydedilmez. Ödeme işlemi 3D Secure
              doğrulaması ile güvenli şekilde tamamlanır.
            </Text>
          </View>

          <View style={{ height: 22 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 22 },

  headerRow: {
    flexDirection: "row",
    gap: 10,
    alignItems: "flex-start",
    marginBottom: 12,
  },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 18, fontWeight: "900", color: "#111827" },
  title: { fontSize: 22, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 13, color: "#6B7280", lineHeight: 18 },

  summaryCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#F9FAFB",
    marginBottom: 12,
  },
  summaryTitle: {
    fontSize: 14,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 6,
  },
  muted: { color: "#6B7280", fontWeight: "700" },
  bold: { color: "#111827", fontWeight: "900" },
  totalLabel: { color: "#111827", fontWeight: "900", fontSize: 14 },
  totalValue: { color: "#2563EB", fontWeight: "900", fontSize: 16 },

  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fff",
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "900",
    color: "#111827",
    marginBottom: 10,
  },

  label: {
    fontSize: 13,
    fontWeight: "800",
    color: "#374151",
    marginBottom: 8,
  },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },

  infoBox: {
    padding: 12,
    borderRadius: 12,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
  },
  infoText: {
    color: "#1E40AF",
    fontSize: 13,
    fontWeight: "700",
    lineHeight: 18,
  },

  payBtn: {
    marginTop: 14,
    height: 50,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  disabledBtn: {
    opacity: 0.7,
  },
  payText: { color: "#fff", fontSize: 15, fontWeight: "900" },

  hint: {
    marginTop: 10,
    fontSize: 12,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
  },
});