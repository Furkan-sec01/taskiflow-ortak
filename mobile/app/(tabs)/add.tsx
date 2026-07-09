import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
    Alert,
    ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.43.19:5000/api";

const STATUS_OPTIONS = [
    { label: "Yapılacak", color: "#F59E0B" },
    { label: "Devam Ediyor", color: "#2563EB" },
    { label: "Tamamlandı", color: "#10B981" },
];

const AVATAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function AddTaskScreen() {
    const router = useRouter();
    const [taskName, setTaskName] = useState("");
    const [taskDesc, setTaskDesc] = useState("");
    const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
    const [selectedStatus, setSelectedStatus] = useState("Yapılacak");
    const [selectedAssigneeId, setSelectedAssigneeId] = useState<string | null>(null);
    const [projects, setProjects] = useState<any[]>([]);
    const [members, setMembers] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        loadData();
    }, []);

    const loadData = async () => {
        try {
            const token = await AsyncStorage.getItem("token");

            // Projeleri çek
            const projRes = await fetch(`${API_URL}/project`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const projData = await projRes.json();
            if (Array.isArray(projData)) {
                setProjects(projData);
                if (projData.length > 0) setSelectedProjectId(projData[0].id);
            }

            // Organizasyonu ve üyeleri çek
            const orgRes = await fetch(`${API_URL}/organizations`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const orgData = await orgRes.json();
            const orgId = Array.isArray(orgData) ? orgData[0]?.id : orgData?.id;

            if (orgId) {
                const membersRes = await fetch(`${API_URL}/organizations/${orgId}/members`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const membersData = await membersRes.json();
                if (Array.isArray(membersData)) setMembers(membersData);
            }
        } catch (e) {
            console.log("Veri yükleme hatası:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        console.log("handleSave çalıştı, proje:", selectedProjectId);
        if (!taskName.trim()) { Alert.alert("Hata", "Görev adı boş olamaz."); return; }
        if (!selectedProjectId) { Alert.alert("Hata", "Proje seçmelisiniz."); return; }

        try {
            setSaving(true);
            const token = await AsyncStorage.getItem("token");
console.log("Kolonlar çekiliyor:", `${API_URL}/column/project/${selectedProjectId}`);
            // Önce projenin kolonlarını çek
           const colRes = await fetch(`${API_URL}/project/${selectedProjectId}/board`,  {
                headers: { Authorization: `Bearer ${token}` },
            });
            const colData = await colRes.json();
            console.log("Board data:", JSON.stringify(colData));
            const columns = Array.isArray(colData) ? colData : colData.columns || colData.board?.columns || [];

            let columnId = null;
            if (columns.length > 0) {
                // Seçilen duruma göre kolon bul
                const statusMap: Record<string, string[]> = {
                    "Yapılacak": ["yapılacak", "todo", "to do", "to-do"],
                    "Devam Ediyor": ["devam", "progress", "in progress", "doing"],
                    "Tamamlandı": ["tamamlandı", "done", "completed", "finished"],
                };
                const keywords = statusMap[selectedStatus] || [];
                const matchedCol = columns.find((c: any) =>
                    keywords.some(k => (c.title || c.name || "").toLowerCase().includes(k))
                );
                columnId = matchedCol?.id || columns[0]?.id;
            }

            if (!columnId) { Alert.alert("Hata", "Proje kolonları bulunamadı. Önce projeyi açıp kolon ekleyin."); return; }

            const res = await fetch(`${API_URL}/task`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({
                    title: taskName.trim(),
                    description: taskDesc.trim(),
                    columnId,
                    assignedTo: selectedAssigneeId || undefined,
                }),
            });

            const data = await res.json();
            if (res.ok) {
                Alert.alert("Başarılı ✅", `"${taskName}" görevi eklendi.`, [
                    { text: "Tamam", onPress: () => router.back() },
                ]);
            } else {
                Alert.alert("Hata", data.error || "Görev eklenemedi.");
            }
        } catch (e) {
            Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        } finally {
            setSaving(false);
        }
    };

    const selectedProject = projects.find(p => p.id === selectedProjectId);

    if (loading) {
        return (
            <SafeAreaView style={styles.safe}>
                <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
                    <ActivityIndicator size="large" color="#2563EB" />
                </View>
            </SafeAreaView>
        );
    }

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
                <View style={styles.header}>
                    <Pressable onPress={() => router.back()}>
                        <Text style={styles.cancelLink}>İptal</Text>
                    </Pressable>
                    <Text style={styles.headerTitle}>Yeni Görev</Text>
                    <Pressable onPress={handleSave} disabled={saving}>
                        <Text style={styles.saveLink}>{saving ? "..." : "Kaydet"}</Text>
                    </Pressable>
                </View>

                <Text style={styles.label}>Görev Adı</Text>
                <TextInput
                    style={styles.input}
                    placeholder="Görev adını yaz..."
                    placeholderTextColor="#9CA3AF"
                    value={taskName}
                    onChangeText={setTaskName}
                    autoFocus
                />

                <Text style={styles.label}>Açıklama (isteğe bağlı)</Text>
                <TextInput
                    style={[styles.input, { height: 80, paddingTop: 12 }]}
                    placeholder="Görev açıklaması..."
                    placeholderTextColor="#9CA3AF"
                    value={taskDesc}
                    onChangeText={setTaskDesc}
                    multiline
                    textAlignVertical="top"
                />

                <Text style={styles.label}>Proje</Text>
                <View style={styles.chipsRow}>
                    {projects.map((p, i) => (
                        <Pressable
                            key={p.id}
                            style={[styles.projectChip, selectedProjectId === p.id && { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length], borderColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}
                            onPress={() => { setSelectedProjectId(p.id); setSelectedAssigneeId(null); }}
                        >
                            <View style={[styles.projectDot, { backgroundColor: selectedProjectId === p.id ? "#fff" : AVATAR_COLORS[i % AVATAR_COLORS.length] }]} />
                            <Text style={[styles.projectChipText, selectedProjectId === p.id && { color: "#fff" }]}>{p.title || p.name}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>Kişi Ata</Text>
                <View style={styles.chipsRow}>
                    <Pressable style={[styles.chip, !selectedAssigneeId && styles.chipActive]} onPress={() => setSelectedAssigneeId(null)}>
                        <Text style={[styles.chipText, !selectedAssigneeId && styles.chipTextActive]}>Yok</Text>
                    </Pressable>
                    {members.map((m, i) => (
                        <Pressable key={m.id} style={[styles.chip, selectedAssigneeId === m.id && styles.chipActive]} onPress={() => setSelectedAssigneeId(m.id)}>
                            <View style={[styles.miniAvatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                                <Text style={styles.miniAvatarText}>{m.name?.charAt(0).toUpperCase() || "?"}</Text>
                            </View>
                            <Text style={[styles.chipText, selectedAssigneeId === m.id && styles.chipTextActive]}>{m.name}</Text>
                        </Pressable>
                    ))}
                </View>

                <Text style={styles.label}>Durum</Text>
                <View style={styles.chipsRow}>
                    {STATUS_OPTIONS.map((s) => (
                        <Pressable
                            key={s.label}
                            style={[styles.statusChip, { borderColor: s.color }, selectedStatus === s.label && { backgroundColor: s.color }]}
                            onPress={() => setSelectedStatus(s.label)}
                        >
                            <Text style={[styles.statusChipText, { color: s.color }, selectedStatus === s.label && { color: "#fff" }]}>{s.label}</Text>
                        </Pressable>
                    ))}
                </View>

                <Pressable style={[styles.saveBtn, saving && { opacity: 0.6 }]} onPress={handleSave} disabled={saving}>
                    {saving ? <ActivityIndicator color="#fff" /> : <Text style={styles.saveBtnText}>Görev Ekle</Text>}
                </Pressable>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8FAFC" },
    content: { padding: 20, paddingBottom: 40 },
    header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 28 },
    cancelLink: { fontSize: 15, fontWeight: "600", color: "#6B7280" },
    headerTitle: { fontSize: 18, fontWeight: "800", color: "#111827" },
    saveLink: { fontSize: 15, fontWeight: "700", color: "#2563EB" },
    label: { fontSize: 14, fontWeight: "700", color: "#374151", marginBottom: 10, marginTop: 20 },
    input: { height: 52, borderRadius: 14, borderWidth: 1.5, borderColor: "#E5E7EB", paddingHorizontal: 16, backgroundColor: "#fff", fontSize: 15, color: "#111827" },
    chipsRow: { flexDirection: "row", flexWrap: "wrap", gap: 10 },
    projectChip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff", gap: 8 },
    projectDot: { width: 8, height: 8, borderRadius: 4 },
    projectChipText: { fontSize: 13, fontWeight: "700", color: "#374151" },
    chip: { flexDirection: "row", alignItems: "center", paddingHorizontal: 14, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5, borderColor: "#E5E7EB", backgroundColor: "#fff", gap: 6 },
    chipActive: { backgroundColor: "#2563EB", borderColor: "#2563EB" },
    chipText: { fontSize: 13, fontWeight: "600", color: "#374151" },
    chipTextActive: { color: "#fff" },
    miniAvatar: { width: 22, height: 22, borderRadius: 11, alignItems: "center", justifyContent: "center" },
    miniAvatarText: { color: "#fff", fontSize: 10, fontWeight: "800" },
    statusChip: { paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20, borderWidth: 1.5 },
    statusChipText: { fontSize: 13, fontWeight: "700" },
    saveBtn: { height: 54, borderRadius: 16, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", marginTop: 36, elevation: 6 },
    saveBtnText: { color: "#fff", fontSize: 16, fontWeight: "800" },
});