import React, { useState, useEffect } from "react";
import {
  View, Text, StyleSheet, ScrollView, Pressable,
  ActivityIndicator, SafeAreaView,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.128:5000";

const AVATAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

const BAR_DATA = [40, 70, 45, 90, 65, 80, 50];

export default function PulseScreen() {
  const [projects, setProjects] = useState<any[]>([]);
  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [members, setMembers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/api/project/my-projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      const list = data.projects || [];
      setProjects(list);
      if (list.length > 0) {
        setSelectedProject(list[0]);
        setMembers(list[0].members || []);
      }
    } catch (e) {
      console.log("Pulse hata:", e);
    } finally {
      setIsLoading(false);
    }
  };

  const selectProject = (proj: any) => {
    setSelectedProject(proj);
    setMembers(proj.members || []);
  };

  const getMemberData = () => members.map((m, i) => {
    const total = 10 + (i % 3);
    const done = 5 + (i % 5);
    return { ...m, total, done, score: Math.round((done / total) * 100) };
  }).sort((a, b) => b.done - a.done);

  const membersData = getMemberData();
  const totalCompleted = membersData.reduce((acc, m) => acc + m.done, 0);

  if (isLoading) return (
    <View style={styles.loadingContainer}>
      <ActivityIndicator size="large" color="#2563EB" />
    </View>
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* Header */}
        <View style={styles.header}>
          <View style={styles.headerIconBox}>
            <MaterialIcons name="show-chart" size={22} color="#fff" />
          </View>
          <View>
            <Text style={styles.headerTitle}>
              Pulse / <Text style={styles.headerProject}>{selectedProject?.title || "Proje Seçin"}</Text>
            </Text>
            <Text style={styles.headerSub}>HAFTALIK TAKIM NABZI</Text>
          </View>
        </View>

        {/* Proje Seçici */}
        {projects.length > 1 && (
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectPicker}>
            {projects.map(p => (
              <Pressable
                key={p.id}
                style={[styles.projectChip, selectedProject?.id === p.id && styles.projectChipActive]}
                onPress={() => selectProject(p)}
              >
                <Text style={[styles.projectChipText, selectedProject?.id === p.id && styles.projectChipTextActive]}>
                  {p.title}
                </Text>
              </Pressable>
            ))}
          </ScrollView>
        )}

        {/* Haftanın Toplamı */}
        <View style={styles.totalCard}>
          <Text style={styles.totalCardLabel}>HAFTANIN TOPLAMI</Text>
          <View style={styles.totalCardRow}>
            <Text style={styles.totalCardNumber}>{totalCompleted}</Text>
            <Text style={styles.totalCardUnit}>GÖREV</Text>
          </View>
          <Text style={styles.totalCardSub}>Bu hafta ekip ivmesi %12 arttı</Text>
          <MaterialIcons name="bolt" size={80} color="rgba(255,255,255,0.1)" style={styles.totalCardIcon} />
        </View>

        {/* Ekip Üyeleri */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="people" size={18} color="#6B7280" />
            <Text style={styles.cardTitle}>Ekip Üyeleri</Text>
            <Text style={styles.cardCount}>{membersData.length}</Text>
          </View>
          {membersData.length === 0 ? (
            <Text style={styles.emptyText}>Henüz üye yok</Text>
          ) : (
            membersData.map((m, i) => (
              <View key={m.id} style={styles.memberRow}>
                <View style={[styles.memberAvatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                  <Text style={styles.memberAvatarText}>{m.name?.charAt(0).toUpperCase() || "?"}</Text>
                </View>
                <View style={styles.memberInfo}>
                  <Text style={styles.memberName}>{m.name}</Text>
                  <Text style={styles.memberDone}>{m.done} Görev Tamamlandı</Text>
                </View>
                <View style={styles.activeDot} />
              </View>
            ))
          )}
        </View>

        {/* En Aktif Kullanıcılar */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="emoji-events" size={18} color="#F59E0B" />
            <Text style={styles.cardTitle}>En Aktif Kullanıcılar</Text>
          </View>
          {membersData.slice(0, 4).map((m, i) => (
            <View key={m.id} style={styles.performanceRow}>
              <View style={styles.performanceTop}>
                <Text style={styles.performanceName}>{m.name}</Text>
                <Text style={styles.performanceScore}>%{m.score}</Text>
              </View>
              <View style={styles.progressBg}>
                <View style={[styles.progressFill, { width: `${m.score}%` as any }]} />
              </View>
            </View>
          ))}
          {membersData.length === 0 && <Text style={styles.emptyText}>Henüz veri yok</Text>}
        </View>

        {/* Aktivite Grafiği */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <MaterialIcons name="trending-up" size={18} color="#10B981" />
            <Text style={styles.cardTitle}>Aktivite Grafiği</Text>
          </View>
          <View style={styles.barChart}>
            {BAR_DATA.map((h, i) => (
              <View key={i} style={styles.barCol}>
                <View style={styles.barBg}>
                  <View style={[styles.barFill, { height: `${h}%` as any }]} />
                </View>
                <Text style={styles.barLabel}>G{i + 1}</Text>
              </View>
            ))}
          </View>
          <Text style={styles.barSubLabel}>SON 7 GÜNLÜK GÖREV DAĞILIMI</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  loadingContainer: { flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: "#F8FAFC" },
  scroll: { padding: 20, paddingBottom: 40 },

  header: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 },
  headerIconBox: { width: 44, height: 44, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
  headerProject: { color: "#2563EB" },
  headerSub: { fontSize: 10, fontWeight: "700", color: "#9CA3AF", letterSpacing: 1, marginTop: 2 },

  projectPicker: { gap: 8, marginBottom: 20 },
  projectChip: { paddingHorizontal: 14, paddingVertical: 8, backgroundColor: "#fff", borderRadius: 20, borderWidth: 1, borderColor: "#E5E7EB" },
  projectChipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
  projectChipText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
  projectChipTextActive: { color: "#fff" },

  totalCard: {
    backgroundColor: "#2563EB", borderRadius: 24, padding: 24,
    marginBottom: 16, overflow: "hidden", position: "relative",
  },
  totalCardLabel: { fontSize: 10, fontWeight: "700", color: "rgba(255,255,255,0.7)", letterSpacing: 1, marginBottom: 8 },
  totalCardRow: { flexDirection: "row", alignItems: "baseline", gap: 8 },
  totalCardNumber: { fontSize: 56, fontWeight: "900", color: "#fff" },
  totalCardUnit: { fontSize: 14, fontWeight: "700", color: "rgba(255,255,255,0.7)" },
  totalCardSub: { fontSize: 12, color: "rgba(255,255,255,0.6)", marginTop: 8 },
  totalCardIcon: { position: "absolute", bottom: -10, right: -10 },

  card: {
    backgroundColor: "#fff", borderRadius: 20, padding: 20,
    marginBottom: 16, shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
  },
  cardHeader: { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 16 },
  cardTitle: { flex: 1, fontSize: 15, fontWeight: "700", color: "#111827" },
  cardCount: { fontSize: 13, fontWeight: "600", color: "#9CA3AF" },

  memberRow: { flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 14 },
  memberAvatar: { width: 44, height: 44, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  memberAvatarText: { fontSize: 18, fontWeight: "800", color: "#fff" },
  memberInfo: { flex: 1 },
  memberName: { fontSize: 14, fontWeight: "700", color: "#111827" },
  memberDone: { fontSize: 11, fontWeight: "600", color: "#9CA3AF", marginTop: 2 },
  activeDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },

  performanceRow: { marginBottom: 14 },
  performanceTop: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
  performanceName: { fontSize: 13, fontWeight: "700", color: "#111827" },
  performanceScore: { fontSize: 14, fontWeight: "800", color: "#2563EB" },
  progressBg: { height: 8, backgroundColor: "#F3F4F6", borderRadius: 4, overflow: "hidden" },
  progressFill: { height: 8, backgroundColor: "#2563EB", borderRadius: 4 },

  barChart: { flexDirection: "row", alignItems: "flex-end", height: 120, gap: 6, marginBottom: 12 },
  barCol: { flex: 1, alignItems: "center", height: "100%" },
  barBg: { flex: 1, width: "100%", justifyContent: "flex-end", backgroundColor: "#F3F4F6", borderRadius: 6, overflow: "hidden" },
  barFill: { width: "100%", backgroundColor: "#2563EB", borderRadius: 6 },
  barLabel: { fontSize: 9, fontWeight: "700", color: "#9CA3AF", marginTop: 4 },
  barSubLabel: { fontSize: 10, fontWeight: "700", color: "#9CA3AF", textAlign: "center", letterSpacing: 1 },

  emptyText: { fontSize: 13, color: "#9CA3AF", textAlign: "center", paddingVertical: 12 },
});
