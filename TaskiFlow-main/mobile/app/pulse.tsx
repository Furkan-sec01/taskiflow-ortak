import React from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
  Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import { MaterialIcons, Feather, Ionicons } from "@expo/vector-icons";

const { width } = Dimensions.get("window");

const pulseData = {
  taskTitle: "Mobil Pulse Tasarımı",
  projectName: "TaskiFlow",
  createdBy: "Semra Uzun",
  weekTotalTasks: 5,
  weeklyIncrease: "%12 artış",
  mostActiveUser: { name: "Aleyna", percent: 50 },
  members: [{ id: 1, initials: "A", name: "Aleyna", info: "5 görev tamamlandı", active: true }],
  weeklyActivity: [
    { day: "Pzt", value: 2 }, { day: "Sal", value: 4 }, { day: "Çar", value: 1 },
    { day: "Per", value: 5 }, { day: "Cum", value: 3 }, { day: "Cmt", value: 0 }, { day: "Paz", value: 2 },
  ],
};

export default function TaskPulseScreen() {
  const router = useRouter();
  const maxValue = Math.max(...pulseData.weeklyActivity.map((item) => item.value), 1);

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable style={styles.backButton} onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </Pressable>
        <View style={styles.headerTextWrap}>
          <Text style={styles.headerTitle}>Pulse</Text>
          <Text style={styles.headerSubtitle}>Göreve özel takım nabzı</Text>
        </View>
        <View style={styles.headerIconBox}>
          <Feather name="activity" size={18} color="#2563eb" />
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.topCard}>
          <View style={styles.topBadge}>
            <Text style={styles.topBadgeText}>{pulseData.projectName}</Text>
          </View>
          <Text style={styles.taskTitle}>{pulseData.taskTitle}</Text>
          <Text style={styles.taskMeta}>Oluşturan: {pulseData.createdBy}</Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryMini}>HAFTANIN TOPLAMI</Text>
          <View style={styles.summaryRow}>
            <Text style={styles.summaryNumber}>{pulseData.weekTotalTasks}</Text>
            <Text style={styles.summaryLabel}>GÖREV</Text>
          </View>
          <Text style={styles.summaryBottom}>Bu hafta görev hareketinde {pulseData.weeklyIncrease}</Text>
          <Text style={styles.summaryBackgroundMark}>↗</Text>
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Ekip Üyeleri</Text>
            <Text style={styles.cardCount}>{pulseData.members.length}</Text>
          </View>
          {pulseData.members.map((member) => (
            <View key={member.id} style={styles.memberRow}>
              <View style={styles.memberLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{member.initials}</Text>
                </View>
                <View>
                  <Text style={styles.memberName}>{member.name}</Text>
                  <Text style={styles.memberInfo}>{member.info}</Text>
                </View>
              </View>
              <View style={[styles.memberStatus, { backgroundColor: member.active ? "#22c55e" : "#cbd5e1" }]} />
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <MaterialIcons name="whatshot" size={18} color="#f59e0b" />
            <Text style={styles.sectionTitle}>En Aktif Kullanıcı</Text>
          </View>
          <View style={styles.activeBox}>
            <View style={styles.activeTop}>
              <Text style={styles.activeName}>{pulseData.mostActiveUser.name.toUpperCase()}</Text>
              <Text style={styles.activePercent}>%{pulseData.mostActiveUser.percent}</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: `${pulseData.mostActiveUser.percent}%` }]} />
            </View>
          </View>
        </View>

        <View style={styles.card}>
          <View style={styles.sectionTitleRow}>
            <Feather name="bar-chart-2" size={18} color="#22c55e" />
            <Text style={styles.sectionTitle}>Aktivite Grafiği</Text>
          </View>
          <View style={styles.chartArea}>
            {pulseData.weeklyActivity.map((item, index) => {
              const barHeight = (item.value / maxValue) * 130;
              return (
                <View key={index} style={styles.barColumn}>
                  <View style={styles.barWrap}>
                    <View style={[styles.bar, { height: barHeight }]} />
                  </View>
                  <Text style={styles.barValue}>{item.value}</Text>
                  <Text style={styles.barDay}>{item.day}</Text>
                </View>
              );
            })}
          </View>
          <Text style={styles.chartFooter}>Son 7 günlük görev dağılımı</Text>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <View style={styles.infoIcon}>
              <Feather name="users" size={18} color="#2563eb" />
            </View>
            <View style={styles.infoTextWrap}>
              <Text style={styles.infoTitle}>Takım Yorumu</Text>
              <Text style={styles.infoDesc}>Bu görevde ekip katkısı düzenli görünüyor.</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f8fafc" },
  header: { flexDirection: "row", alignItems: "center", paddingHorizontal: 16, paddingTop: 6, paddingBottom: 10, backgroundColor: "#f8fafc" },
  backButton: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#ffffff", alignItems: "center", justifyContent: "center", borderWidth: 1, borderColor: "#e2e8f0" },
  headerTextWrap: { flex: 1, marginLeft: 12 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#0f172a" },
  headerSubtitle: { fontSize: 12, color: "#64748b", marginTop: 2 },
  headerIconBox: { width: 40, height: 40, borderRadius: 12, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center" },
  content: { padding: 16, paddingBottom: 32 },
  topCard: { backgroundColor: "#ffffff", borderRadius: 22, padding: 18, marginBottom: 16, borderWidth: 1, borderColor: "#eef2f7", elevation: 2 },
  topBadge: { alignSelf: "flex-start", paddingHorizontal: 10, paddingVertical: 6, borderRadius: 999, backgroundColor: "#eff6ff", marginBottom: 12 },
  topBadgeText: { fontSize: 12, fontWeight: "700", color: "#2563eb" },
  taskTitle: { fontSize: 21, fontWeight: "800", color: "#0f172a" },
  taskMeta: { marginTop: 8, fontSize: 13, color: "#64748b" },
  summaryCard: { backgroundColor: "#2563eb", borderRadius: 24, padding: 18, marginBottom: 16, overflow: "hidden", minHeight: 155, justifyContent: "space-between", elevation: 6 },
  summaryMini: { fontSize: 11, fontWeight: "800", color: "#dbeafe", letterSpacing: 1 },
  summaryRow: { flexDirection: "row", alignItems: "flex-end" },
  summaryNumber: { fontSize: 48, fontWeight: "900", color: "#ffffff", lineHeight: 54 },
  summaryLabel: { marginLeft: 8, marginBottom: 8, fontSize: 14, fontWeight: "800", color: "#dbeafe" },
  summaryBottom: { fontSize: 12, color: "#dbeafe", fontWeight: "500" },
  summaryBackgroundMark: { position: "absolute", right: 16, bottom: -4, fontSize: 92, fontWeight: "900", color: "rgba(255,255,255,0.10)" },
  card: { backgroundColor: "#ffffff", borderRadius: 22, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: "#eef2f7", elevation: 2 },
  cardHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 14 },
  cardTitle: { fontSize: 14, fontWeight: "800", color: "#64748b", textTransform: "uppercase" },
  cardCount: { fontSize: 13, fontWeight: "800", color: "#64748b" },
  memberRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingVertical: 8 },
  memberLeft: { flexDirection: "row", alignItems: "center" },
  avatar: { width: 42, height: 42, borderRadius: 21, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 12 },
  avatarText: { fontSize: 15, fontWeight: "800", color: "#2563eb" },
  memberName: { fontSize: 14, fontWeight: "700", color: "#0f172a" },
  memberInfo: { marginTop: 2, fontSize: 12, color: "#94a3b8" },
  memberStatus: { width: 10, height: 10, borderRadius: 5 },
  sectionTitleRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 14 },
  sectionTitle: { fontSize: 16, fontWeight: "800", color: "#1e293b" },
  activeBox: { marginTop: 2 },
  activeTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  activeName: { fontSize: 13, fontWeight: "800", color: "#0f172a" },
  activePercent: { fontSize: 20, fontWeight: "900", color: "#2563eb" },
  progressTrack: { width: "100%", height: 10, borderRadius: 999, backgroundColor: "#e5e7eb", overflow: "hidden" },
  progressFill: { height: "100%", borderRadius: 999, backgroundColor: "#2563eb" },
  chartArea: { height: 190, flexDirection: "row", alignItems: "flex-end", justifyContent: "space-between", marginVertical: 8 },
  barColumn: { alignItems: "center", width: (width - 72) / 7 },
  barWrap: { height: 135, justifyContent: "flex-end" },
  bar: { width: 20, borderRadius: 8, backgroundColor: "#2563eb" },
  barValue: { marginTop: 8, fontSize: 11, fontWeight: "700", color: "#0f172a" },
  barDay: { marginTop: 4, fontSize: 11, color: "#64748b", fontWeight: "600" },
  chartFooter: { marginTop: 10, textAlign: "center", fontSize: 11, color: "#94a3b8", textTransform: "uppercase", letterSpacing: 0.6 },
  infoCard: { backgroundColor: "#ffffff", borderRadius: 22, padding: 16, borderWidth: 1, borderColor: "#eef2f7", elevation: 2 },
  infoRow: { flexDirection: "row", alignItems: "flex-start" },
  infoIcon: { width: 40, height: 40, borderRadius: 14, backgroundColor: "#eff6ff", alignItems: "center", justifyContent: "center", marginRight: 12 },
  infoTextWrap: { flex: 1 },
  infoTitle: { fontSize: 15, fontWeight: "800", color: "#0f172a", marginBottom: 4 },
  infoDesc: { fontSize: 13, lineHeight: 20, color: "#64748b" },
});
