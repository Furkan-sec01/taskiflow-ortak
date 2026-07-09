import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    Pressable,
    TextInput,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { IconSymbol } from "@/components/ui/icon-symbol";

/* ── filter chips ── */
const FILTERS = ["Tümü", "Bugün", "Yaklaşan", "Tamamlanan"] as const;
type Filter = (typeof FILTERS)[number];

/* ── mock data ── */
const ALL_TASKS = [
    {
        id: "1",
        title: "Login sayfası tasarımı",
        project: "Mobil Uygulama",
        priority: "HIGH" as const,
        due: "Bugün",
        done: false,
    },
    {
        id: "2",
        title: "Veritabanı şeması güncelle",
        project: "API Entegrasyonu",
        priority: "MEDIUM" as const,
        due: "Yarın",
        done: false,
    },
    {
        id: "3",
        title: "Kullanıcı testleri yaz",
        project: "Web Sitesi",
        priority: "LOW" as const,
        due: "3 gün",
        done: false,
    },
    {
        id: "4",
        title: "Dashboard istatistikleri",
        project: "Mobil Uygulama",
        priority: "HIGH" as const,
        due: "Bugün",
        done: false,
    },
    {
        id: "5",
        title: "Bildirim sistemi entegrasyonu",
        project: "API Entegrasyonu",
        priority: "MEDIUM" as const,
        due: "5 gün",
        done: false,
    },
    {
        id: "6",
        title: "Ana sayfa responsive düzenleme",
        project: "Web Sitesi",
        priority: "LOW" as const,
        due: "—",
        done: true,
    },
    {
        id: "7",
        title: "Proje detay sayfası",
        project: "Mobil Uygulama",
        priority: "MEDIUM" as const,
        due: "—",
        done: true,
    },
];

const PRIORITY_MAP = {
    HIGH: { label: "Yüksek", color: "#EF4444", bg: "#FEE2E2" },
    MEDIUM: { label: "Orta", color: "#F59E0B", bg: "#FEF3C7" },
    LOW: { label: "Düşük", color: "#10B981", bg: "#D1FAE5" },
};

