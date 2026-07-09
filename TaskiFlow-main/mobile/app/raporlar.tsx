import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, SafeAreaView, ScrollView,
  Pressable, ActivityIndicator, Alert, Platform, Dimensions,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Svg, { Circle } from "react-native-svg";

const API = "/api";
const { width } = Dimensions.get("window");

async function apiFetch(path: string) {
  const token = await AsyncStorage.getItem("token");
  const res = await fetch(`${API}${path}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Hata");
  return data;
}

function DonutChart({ percentage, color, size = 80 }: { percentage: number; color: string; size?: number }) {
  const r = (size - 10) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = (percentage / 100) * circ;
  return (
    <View style={{ width: size, height: size, alignItems: "center", justifyContent: "center" }}>
      <Svg width={size} height={size} style={{ position: "absolute", transform: [{ rotate: "-90deg" }] }}>
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke="#F1F5F9" strokeWidth={7} />
        <Circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={7}
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round" />
      </Svg>
      <Text style={{ fontSize: size * 0.2, fontWeight: "900", color: "#111827" }}>{percentage}%</Text>
    </View>
  );
}

function StatRow({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <View style={styles.statRow}>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={[styles.statValue, { color }]}>{value}</Text>
    </View>
  );
}

export default function RaporlarScreen() {
  const router = useRouter();
  const { projectId } = useLocalSearchParams<{ projectId: string }>();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const path = projectId ? `/reports/${projectId}` : "/reports";
    apiFetch(path)
      .then(setData)
      .catch((err) => Alert.alert("Hata", err.message))
      .finally(() => setLoading(false));
  }, [projectId]);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6366F1" />
        <Text style={styles.loadingText}>Raporlar yükleniyor...</Text>
      </View>
    );
  }

  if (projectId && data) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <Pressable onPress={() => router.back()} style={styles.backBtn}>
            <Text style={styles.backBtnText}>← Geri</Text>
          </Pressable>
          <Text style={styles.headerTitle}>📊 RAPORLAR</Text>
          <View style={{ width: 60 }} />
        </View>

        <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
          <Text style={styles.projectTitle}>{data.projectTitle}</Text>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Genel İlerleme</Text>
            <View style={styles.progressRow}>
              <DonutChart
                percentage={data.completionRate}
                color={data.completionRate >= 70 ? "#22C55E" : data.completionRate >= 40 ? "#F59E0B" : "#6366F1"}
                size={90}
              />
              <View style={styles.progressInfo}>
                <StatRow label="Toplam Görev" value={data.totalTasks} color="#6366F1" />
                <StatRow label="Tamamlandı" value={data.completedCount} color="#22C55E" />
                <StatRow label="Gecikmiş" value={data.overdueTasks} color="#EF4444" />
                <StatRow label="Bu Hafta" value={data.weeklyAdded} color="#F59E0B" />
              </View>
            </View>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Kolon Dağılımı</Text>
            {data.columnStats?.map((col: any) => (
              <View key={col.id} style={styles.barRow}>
                <Text style={styles.barLabel} numberOfLines={1}>{col.title}</Text>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {
                    width: `${col.percentage}%`,
                    backgroundColor: col.percentage === 100 ? "#22C55E" : "#6366F1",
                  }]} />
                </View>
                <Text style={styles.barValue}>{col.taskCount}</Text>
              </View>
            ))}
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Öncelik Dağılımı</Text>
            {[
              { key: "HIGH", label: "🔴 Yüksek", color: "#EF4444" },
              { key: "MEDIUM", label: "🟡 Orta", color: "#F59E0B" },
              { key: "LOW", label: "🟢 Düşük", color: "#22C55E" },
            ].map((p) => {
              const count = data.priorityStats?.[p.key] || 0;
              const pct = data.totalTasks > 0 ? Math.round((count / data.totalTasks) * 100) : 0;
              return (
                <View key={p.key} style={styles.barRow}>
                  <Text style={styles.barLabel}>{p.label}</Text>
                  <View style={styles.barTrack}>
                    <View style={[styles.barFill, { width: `${pct}%`, backgroundColor: p.color }]} />
                  </View>
                  <Text style={styles.barValue}>{count}</Text>
                </View>
              );
            })}
          </View>

          {data.memberStats?.length > 0 && (
            <View style={styles.card}>
              <Text style={styles.cardTitle}>👥 Üye Bazlı Görevler</Text>
              {data.memberStats.map((m: any, i: number) => (
                <View key={i} style={styles.memberRow}>
                  <View style={styles.memberAvatar}>
                    <Text style={styles.memberAvatarText}>{m.name[0].toUpperCase()}</Text>
                  </View>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <View style={styles.memberCount}>
                    <Text style={styles.memberCountText}>{m.count} görev</Text>
                  </View>
                </View>
              ))}
            </View>
          )}

          <View style={styles.card}>
            <Text style={styles.cardTitle}>📋 Tüm Görevler</Text>
            {data.tasks?.length === 0 ? (
              <Text style={styles.emptyText}>Henüz görev yok</Text>
            ) : (
              data.tasks?.map((t: any) => {
                const isOverdue = t.dueDate && new Date(t.dueDate) < new Date();
                const cfgMap: Record<string, { color: string; bg: string }> = {
                  HIGH: { color: "#EF4444", bg: "#FEE2E2" },
                  MEDIUM: { color: "#F59E0B", bg: "#FEF3C7" },
                  LOW: { color: "#22C55E", bg: "#DCFCE7" },
                };
                const cfg = cfgMap[t.priority] || { color: "#6366F1", bg: "#EEF2FF" };
                return (
                  <View key={t.id} style={styles.taskRow}>
                    <View style={[styles.taskDot, { backgroundColor: cfg.bg }]}>
                      <View style={[styles.taskDotInner, { backgroundColor: cfg.color }]} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.taskTitle} numberOfLines={1}>{t.title}</Text>
                      <Text style={styles.taskMeta}>
                        {t.columnTitle}
                        {t.assignee ? ` · ${t.assignee.name || t.assignee.email}` : ""}
                        {t.dueDate ? ` · ${isOverdue ? "⚠️ Gecikmiş" : new Date(t.dueDate).toLocaleDateString("tr-TR")}` : ""}
                      </Text>
                    </View>
                  </View>
                );
              })
            )}
          </View>

          <View style={{ height: 24 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Geri</Text>
        </Pressable>
        <Text style={styles.headerTitle}>📊 RAPORLAR</Text>
        <View style={{ width: 60 }} />
      </View>

      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={styles.projectTitle}>Tüm Projeler</Text>
        {!data?.projects?.length ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyText}>Henüz proje yok</Text>
          </View>
        ) : (
          data.projects.map((p: any) => (
            <View key={p.id} style={styles.card}>
              <View style={styles.projectCardHeader}>
                <Text style={styles.projectCardTitle}>{p.title}</Text>
                <DonutChart
                  percentage={p.completionRate}
                  color={p.completionRate >= 70 ? "#22C55E" : "#6366F1"}
                  size={56}
                />
              </View>
              <View style={styles.barRow}>
                <View style={styles.barTrack}>
                  <View style={[styles.barFill, {
                    width: `${p.completionRate}%`,
                    backgroundColor: p.completionRate >= 70 ? "#22C55E" : "#6366F1",
                  }]} />
                </View>
              </View>
              <View style={styles.projectCardFooter}>
                <Text style={styles.projectCardStat}>{p.totalTasks} görev</Text>
                <Text style={styles.projectCardStat}>{p.completedTasks} tamamlandı</Text>
                <Text style={styles.projectCardStat}>{p.columnCount} kolon</Text>
              </View>
            </View>
          ))
        )}
        <View style={{ height: 24 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" },
  loadingText: { marginTop: 12, color: "#6B7280", fontSize: 14, fontWeight: "600" },
  header: {
    backgroundColor: "#fff", paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? 40 : 10, paddingBottom: 14,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
  },
  backBtn: { paddingVertical: 4 },
  backBtnText: { color: "#6B7280", fontSize: 13, fontWeight: "700" },
  headerTitle: { fontSize: 15, fontWeight: "900", color: "#111827", letterSpacing: 0.5 },
  content: { padding: 16 },
  projectTitle: { fontSize: 20, fontWeight: "900", color: "#111827", marginBottom: 16 },
  card: {
    backgroundColor: "#fff", borderRadius: 18, padding: 16, marginBottom: 14,
    borderWidth: 1, borderColor: "#F1F5F9",
    shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04, shadowRadius: 8, elevation: 1,
  },
  cardTitle: { fontSize: 14, fontWeight: "900", color: "#111827", marginBottom: 14 },
  progressRow: { flexDirection: "row", alignItems: "center", gap: 16 },
  progressInfo: { flex: 1, gap: 8 },
  statRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  statLabel: { fontSize: 12, color: "#6B7280", fontWeight: "600" },
  statValue: { fontSize: 14, fontWeight: "900" },
  barRow: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 8 },
  barLabel: { fontSize: 12, color: "#374151", fontWeight: "700", width: 80 },
  barTrack: { flex: 1, height: 8, backgroundColor: "#F1F5F9", borderRadius: 99, overflow: "hidden" },
  barFill: { height: "100%", borderRadius: 99 },
  barValue: { fontSize: 12, fontWeight: "800", color: "#374151", width: 24, textAlign: "right" },
  memberRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 6 },
  memberAvatar: { width: 32, height: 32, borderRadius: 16, backgroundColor: "#6366F1", alignItems: "center", justifyContent: "center" },
  memberAvatarText: { color: "#fff", fontSize: 13, fontWeight: "900" },
  memberName: { flex: 1, fontSize: 13, fontWeight: "700", color: "#111827" },
  memberCount: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  memberCountText: { fontSize: 11, fontWeight: "800", color: "#6366F1" },
  taskRow: { flexDirection: "row", alignItems: "center", gap: 10, paddingVertical: 7, borderBottomWidth: 1, borderBottomColor: "#F8FAFC" },
  taskDot: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
  taskDotInner: { width: 8, height: 8, borderRadius: 4 },
  taskTitle: { fontSize: 13, fontWeight: "800", color: "#111827" },
  taskMeta: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  emptyText: { color: "#D1D5DB", fontSize: 14, fontWeight: "600", textAlign: "center", paddingVertical: 20 },
  emptyBox: { alignItems: "center", paddingVertical: 40 },
  projectCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 10 },
  projectCardTitle: { fontSize: 15, fontWeight: "900", color: "#111827", flex: 1 },
  projectCardFooter: { flexDirection: "row", justifyContent: "space-between", marginTop: 8 },
  projectCardStat: { fontSize: 11, color: "#6B7280", fontWeight: "700" },
});
