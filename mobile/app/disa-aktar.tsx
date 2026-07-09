import React, { useState, useCallback, useEffect } from "react";
import {
    View, Text, StyleSheet, SafeAreaView, ScrollView,
    Pressable, ActivityIndicator, Alert, Platform,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API = "http://192.168.43.19:5000/api";

async function apiFetch(path: string, options: any = {}) {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${API}${path}`, {
        ...options,
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
            ...options.headers,
        },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Hata");
    return data;
}

const EXPORT_OPTIONS = [
    { id: "json", icon: "code", label: "JSON", desc: "Ham veri formatı, geliştirici dostu", color: "#6366F1", bg: "#EEF2FF" },
    { id: "csv", icon: "table-chart", label: "CSV", desc: "Excel ve Google Sheets ile uyumlu", color: "#22C55E", bg: "#DCFCE7" },
    { id: "txt", icon: "description", label: "TXT", desc: "Düz metin formatı, evrensel", color: "#F59E0B", bg: "#FEF3C7" },
];

export default function DisaAktarScreen() {
    const router = useRouter();
    const { projectId } = useLocalSearchParams<{ projectId: string }>();
    const [report, setReport] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [exporting, setExporting] = useState<string | null>(null);

    const fetchReport = useCallback(async () => {
        try {
            const data = await apiFetch(`/reports/${projectId}`);
            setReport(data);
        } catch (err: any) {
            Alert.alert("Hata", err.message);
        } finally {
            setLoading(false);
        }
    }, [projectId]);

    useEffect(() => { fetchReport(); }, [fetchReport]);

    const generateJSON = (data: any) => {
        return JSON.stringify({
            project: data.projectTitle,
            exportDate: new Date().toISOString(),
            summary: {
                totalTasks: data.totalTasks,
                completedTasks: data.completedCount,
                completionRate: data.completionRate,
                overdueTasks: data.overdueTasks,
            },
            columns: data.columnStats,
            priorities: data.priorityStats,
            members: data.memberStats,
            tasks: data.tasks,
        }, null, 2);
    };

    const generateCSV = (data: any) => {
        const rows = [
            ["Görev", "Kolon", "Öncelik", "Atanan", "Son Tarih", "Oluşturulma"],
            ...(data.tasks || []).map((t: any) => [
                t.title,
                t.columnTitle,
                t.priority,
                t.assignee?.name || t.assignee?.email || "Atanmadı",
                t.dueDate ? new Date(t.dueDate).toLocaleDateString("tr-TR") : "-",
                new Date(t.createdAt).toLocaleDateString("tr-TR"),
            ]),
        ];
        return rows.map(r => r.map(c => `"${c}"`).join(",")).join("\n");
    };

    const generateTXT = (data: any) => {
        return `
PROJE RAPORU: ${data.projectTitle}
Tarih: ${new Date().toLocaleDateString("tr-TR")}
${"=".repeat(40)}

ÖZET
----
Toplam Görev: ${data.totalTasks}
Tamamlanan: ${data.completedCount}
Tamamlanma Oranı: %${data.completionRate}
Geciken: ${data.overdueTasks}

KOLON DAĞILIMI
--------------
${(data.columnStats || []).map((c: any) => `${c.title}: ${c.taskCount} görev (%${c.percentage})`).join("\n")}

ÖNCELİK DAĞILIMI
----------------
Yüksek: ${data.priorityStats?.HIGH || 0}
Orta: ${data.priorityStats?.MEDIUM || 0}
Düşük: ${data.priorityStats?.LOW || 0}

ÜYE BAZLI GÖREVLER
------------------
${(data.memberStats || []).map((m: any) => `${m.name}: ${m.count} görev`).join("\n") || "Veri yok"}

GÖREV LİSTESİ
-------------
${(data.tasks || []).map((t: any, i: number) =>
    `${i + 1}. ${t.title}\n   Kolon: ${t.columnTitle} | Öncelik: ${t.priority} | Atanan: ${t.assignee?.name || "Atanmadı"}`
).join("\n")}
`.trim();
    };

    const handleExport = async (type: string) => {
        if (!report) return;
        setExporting(type);
        try {
            await new Promise(res => setTimeout(res, 800));

            let content = "";
            if (type === "json") content = generateJSON(report);
            else if (type === "csv") content = generateCSV(report);
            else content = generateTXT(report);

            Alert.alert(
                "✅ Dışa Aktarıldı",
                `${report.projectTitle} projesi ${type.toUpperCase()} formatında hazırlandı.\n\n${content.slice(0, 200)}...`,
                [{ text: "Tamam" }]
            );
        } catch (err: any) {
            Alert.alert("Hata", err.message);
        } finally {
            setExporting(null);
        }
    };

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={styles.loadingBox}>
                    <ActivityIndicator color="#6366F1" size="large" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.header}>
                <Pressable onPress={() => router.back()} style={styles.backBtn}>
                    <MaterialIcons name="arrow-back" size={24} color="#111827" />
                </Pressable>
                <Text style={styles.headerTitle}>Dışa Aktar</Text>
                <View style={{ width: 24 }} />
            </View>

            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>

                {/* Proje Özeti */}
                <View style={styles.summaryCard}>
                    <MaterialIcons name="folder" size={32} color="#6366F1" />
                    <View style={{ flex: 1, marginLeft: 12 }}>
                        <Text style={styles.summaryTitle}>{report?.projectTitle}</Text>
                        <Text style={styles.summarySub}>
                            {report?.totalTasks} görev · %{report?.completionRate} tamamlandı
                        </Text>
                    </View>
                </View>

                {/* Format Seçenekleri */}
                <Text style={styles.sectionTitle}>Format Seçin</Text>
                {EXPORT_OPTIONS.map((opt) => (
                    <Pressable
                        key={opt.id}
                        style={[styles.exportCard, exporting === opt.id && { opacity: 0.7 }]}
                        onPress={() => handleExport(opt.id)}
                        disabled={!!exporting}
                    >
                        <View style={[styles.exportIconBox, { backgroundColor: opt.bg }]}>
                            <MaterialIcons name={opt.icon as any} size={24} color={opt.color} />
                        </View>
                        <View style={{ flex: 1, marginLeft: 14 }}>
                            <Text style={styles.exportLabel}>{opt.label}</Text>
                            <Text style={styles.exportDesc}>{opt.desc}</Text>
                        </View>
                        {exporting === opt.id ? (
                            <ActivityIndicator color={opt.color} size="small" />
                        ) : (
                            <View style={[styles.exportBtn, { backgroundColor: opt.bg }]}>
                                <MaterialIcons name="download" size={18} color={opt.color} />
                            </View>
                        )}
                    </Pressable>
                ))}

                {/* İstatistik Özeti */}
                <Text style={styles.sectionTitle}>Dışa Aktarılacak Veriler</Text>
                <View style={styles.dataCard}>
                    {[
                        { icon: "assignment", label: "Görevler", value: `${report?.totalTasks || 0} kayıt` },
                        { icon: "view-column", label: "Kolonlar", value: `${report?.columnStats?.length || 0} kolon` },
                        { icon: "people", label: "Üye İstatistikleri", value: `${report?.memberStats?.length || 0} üye` },
                        { icon: "bar-chart", label: "Öncelik Dağılımı", value: "3 kategori" },
                    ].map((item, i) => (
                        <View key={i} style={styles.dataRow}>
                            <MaterialIcons name={item.icon as any} size={18} color="#6366F1" />
                            <Text style={styles.dataLabel}>{item.label}</Text>
                            <Text style={styles.dataValue}>{item.value}</Text>
                        </View>
                    ))}
                </View>

                <View style={{ height: 32 }} />
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F7F9FC" },
    header: {
        flexDirection: "row", alignItems: "center", justifyContent: "space-between",
        paddingHorizontal: 20,
        paddingTop: Platform.OS === "android" ? 40 : 16,
        paddingBottom: 16,
        backgroundColor: "#fff",
        borderBottomWidth: 1, borderBottomColor: "#E5E7EB",
    },
    backBtn: { padding: 4 },
    headerTitle: { fontSize: 20, fontWeight: "900", color: "#111827" },
    loadingBox: { flex: 1, alignItems: "center", justifyContent: "center" },
    content: { padding: 16 },
    summaryCard: {
        backgroundColor: "#fff", borderRadius: 20, padding: 20, marginBottom: 20,
        flexDirection: "row", alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05, shadowRadius: 8, elevation: 2,
    },
    summaryTitle: { fontSize: 16, fontWeight: "900", color: "#111827" },
    summarySub: { fontSize: 12, color: "#9CA3AF", marginTop: 4 },
    sectionTitle: { fontSize: 14, fontWeight: "900", color: "#374151", marginBottom: 12, marginTop: 4 },
    exportCard: {
        backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 12,
        flexDirection: "row", alignItems: "center",
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    exportIconBox: { width: 48, height: 48, borderRadius: 14, alignItems: "center", justifyContent: "center" },
    exportLabel: { fontSize: 15, fontWeight: "800", color: "#111827" },
    exportDesc: { fontSize: 12, color: "#9CA3AF", marginTop: 2 },
    exportBtn: { width: 36, height: 36, borderRadius: 10, alignItems: "center", justifyContent: "center" },
    dataCard: {
        backgroundColor: "#fff", borderRadius: 16, padding: 16,
        shadowColor: "#000", shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04, shadowRadius: 6, elevation: 1,
    },
    dataRow: {
        flexDirection: "row", alignItems: "center", gap: 10,
        paddingVertical: 10, borderBottomWidth: 1, borderBottomColor: "#F8FAFC",
    },
    dataLabel: { flex: 1, fontSize: 13, fontWeight: "600", color: "#374151" },
    dataValue: { fontSize: 12, fontWeight: "700", color: "#6366F1" },
});