export default function TasksScreen() {
    const [filter, setFilter] = useState<Filter>("Tümü");
    const [search, setSearch] = useState("");

    const filtered = ALL_TASKS.filter((t) => {
        if (filter === "Bugün") return t.due === "Bugün" && !t.done;
        if (filter === "Yaklaşan") return !t.done && t.due !== "—";
        if (filter === "Tamamlanan") return t.done;
        return true;
    }).filter(
        (t) =>
            t.title.toLowerCase().includes(search.toLowerCase()) ||
            t.project.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <SafeAreaView style={styles.safe} edges={["top"]}>
            {/* ── Header ── */}
            <View style={styles.header}>
                <Text style={styles.headerTitle}>Görevler</Text>
                <Text style={styles.headerSub}>{ALL_TASKS.filter((t) => !t.done).length} aktif görev</Text>
            </View>

            {/* ── Search ── */}
            <View style={styles.searchWrap}>
                <IconSymbol name="magnifyingglass" size={18} color="#9CA3AF" />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Görev veya proje ara..."
                    placeholderTextColor="#9CA3AF"
                    value={search}
                    onChangeText={setSearch}
                />
            </View>

            {/* ── Filters ── */}
            <ScrollView
                horizontal
                directionalLockEnabled
                nestedScrollEnabled
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
            >
                {FILTERS.map((f) => (
                    <Pressable
                        key={f}
                        style={[styles.filterChip, filter === f && styles.filterChipActive]}
                        onPress={() => setFilter(f)}
                    >
                        <Text style={[styles.filterText, filter === f && styles.filterTextActive]}>{f}</Text>
                    </Pressable>
                ))}
            </ScrollView>

            {/* ── Task List ── */}
            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
                alwaysBounceVertical={true}
            >
                {filtered.length === 0 ? (
                    <View style={styles.emptyState}>
                        <IconSymbol name="tray" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyTitle}>Görev bulunamadı</Text>
                        <Text style={styles.emptySub}>Bu filtrede görev yok.</Text>
                    </View>
                ) : (
                    filtered.map((t) => {
                        const pri = PRIORITY_MAP[t.priority];
                        return (
                            <Pressable key={t.id} style={[styles.taskCard, t.done && styles.taskCardDone]}>
                                {/* checkbox */}
                                <Pressable style={[styles.checkbox, t.done && styles.checkboxDone]}>
                                    {t.done && <IconSymbol name="checkmark" size={14} color="#fff" />}
                                </Pressable>

                                <View style={styles.taskBody}>
                                    <Text style={[styles.taskTitle, t.done && styles.taskTitleDone]}>
                                        {t.title}
                                    </Text>

                                    <View style={styles.taskMeta}>
                                        <Text style={styles.taskProject}>{t.project}</Text>

                                        <View style={[styles.priorityBadge, { backgroundColor: pri.bg }]}>
                                            <Text style={[styles.priorityText, { color: pri.color }]}>{pri.label}</Text>
                                        </View>
                                    </View>
                                </View>

                                {!t.done && (
                                    <View style={styles.dueBadge}>
                                        <Text style={styles.dueText}>{t.due}</Text>
                                    </View>
                                )}
                            </Pressable>
                        );
                    })
                )}
                <View style={{ height: 80 }} />
            </ScrollView>

            {/* ── FAB ── */}
            <Pressable style={styles.fab}>
                <IconSymbol name="plus" size={26} color="#fff" />
            </Pressable>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F8FAFC" },

    /* Header */
    header: {
        paddingHorizontal: 20,
        paddingTop: 16,
        paddingBottom: 6,
    },
    headerTitle: { fontSize: 28, fontWeight: "800", color: "#111827" },
    headerSub: { fontSize: 13, color: "#6B7280", marginTop: 4, fontWeight: "500" },

    /* Search */
    searchWrap: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        marginHorizontal: 20,
        marginTop: 16,
        borderRadius: 12,
        paddingHorizontal: 14,
        height: 46,
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    searchInput: {
        flex: 1,
        marginLeft: 10,
        fontSize: 14,
        color: "#111827",
    },

    /* Filters */
    filterRow: { paddingHorizontal: 20, paddingVertical: 14, gap: 8 },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 20,
        backgroundColor: "#fff",
        borderWidth: 1,
        borderColor: "#E5E7EB",
    },
    filterChipActive: {
        backgroundColor: "#2563EB",
        borderColor: "#2563EB",
    },
    filterText: { fontSize: 13, fontWeight: "600", color: "#6B7280" },
    filterTextActive: { color: "#fff" },

    /* Task List */
    list: { flex: 1 },
    listContent: { paddingHorizontal: 20 },

    /* Task Card */
    taskCard: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: "#fff",
        borderRadius: 16,
        padding: 14,
        marginBottom: 10,
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.04,
        shadowRadius: 6,
        elevation: 2,
    },
    taskCardDone: { opacity: 0.6 },

    checkbox: {
        width: 24,
        height: 24,
        borderRadius: 12,
        borderWidth: 2,
        borderColor: "#D1D5DB",
        alignItems: "center",
        justifyContent: "center",
        marginRight: 12,
    },
    checkboxDone: {
        backgroundColor: "#10B981",
        borderColor: "#10B981",
    },

    taskBody: { flex: 1 },
    taskTitle: { fontSize: 14, fontWeight: "700", color: "#111827" },
    taskTitleDone: { textDecorationLine: "line-through", color: "#9CA3AF" },

    taskMeta: { flexDirection: "row", alignItems: "center", marginTop: 6, gap: 8 },
    taskProject: { fontSize: 12, color: "#6B7280" },

    priorityBadge: {
        paddingHorizontal: 8,
        paddingVertical: 2,
        borderRadius: 6,
    },
    priorityText: { fontSize: 11, fontWeight: "700" },

    dueBadge: {
        backgroundColor: "#F3F4F6",
        borderRadius: 8,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    dueText: { fontSize: 12, fontWeight: "600", color: "#374151" },

    /* Empty */
    emptyState: { alignItems: "center", paddingTop: 60 },
    emptyTitle: { fontSize: 16, fontWeight: "700", color: "#6B7280", marginTop: 12 },
    emptySub: { fontSize: 13, color: "#9CA3AF", marginTop: 4 },

    /* FAB */
    fab: {
        position: "absolute",
        bottom: 24,
        right: 20,
        width: 56,
        height: 56,
        borderRadius: 28,
        backgroundColor: "#2563EB",
        alignItems: "center",
        justifyContent: "center",
        shadowColor: "#2563EB",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.35,
        shadowRadius: 10,
        elevation: 8,
    },
});
