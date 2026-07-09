import React, { useState, useEffect } from "react";
import {
    View, Text, StyleSheet, ScrollView, Pressable,
    ActivityIndicator, Dimensions,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("window");
const CARD_WIDTH = (width - 60) / 2;
const API_URL = "http://192.168.1.128:5000";

const COLORS = [
    { border: "#3B82F6" }, { border: "#EC4899" }, { border: "#10B981" },
    { border: "#F59E0B" }, { border: "#8B5CF6" }, { border: "#EF4444" },
];

export default function RaporlarScreen() {
    const router = useRouter();
    const [projects, setProjects] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => { fetchProjects(); }, []);

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_URL}/api/project`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (Array.isArray(data)) setProjects(data);
        } catch (e) {
            console.log("Projeler yüklenemedi:", e);
        } finally {
            setLoading(false);
        }
    };

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <View style={styles.header}>
                <View style={styles.headerLeft}>
                    <View style={styles.headerIconBox}>
                        <MaterialIcons name="bar-chart" size={20} color="#2563EB" />
                    </View>
                    <Text style={styles.headerTitle}>Raporlar</Text>
                </View>
                <Text style={styles.headerCount}>{projects.length} proje</Text>
            </View>

            <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
                <Text style={styles.sectionTitle}>Proje Raporları</Text>
                <Text style={styles.sectionDesc}>Detaylı raporu görüntülemek için bir projeye tıklayın.</Text>

                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={{ marginTop: 40 }} />
                ) : projects.length === 0 ? (
                    <View style={styles.emptyBox}>
                        <MaterialIcons name="bar-chart" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>Henüz proje yok.</Text>
                    </View>
                ) : (
                    <View style={styles.cardsGrid}>
                        {projects.map((project, index) => {
                            const color = COLORS[index % COLORS.length];
                            return (
                                <Pressable
                                    key={project.id}
                                    style={styles.card}
                                    onPress={() => router.push({
                                        pathname: "/proje-panosu",
                                        params: {
                                            projectId: project.id,
                                            projectName: project.title || project.name,
                                            showRapor: "true",
                                        },
                                    })}
                                >
                                    <View style={[styles.cardTopBorder, { backgroundColor: color.border }]} />
                                    <View style={styles.cardContent}>
                                        <View style={styles.cardHeader}>
                                            <View style={[styles.cardIconBox, { backgroundColor: color.border + "20" }]}>
                                                <MaterialIcons name="description" size={22} color={color.border} />
                                            </View>
                                            <View style={styles.cardTitleArea}>
                                                <Text style={styles.cardName}>{project.title || project.name}</Text>
                                                <Text style={styles.cardDate}>
                                                    {new Date(project.createdAt).toLocaleDateString("tr-TR")}
                                                </Text>
                                            </View>
                                            <MaterialIcons name="chevron-right" size={20} color="#9CA3AF" />
                                        </View>
                                        <Text style={styles.cardDesc} numberOfLines={2}>
                                            {project.description || "Proje raporu"}
                                        </Text>
                                        <View style={styles.statusRow}>
                                            <View style={styles.statusDot} />
                                            <Text style={styles.statusText}>Aktif</Text>
                                        </View>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </View>
                )}
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8FAFC" },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: "#F1F5F9" },
    headerLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
    headerIconBox: { width: 36, height: 36, borderRadius: 10, backgroundColor: "#EEF2FF", alignItems: "center", justifyContent: "center" },
    headerTitle: { fontSize: 22, fontWeight: "800", color: "#111827" },
    headerCount: { fontSize: 13, color: "#6B7280", fontWeight: "500" },
    scroll: { padding: 20, paddingBottom: 100 },
    sectionTitle: { fontSize: 24, fontWeight: "900", color: "#111827", marginBottom: 6 },
    sectionDesc: { fontSize: 14, color: "#6B7280", marginBottom: 24 },
    cardsGrid: { flexDirection: "row", flexWrap: "wrap", gap: 16 },
    card: { width: CARD_WIDTH, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", shadowColor: "#000", shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.06, shadowRadius: 8, elevation: 3 },
    cardTopBorder: { height: 4, width: "100%" },
    cardContent: { padding: 16 },
    cardHeader: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
    cardIconBox: { width: 40, height: 40, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    cardTitleArea: { flex: 1, marginLeft: 10 },
    cardName: { fontSize: 15, fontWeight: "800", color: "#111827" },
    cardDate: { fontSize: 11, color: "#6B7280", marginTop: 2 },
    cardDesc: { fontSize: 12, color: "#6B7280", lineHeight: 18, marginBottom: 14 },
    statusRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    statusDot: { width: 8, height: 8, borderRadius: 4, backgroundColor: "#10B981" },
    statusText: { fontSize: 12, fontWeight: "600", color: "#10B981" },
    emptyBox: { alignItems: "center", marginTop: 60 },
    emptyText: { marginTop: 12, color: "#9CA3AF", fontSize: 14 },
});
