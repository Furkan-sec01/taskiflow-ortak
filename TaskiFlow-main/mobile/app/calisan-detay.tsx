import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, SafeAreaView, Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.43.19:5000";

const AVATAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const PRIORITY_MAP: Record<string, { label: string; color: string; bg: string }> = {
  HIGH:   { label: "Yüksek", color: "#EF4444", bg: "#FEE2E2" },
  MEDIUM: { label: "Orta",   color: "#F59E0B", bg: "#FEF3C7" },
  LOW:    { label: "Düşük",  color: "#10B981", bg: "#D1FAE5" },
};

export default function CalisanDetayScreen() {
  const router = useRouter();
  const { memberId, memberName, memberEmail, memberRole } = useLocalSearchParams<{
    memberId: string; memberName: string; memberEmail: string; memberRole: string;
  }>();

  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const avatarColor = AVATAR_COLORS[Math.abs((memberName || "").charCodeAt(0) % AVATAR_COLORS.length)];
  const isOwner = memberRole === "OWNER";

  useEffect(() => { fetchMemberTasks(); }, []);

  const fetchMemberTasks = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/tasks?assigneeId=${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (Array.isArray(data)) setTasks(data);
    } catch (e) {
      console.log("Görev yükleme hatası:", e);
    } finally {
      setLoading(false);
    }
  };

  const doneTasks = tasks.filter(t => t.isCompleted);
  const activeTasks = tasks.filter(t => !t.isCompleted);
  const progress = tasks.length > 0 ? Math.round((doneTasks.length / tasks.length) * 100) : 0;

  return (
    <SafeAreaView style={styles.safe}>

      {/* Header */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <MaterialIcons name="arrow-back" size={24} color="#111827" />
        </Pressable>
        <Text style={styles.headerTitle}>Çalışan Detayı</Text>

        {/* Sağ üst köşe - Pulse butonu */}
        <Pressable
          style={styles.pulseBtn}
          onPress={() => router.push({ pathname: "/(tabs)/pulse" })}
        >
          <MaterialIcons name="show-chart" size={16} color="#2563EB" />
          <Text style={styles.pulseBtnText}>Pulse</Text>
        </Pressable>
      </View>

      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Profil Kartı */}
        <View style={styles.profileCard}>
          <View style={[styles.avatar, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarText}>{memberName?.charAt(0).toUpperCase() || "?"}</Text>
          </View>
          <Text style={styles.memberName}>{memberName}</Text>
          <Text style={styles.memberEmail}>{memberEmail}</Text>
          <View style={[styles.roleBadge, isOwner && styles.roleBadgeOwner]}>
            <MaterialIcons name={isOwner ? "star" : "person"} size={13} color={isOwner ? "#4F46E5" : "#6B7280"} />
            <Text style={[styles.roleText, isOwner && styles.roleTextOwner]}>
              {isOwner ? "Ekip Lideri" : "Çalışan"}
            </Text>
          </View>
        </View>

        {/* İlerleme */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Görev İlerlemesi</Text>
          <View style={styles.statsRow}>
            <View style={styles.statBox}>
              <Text style={styles.statNum}>{tasks.length}</Text>
              <Text style={styles.statLabel}>Toplam</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: "#10B981" }]}>{doneTasks.length}</Text>
              <Text style={styles.statLabel}>Tamamlanan</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={[styles.statNum, { color: "#F59E0B" }]}>{activeTasks.length}</Text>
              <Text style={styles.statLabel}>Devam Eden</Text>
            </View>
          </View>
          <View style={styles.progressLabelRow}>
            <Text style={styles.progressLabel}>Genel İlerleme</Text>
            <Text style={styles.progressPercent}>%{progress}</Text>
          </View>
          <View style={styles.progressBg}>
            <View style={[styles.progressFill, { width: `${progress}%` as any, backgroundColor: progress >= 75 ? "#10B981" : progress >= 40 ? "#F59E0B" : "#2563EB" }]} />
          </View>
        </View>

        {/* Aktif Görevler */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons name="radio-button-unchecked" size={18} color="#F59E0B" />
            <Text style={styles.cardTitle}>Aktif Görevler</Text>
            <Text style={styles.cardCount}>{activeTasks.length}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 12 }} />
          ) : activeTasks.length === 0 ? (
            <Text style={styles.emptyText}>Aktif görev yok 🎉</Text>
          ) : (
            activeTasks.map(task => {
              const pri = PRIORITY_MAP[task.priority] || PRIORITY_MAP.MEDIUM;
              return (
                <View key={task.id} style={styles.taskRow}>
                  <View style={styles.taskDot} />
                  <View style={styles.taskInfo}>
                    <Text style={styles.taskTitle}>{task.title}</Text>
                    {task.project?.title && (
                      <Text style={styles.taskProject}>{task.project.title}</Text>
                    )}
                  </View>
                  <View style={[styles.priBadge, { backgroundColor: pri.bg }]}>
                    <Text style={[styles.priText, { color: pri.color }]}>{pri.label}</Text>
                  </View>
                </View>
              );
            })
          )}
        </View>

        {/* Tamamlanan Görevler */}
        <View style={styles.card}>
          <View style={styles.cardHeaderRow}>
            <MaterialIcons name="check-circle" size={18} color="#10B981" />
            <Text style={styles.cardTitle}>Tamamlanan Görevler</Text>
            <Text style={styles.cardCount}>{doneTasks.length}</Text>
          </View>

          {loading ? (
            <ActivityIndicator size="small" color="#2563EB" style={{ marginVertical: 12 }} />
          ) : doneTasks.length === 0 ? (
            <Text style={styles.emptyText}>Henüz tamamlanan görev yok</Text>
          ) : (
            doneTasks.map(task => (
              <View key={task.id} style={[styles.taskRow, { opacity: 0.6 }]}>
                <MaterialIcons name="check-circle" size={16} color="#10B981" />
                <View style={styles.taskInfo}>
                  <Text style={[styles.taskTitle, { textDecorationLine: "line-through" }]}>{task.title}</Text>
                  {task.project?.title && (
                    <Text style={styles.taskProject}>{task.project.title}</Text>
                  )}
                </View>
              </View>
            ))
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },

  header: {
    flexDirection: "row", alignItems: "center",
    paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 40 : 16,
    paddingBottom: 16, backgroundColor: "#fff",
    borderBottomWidth: 1, borderBottomColor: "#F3F4F6",
  },
  backBtn: { marginRight: 12 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: "700", color: "#111827" },
  pulseBtn: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#EEF2FF", paddingHorizontal: 12, paddingVertical: 7,
    borderRadius: 20,
  },
  pulseBtnText: { fontSize: 13, fontWeight: "700", color: "#2563EB" },

  scroll: { padding: 20, paddingBottom: 40 },

  profileCard: {
    backgroundColor: "#fff", borderRadius: 24, padding: 28,
    alignItems: "center", marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06, shadowRadius: 8, elevation: 3,
  },
  avatar: {
    width: 80, height: 80, borderRadius: 40,
    alignItems: "center", justifyContent: "center", marginBottom: 14,
  },
  avatarText: { fontSize: 32, fontWeight: "900", color: "#fff" },
  memberName: { fontSize: 22, fontWeight: "800", color: "#111827", marginBottom: 4 },
  memberEmail: { fontSize: 13, color: "#9CA3AF", marginBottom: 14 },
  roleBadge: {
    flexDirection: "row", alignItems: "center", gap: 5,
    backgroundColor: "#F3F4F6", paddingHorizontal: 14, paddingVertical: 7, borderRadius: 20,
  },
  roleBadgeOwner: { backgroundColor: "#EEF2FF" },
  roleText: { fontSize: 13, fontWeight: "700", color: "#6B7280" },
  roleTextOwner: { color: "#4F46E5" },

  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 16,
    shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827", marginBottom: 16 },
  cardHeaderRow: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardCount: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },

  statsRow: { flexDirection: "row", marginBottom: 20 },
  statBox: { flex: 1, alignItems: "center" },
  statNum: { fontSize: 28, fontWeight: "900", color: "#111827" },
  statLabel: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", marginTop: 2 },

  progressLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 8 },
  progressLabel: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
  progressPercent: { fontSize: 12, fontWeight: "700", color: "#2563EB" },
  progressBg: { height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, borderRadius: 4 },

  taskRow: { flexDirection: "row", alignItems: "center", gap: 10, marginBottom: 12 },
  taskDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#2563EB", flexShrink: 0 },
  taskInfo: { flex: 1 },
  taskTitle: { fontSize: 14, fontWeight: "600", color: "#111827" },
  taskProject: { fontSize: 11, color: "#9CA3AF", marginTop: 2 },
  priBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
  priText: { fontSize: 11, fontWeight: "700" },

  emptyText: { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingVertical: 8 },
});
