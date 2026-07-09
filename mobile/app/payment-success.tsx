import React, { useMemo } from "react";
import {
  View,
  Text,
  Pressable,
  StyleSheet,
  SafeAreaView,
  Platform,
} from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";

type PlanId = "starter" | "pro" | "enterprise";
type Period = "monthly" | "yearly";

const PLAN_MAP: Record<PlanId, { name: string; priceMonthly: number; priceYearly: number }> = {
  starter: { name: "Başlangıç", priceMonthly: 0, priceYearly: 0 },
  pro: { name: "Profesyonel", priceMonthly: 99, priceYearly: 999 },
  enterprise: { name: "Şirketler", priceMonthly: 0, priceYearly: 0 },
};

export default function PaymentSuccess() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const planId = (params.planId as PlanId) || "pro";
  const period = (params.period as Period) || "monthly";
  const amountParam = (params.amount as string) || "";

  const plan = PLAN_MAP[planId] ?? PLAN_MAP.pro;

  const price = useMemo(() => {
    if (amountParam) {
      const p = Number(amountParam);
      return Number.isFinite(p) ? p : 0;
    }
    return period === "yearly" ? plan.priceYearly : plan.priceMonthly;
  }, [amountParam, period, plan.priceMonthly, plan.priceYearly]);

  const periodText = period === "yearly" ? "Yıllık" : "Aylık";

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.iconWrap}>
          <Text style={styles.icon}>✓</Text>
        </View>

        <Text style={styles.title}>Ödeme Başarılı</Text>
        <Text style={styles.subtitle}>
          Planınız başarıyla aktifleştirildi.
        </Text>

        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.muted}>Plan</Text>
            <Text style={styles.bold}>{plan.name}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.muted}>Periyot</Text>
            <Text style={styles.bold}>{periodText}</Text>
          </View>

          <View style={[styles.row, { marginTop: 8 }]}>
            <Text style={styles.totalLabel}>Ödenen Tutar</Text>
            <Text style={styles.totalValue}>
              {price === 0 ? "Özel Fiyatlandırma" : `₺${price}`}
            </Text>
          </View>

          <View style={styles.divider} />

          <Text style={styles.info}>
            Fatura ve ödeme bilgileri e-posta adresinize iletilecektir.
          </Text>
        </View>

        <View style={{ width: "100%", gap: 10 }}>
          <Pressable
            style={[styles.btn, styles.primary]}
            onPress={() => router.replace("/login")}
          >
            <Text style={[styles.btnText, styles.primaryText]}>
              Devam Et (Giriş Yap)
            </Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.secondary]}
            onPress={() => router.replace("/plans")}
          >
            <Text style={[styles.btnText, styles.secondaryText]}>
              Planlara Dön
            </Text>
          </Pressable>

          <Pressable
            style={[styles.btn, styles.ghost]}
            onPress={() => router.push("/contact")}
          >
            <Text style={[styles.btnText, styles.ghostText]}>
              Yardım / İletişim
            </Text>
          </Pressable>
        </View>

        <Text style={styles.footerNote}>
          Herhangi bir sorunuz olursa iletişim sayfasından bize ulaşabilirsiniz.
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingVertical: 22,
    alignItems: "center",
    justifyContent: "center",
  },

  iconWrap: {
    width: 86,
    height: 86,
    borderRadius: 28,
    backgroundColor: "#ECFDF5",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#A7F3D0",
    marginBottom: 12,
    ...Platform.select({
      android: { elevation: 1 },
      ios: {
        shadowColor: "#000",
        shadowOpacity: 0.05,
        shadowRadius: 12,
        shadowOffset: { width: 0, height: 8 },
      },
    }),
  },
  icon: { fontSize: 40, fontWeight: "900", color: "#16A34A" },

  title: { fontSize: 26, fontWeight: "900", color: "#111827", textAlign: "center" },
  subtitle: {
    marginTop: 8,
    fontSize: 13,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 320,
    marginBottom: 14,
  },

  card: {
    width: "100%",
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fff",
    marginBottom: 14,
  },

  row: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginTop: 8 },
  muted: { color: "#6B7280", fontWeight: "700" },
  bold: { color: "#111827", fontWeight: "900" },

  totalLabel: { color: "#111827", fontWeight: "900", fontSize: 14 },
  totalValue: { color: "#2563EB", fontWeight: "900", fontSize: 16 },

  divider: { height: 1, backgroundColor: "#E5E7EB", marginTop: 12, marginBottom: 10 },

  info: { fontSize: 12, color: "#374151", fontWeight: "700", lineHeight: 18 },

  btn: {
    width: "100%",
    height: 50,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: { backgroundColor: "#2563EB" },
  secondary: { borderWidth: 1, borderColor: "#E5E7EB" },
  ghost: { backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB" },

  btnText: { fontSize: 15, fontWeight: "900" },
  primaryText: { color: "#fff" },
  secondaryText: { color: "#111827" },
  ghostText: { color: "#111827" },

  footerNote: {
    marginTop: 14,
    fontSize: 12,
    color: "#9CA3AF",
    textAlign: "center",
    lineHeight: 18,
    maxWidth: 320,
  },
});
