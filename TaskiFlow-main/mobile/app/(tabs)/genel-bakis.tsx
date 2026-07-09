import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    SafeAreaView,
    ScrollView,
    Pressable,
    TextInput,
    Modal,
    Platform,
    ActivityIndicator,
    Alert,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL = "http://192.168.1.128:5000/api";

interface Member {
    id: string;
    name: string;
    email: string;
    role: string;
}

interface Project {
    id: string;
    name: string;
    title?: string;
    description?: string;
    createdAt: string;
    members?: Member[];
    progress?: number;
}

const AVATAR_COLORS = ["#2563EB", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#EC4899"];

export default function GenelBakisScreen() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [modalVisible, setModalVisible] = useState(false);
    const [addMemberModal, setAddMemberModal] = useState(false);
    const [projects, setProjects] = useState<Project[]>([]);
    const [loading, setLoading] = useState(true);
    const [userName, setUserName] = useState("Kullanıcı");
    const [userPlan, setUserPlan] = useState<"FREE" | "PRO" | "BUSINESS">("FREE");
    const [orgId, setOrgId] = useState<string | null>(null);
    const [members, setMembers] = useState<Member[]>([]);
    const [membersLoading, setMembersLoading] = useState(true);
    const [projectName, setProjectName] = useState("");
    const [projectDesc, setProjectDesc] = useState("");
    const [newMemberEmail, setNewMemberEmail] = useState("");
    const [addingMember, setAddingMember] = useState(false);

    useEffect(() => { loadUserAndOrg(); }, []);

    const loadUserAndOrg = async () => {
        try {
            const userData = await AsyncStorage.getItem("user");
            if (userData) {
                const user = JSON.parse(userData);
                setUserName(user.name || user.email || "Kullanıcı");
            }

            const token = await AsyncStorage.getItem("token");

            const billingRes = await fetch(`${API_URL}/payments/overview`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const billingData = await billingRes.json();

            const plan = String(billingData?.subscription?.plan || "FREE").toUpperCase();
                if (plan === "BUSINESS") {
                    setUserPlan("BUSINESS");
                } else if (plan === "PRO") {
                    setUserPlan("PRO");
                } else {
                    setUserPlan("FREE");
                }

            const res = await fetch(`${API_URL}/organizations`, {
                headers: { Authorization: `Bearer ${token}` },
            });

            const data = await res.json();
            let foundOrgId = null;

            if (Array.isArray(data) && data.length > 0) {
                foundOrgId = data[0].id;
                setOrgId(data[0].id);
            } else if (data.id) {
                foundOrgId = data.id;
                setOrgId(data.id);
            }

            if (foundOrgId) fetchMembers(foundOrgId, token!);
        } catch (e) {
            console.log("Org yükleme hatası:", e);
        } finally {
            fetchProjects();
        }
    };

    const fetchMembers = async (oid: string, token: string) => {
        try {
            setMembersLoading(true);
            const res = await fetch(`${API_URL}/organizations/${oid}/members`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (Array.isArray(data)) setMembers(data);
        } catch (e) {
            console.log("Üye yükleme hatası:", e);
        } finally {
            setMembersLoading(false);
        }
    };

    const fetchProjects = async () => {
        try {
            setLoading(true);
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_URL}/project`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();

            if (Array.isArray(data)) {
                const projectsWithProgress = await Promise.all(data.map(async (p: any) => {
                    try {
                        const boardRes = await fetch(`${API_URL}/project/${p.id}/board`, {
                            headers: { Authorization: `Bearer ${token}` },
                        });
                        const boardData = await boardRes.json();
                        const tasks = boardData.columns?.flatMap((c: any) => c.tasks || []) || [];
                        console.log("Görevler:", JSON.stringify(tasks));
                        const total = tasks.length;
                        const done = tasks.filter((t: any) => t.isCompleted === true).length;
                        const progress = total > 0 ? Math.round((done / total) * 100) : 0;
                        return { ...p, progress };
                    } catch {
                        return { ...p, progress: 0 };
                    }
                }));

                setProjects(projectsWithProgress);
            }
        } catch (e) {
            console.log("Proje yükleme hatası:", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateProject = async () => {
        const projectLimit =
            userPlan === "BUSINESS" ? Infinity :
            userPlan === "PRO" ? 10 : 2;

        if (projects.length >= projectLimit) {
            Alert.alert(
                "Limit Doldu 🚫",
                userPlan === "PRO"
                    ? "PRO planda en fazla 10 proje oluşturabilirsiniz."
                    : "Ücretsiz planda en fazla 2 proje oluşturabilirsiniz. Devam etmek için planınızı yükseltin.",
                userPlan === "PRO"
                    ? [{ text: "Tamam" }]
                    : [
                        { text: "Vazgeç", style: "cancel" },
                        {
                            text: "Ödeme Sayfasına Git",
                            onPress: () => {
                                setModalVisible(false);
                                router.push("/plans");
                            },
                        },
                    ]
            );
            return;
        }

        if (!projectName.trim()) return;
        if (!projectDesc.trim()) { Alert.alert("Hata", "Açıklama zorunludur."); return; }
        try {
    const token = await AsyncStorage.getItem("token");
    const res = await fetch(`${API_URL}/project`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: projectName, description: projectDesc, organizationId: orgId || null }),
    });
            const newProject = await res.json();

            if (newProject.project?.id || newProject.id) {
                const p = newProject.project || newProject;
                const defaultColumns = ["Yapılacak", "Devam Ediyor", "Tamamlandı"];
for (const colName of defaultColumns) {
    const colRes = await fetch(`${API_URL}/column/create/${p.id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: colName }),
    });
    const colData = await colRes.json();
    console.log(`Kolon "${colName}" sonucu:`, JSON.stringify(colData));
}
                setProjects([...projects, { ...p, progress: 0 }]);
                setProjectName("");
                setProjectDesc("");
                setModalVisible(false);
                Alert.alert("Başarılı ✅", "Proje ve kolonlar oluşturuldu!");
            } else {
                Alert.alert("Hata", newProject.error || "Proje oluşturulamadı.");
            }
        } catch (e) {
            Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        }
    };

    const handleAddMember = async () => {
        if (!newMemberEmail.trim()) return;
        if (!orgId) { Alert.alert("Hata", "Organizasyon bulunamadı."); return; }

        try {
            setAddingMember(true);
            const token = await AsyncStorage.getItem("token");
            const res = await fetch(`${API_URL}/organizations/invite`, {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ email: newMemberEmail.trim(), orgId: orgId }),
            });

            const data = await res.json();

            if (res.ok) {
                Alert.alert("Başarılı", `${newMemberEmail} organizasyona davet edildi!`);
                setNewMemberEmail("");
                setAddMemberModal(false);
                fetchMembers(orgId, token!);
            } else {
                Alert.alert("Hata", data.error || "Üye eklenemedi.");
            }
        } catch (e) {
            Alert.alert("Hata", "Sunucuya bağlanılamadı.");
        } finally {
            setAddingMember(false);
        }
    };

    const filteredProjects = projects.filter((p) =>
        (p.title || p.name || "").toLowerCase().includes(searchQuery.toLowerCase())
    );

    const activeProjects = filteredProjects.filter(p => (p.progress || 0) < 100);
    const completedProjects = projects.filter(p => (p.progress || 0) >= 100);

    const getProgressColor = (progress: number) => {
        if (progress >= 75) return "#10B981";
        if (progress >= 40) return "#F59E0B";
        return "#3B82F6";
    };

    const formatDate = (dateStr: string) => {
        try { return new Date(dateStr).toLocaleDateString("tr-TR"); }
        catch { return dateStr; }
    };

    return (
        <SafeAreaView style={styles.safe}>
            <View style={styles.topHeader}>
                <Pressable onPress={() => router.back()} style={styles.backButton}>
                    <MaterialIcons name="arrow-back" size={24} color="#111827" />
                </Pressable>
                <Text style={styles.welcomeText}>Hoş Geldiniz, {userName}</Text>
                <Pressable style={styles.notifBtn} onPress={() => router.push("/(tabs)/notifications")}>
                    <MaterialIcons name="notifications" size={24} color="#111827" />
                    <View style={styles.notifDot} />
                </Pressable>
            </View>

            <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
                <View style={styles.actionRow}>
                    <View style={styles.searchBox}>
                        <MaterialIcons name="search" size={20} color="#9CA3AF" />
                        <TextInput
                            style={styles.searchInput}
                            placeholder="Proje kayıtlarında ara..."
                            placeholderTextColor="#9CA3AF"
                            value={searchQuery}
                            onChangeText={setSearchQuery}
                        />
                    </View>
                    <Pressable style={styles.newProjectBtn} onPress={() => setModalVisible(true)}>
                        <MaterialIcons name="add" size={20} color="#fff" />
                        <Text style={styles.newProjectBtnText}>Yeni Proje</Text>
                    </Pressable>
                </View>

                <View style={styles.teamSection}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Şirket Çalışanları</Text>
                        <View style={styles.line} />
                        <Text style={styles.sectionCount}>{members.length} ÜYE</Text>
                        <Pressable style={styles.addMemberBtn} onPress={() => setAddMemberModal(true)}>
                            <MaterialIcons name="person-add" size={18} color="#2563EB" />
                        </Pressable>
                    </View>

                    {membersLoading ? (
                        <ActivityIndicator size="small" color="#2563EB" />
                    ) : members.length === 0 ? (
                        <Text style={styles.emptyText}>Henüz ekip üyesi yok.</Text>
                    ) : (
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.membersList}>
                            {members.map((m, i) => (
                                <Pressable
                                    key={m.id}
                                    style={styles.memberCard}
                                    onPress={() => router.push({
                                        pathname: "/calisan-detay",
                                        params: { memberId: m.id, memberName: m.name, memberEmail: m.email, memberRole: m.role }
                                    })}
                                >
                                    <View style={[styles.memberCardAvatar, { backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                                        <Text style={styles.memberCardAvatarText}>{m.name?.charAt(0).toUpperCase() || "?"}</Text>
                                    </View>
                                    <Text style={styles.memberCardName} numberOfLines={1}>{m.name}</Text>
                                    <View style={[styles.memberRoleBadge, m.role === "OWNER" && styles.memberRoleBadgeOwner]}>
                                        <Text style={[styles.memberRoleText, m.role === "OWNER" && styles.memberRoleTextOwner]}>
                                            {m.role === "OWNER" ? "Lider" : "Üye"}
                                        </Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    )}
                </View>

                <View style={styles.sectionHeader}>
                    <Text style={styles.sectionTitle}>Kayıtlı Projeler</Text>
                    <View style={styles.line} />
                    <Text style={styles.sectionCount}>{activeProjects.length} TOPLAM</Text>
                </View>

                {loading ? (
                    <ActivityIndicator size="large" color="#2563EB" style={{ marginVertical: 40 }} />
                ) : activeProjects.length === 0 ? (
                    <View style={styles.emptyProjectsCard}>
                        <MaterialIcons name="web-asset" size={48} color="#D1D5DB" />
                        <Text style={styles.emptyText}>Görüntülenecek proje bulunamadı.</Text>
                    </View>
                ) : (
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsList}>
                        {activeProjects.map((proj) => {
                            const progressColor = getProgressColor(proj.progress || 0);
                            return (
                                <Pressable
                                    key={proj.id}
                                    style={styles.projectCard}
                                    onPress={() => router.push({ pathname: "/proje-panosu", params: { projectId: proj.id } })}
                                >
                                    <View style={styles.projectCardTop}>
                                        <View style={styles.projectIconBox}>
                                            <MaterialIcons name="folder" size={24} color="#fff" />
                                        </View>
                                        <View style={styles.statusBadge}>
                                            <Text style={styles.statusBadgeText}>KAYITLI</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.projectName}>{proj.title || proj.name}</Text>
                                    {proj.description ? <Text style={styles.projectDesc} numberOfLines={1}>{proj.description}</Text> : null}
                                    <View style={styles.progressSection}>
                                        <View style={styles.progressLabelRow}>
                                            <Text style={styles.progressLabel}>İlerleme</Text>
                                            <Text style={[styles.progressPercent, { color: progressColor }]}>%{proj.progress || 0}</Text>
                                        </View>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: `${proj.progress || 0}%` as any, backgroundColor: progressColor }]} />
                                        </View>
                                    </View>
                                    <View style={styles.membersRow}>
                                        {members.slice(0, 4).map((m, i) => (
                                            <View key={m.id} style={[styles.memberAvatar, { marginLeft: i === 0 ? 0 : -8, zIndex: 10 - i, backgroundColor: AVATAR_COLORS[i % AVATAR_COLORS.length] }]}>
                                                <Text style={styles.memberAvatarText}>{m.name ? m.name.charAt(0).toUpperCase() : "?"}</Text>
                                            </View>
                                        ))}
                                        {members.length > 4 && (
                                            <View style={[styles.memberAvatar, styles.memberAvatarMore, { marginLeft: -8 }]}>
                                                <Text style={styles.memberAvatarMoreText}>+{members.length - 4}</Text>
                                            </View>
                                        )}
                                        {members.length > 0 && <Text style={styles.memberCount}>{members.length} üye</Text>}
                                    </View>
                                    <View style={styles.projectCardBottom}>
                                        <View style={styles.dateRow}>
                                            <MaterialIcons name="calendar-today" size={12} color="#9CA3AF" />
                                            <Text style={styles.dateText}>{formatDate(proj.createdAt)}</Text>
                                        </View>
                                        <Text style={styles.openFileText}>Dosyayı Aç {">"}</Text>
                                    </View>
                                </Pressable>
                            );
                        })}
                    </ScrollView>
                )}

                {completedProjects.length > 0 && (
                    <>
                        <View style={styles.sectionHeader}>
                            <Text style={styles.sectionTitle}>Tamamlanan Projeler</Text>
                            <View style={styles.line} />
                            <Text style={styles.sectionCount}>{completedProjects.length} TOPLAM</Text>
                        </View>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.projectsList}>
                            {completedProjects.map((proj) => (
                                <Pressable
                                    key={proj.id}
                                    style={[styles.projectCard, { borderWidth: 2, borderColor: "#10B981" }]}
                                    onPress={() => router.push({ pathname: "/proje-panosu", params: { projectId: proj.id } })}
                                >
                                    <View style={styles.projectCardTop}>
                                        <View style={[styles.projectIconBox, { backgroundColor: "#10B981" }]}>
                                            <MaterialIcons name="check-circle" size={24} color="#fff" />
                                        </View>
                                        <View style={[styles.statusBadge, { backgroundColor: "#DCFCE7" }]}>
                                            <Text style={[styles.statusBadgeText, { color: "#16A34A" }]}>TAMAMLANDI</Text>
                                        </View>
                                    </View>
                                    <Text style={styles.projectName}>{proj.title || proj.name}</Text>
                                    {proj.description ? <Text style={styles.projectDesc} numberOfLines={1}>{proj.description}</Text> : null}
                                    <View style={styles.progressSection}>
                                        <View style={styles.progressLabelRow}>
                                            <Text style={styles.progressLabel}>İlerleme</Text>
                                            <Text style={[styles.progressPercent, { color: "#10B981" }]}>%100</Text>
                                        </View>
                                        <View style={styles.progressBarBg}>
                                            <View style={[styles.progressBarFill, { width: "100%", backgroundColor: "#10B981" }]} />
                                        </View>
                                    </View>
                                    <View style={styles.projectCardBottom}>
                                        <View style={styles.dateRow}>
                                            <MaterialIcons name="calendar-today" size={12} color="#9CA3AF" />
                                            <Text style={styles.dateText}>{formatDate(proj.createdAt)}</Text>
                                        </View>
                                        <Text style={[styles.openFileText, { color: "#10B981" }]}>Dosyayı Aç {">"}</Text>
                                    </View>
                                </Pressable>
                            ))}
                        </ScrollView>
                    </>
                )}

                <View style={styles.statsLayout}>
                    <View style={styles.totalCard}>
                        <View style={styles.totalCardHeader}>
                            <Text style={styles.totalCardTitle}>TOPLAM PROJE</Text>
                            <View style={styles.folderIconLight}><MaterialIcons name="folder" size={20} color="#2563EB" /></View>
                        </View>
                        <Text style={styles.totalNumber}>{projects.length}</Text>
                    </View>
                    <View style={styles.avgCard}>
                        <View style={styles.totalCardHeader}>
                            <Text style={styles.totalCardTitle}>ORTALAMA İLERLEME</Text>
                            <View style={[styles.folderIconLight, { backgroundColor: "#F0FDF4" }]}><MaterialIcons name="trending-up" size={20} color="#10B981" /></View>
                        </View>
                        <Text style={[styles.totalNumber, { color: "#10B981" }]}>
                            %{projects.length > 0 ? Math.round(projects.reduce((acc, p) => acc + (p.progress || 0), 0) / projects.length) : 0}
                        </Text>
                    </View>
                    <View style={styles.totalCard}>
                        <View style={styles.totalCardHeader}>
                            <Text style={styles.totalCardTitle}>ÇALIŞAN SAYISI</Text>
                            <View style={styles.folderIconLight}><MaterialIcons name="people" size={20} color="#2563EB" /></View>
                        </View>
                        <Text style={styles.totalNumber}>{members.length}</Text>
                    </View>
                </View>
            </ScrollView>

            <Modal visible={modalVisible} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Yeni Proje Kaydı</Text>
                            <Pressable onPress={() => setModalVisible(false)} style={styles.closeBtn}>
                                <MaterialIcons name="close" size={20} color="#374151" />
                            </Pressable>
                        </View>
                        <Text style={styles.label}>PROJE ADI</Text>
                        <TextInput style={styles.modalInput} value={projectName} onChangeText={setProjectName} placeholder="E-Ticaret Web Sitesi..." placeholderTextColor="#9CA3AF" />
                        <Text style={styles.label}>AÇIKLAMA</Text>
                        <TextInput style={[styles.modalInput, styles.textArea]} value={projectDesc} onChangeText={setProjectDesc} placeholder="Projenin temel hedefleri..." placeholderTextColor="#9CA3AF" multiline textAlignVertical="top" />
                        <Pressable style={styles.submitBtn} onPress={handleCreateProject}>
                            <Text style={styles.submitBtnText}>Projeyi Onayla</Text>
                        </Pressable>
                    </View>
                </View>
            </Modal>

            <Modal visible={addMemberModal} animationType="fade" transparent={true}>
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Çalışan Ekle</Text>
                            <Pressable onPress={() => setAddMemberModal(false)} style={styles.closeBtn}>
                                <MaterialIcons name="close" size={20} color="#374151" />
                            </Pressable>
                        </View>
                        <Text style={styles.label}>E-POSTA ADRESİ</Text>
                        <TextInput
                            style={styles.modalInput}
                            value={newMemberEmail}
                            onChangeText={setNewMemberEmail}
                            placeholder="ornek@email.com"
                            placeholderTextColor="#9CA3AF"
                            keyboardType="email-address"
                            autoCapitalize="none"
                        />
                        <Text style={styles.modalHint}>Bu e-posta adresiyle kayıtlı kullanıcı organizasyona eklenecek.</Text>
                        <Pressable style={[styles.submitBtn, addingMember && { opacity: 0.6 }]} onPress={handleAddMember} disabled={addingMember}>
                            {addingMember ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitBtnText}>Çalışanı Ekle</Text>}
                        </Pressable>
                    </View>
                </View>
            </Modal>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    safe: { flex: 1, backgroundColor: "#F7F9FC" },
    topHeader: { flexDirection: "row", alignItems: "center", paddingHorizontal: 20, paddingTop: Platform.OS === "android" ? 40 : 20, paddingBottom: 16, backgroundColor: "#fff", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" },
    backButton: { marginRight: 16 },
    welcomeText: { flex: 1, fontSize: 20, fontWeight: "700", color: "#111827" },
    notifBtn: { padding: 4, position: "relative" },
    notifDot: { position: "absolute", top: 4, right: 4, width: 8, height: 8, borderRadius: 4, backgroundColor: "#EF4444" },
    scrollContent: { padding: 20, flexGrow: 1 },
    actionRow: { flexDirection: "row", alignItems: "center", marginBottom: 24, gap: 12 },
    searchBox: { flex: 1, flexDirection: "row", alignItems: "center", backgroundColor: "#fff", borderRadius: 12, paddingHorizontal: 12, height: 48, borderWidth: 1, borderColor: "#E5E7EB" },
    searchInput: { flex: 1, marginLeft: 8, color: "#111827", fontSize: 14 },
    newProjectBtn: { flexDirection: "row", alignItems: "center", backgroundColor: "#2563EB", height: 48, paddingHorizontal: 16, borderRadius: 12, elevation: 4 },
    newProjectBtnText: { color: "#fff", fontWeight: "600", marginLeft: 4 },
    teamSection: { marginBottom: 24 },
    membersList: { gap: 12, paddingVertical: 8 },
    memberCard: { alignItems: "center", backgroundColor: "#fff", borderRadius: 16, padding: 14, width: 90, elevation: 2 },
    memberCardAvatar: { width: 48, height: 48, borderRadius: 24, alignItems: "center", justifyContent: "center", marginBottom: 8 },
    memberCardAvatarText: { color: "#fff", fontSize: 20, fontWeight: "800" },
    memberCardName: { fontSize: 11, fontWeight: "700", color: "#111827", textAlign: "center", marginBottom: 6 },
    memberRoleBadge: { backgroundColor: "#F3F4F6", paddingHorizontal: 8, paddingVertical: 3, borderRadius: 8 },
    memberRoleBadgeOwner: { backgroundColor: "#EEF2FF" },
    memberRoleText: { fontSize: 9, fontWeight: "700", color: "#6B7280" },
    memberRoleTextOwner: { color: "#4F46E5" },
    addMemberBtn: { marginLeft: 8, padding: 4 },
    sectionHeader: { flexDirection: "row", alignItems: "center", marginBottom: 16 },
    sectionTitle: { fontSize: 18, fontWeight: "700", color: "#111827" },
    line: { flex: 1, height: 1, backgroundColor: "#E5E7EB", marginHorizontal: 16 },
    sectionCount: { fontSize: 12, fontWeight: "600", color: "#6B7280" },
    emptyProjectsCard: { height: 160, backgroundColor: "#fff", borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", borderStyle: "dashed", alignItems: "center", justifyContent: "center", marginBottom: 24 },
    emptyText: { marginTop: 12, color: "#9CA3AF", fontSize: 14 },
    projectsList: { paddingRight: 20, marginBottom: 24, gap: 16 },
    projectCard: { width: 260, backgroundColor: "#fff", borderRadius: 20, padding: 20, elevation: 3 },
    projectCardTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
    projectIconBox: { width: 48, height: 48, borderRadius: 12, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center" },
    statusBadge: { backgroundColor: "#EEF2FF", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
    statusBadgeText: { color: "#4F46E5", fontSize: 10, fontWeight: "700" },
    projectName: { fontSize: 16, fontWeight: "700", color: "#111827", marginBottom: 2 },
    projectDesc: { fontSize: 12, color: "#9CA3AF", marginBottom: 12 },
    progressSection: { marginBottom: 12 },
    progressLabelRow: { flexDirection: "row", justifyContent: "space-between", marginBottom: 6 },
    progressLabel: { fontSize: 11, fontWeight: "600", color: "#6B7280" },
    progressPercent: { fontSize: 11, fontWeight: "700" },
    progressBarBg: { height: 6, backgroundColor: "#F3F4F6", borderRadius: 3, overflow: "hidden" },
    progressBarFill: { height: 6, borderRadius: 3 },
    membersRow: { flexDirection: "row", alignItems: "center", marginBottom: 12 },
    memberAvatar: { width: 28, height: 28, borderRadius: 14, backgroundColor: "#2563EB", alignItems: "center", justifyContent: "center", borderWidth: 2, borderColor: "#fff" },
    memberAvatarText: { fontSize: 11, fontWeight: "700", color: "#fff" },
    memberAvatarMore: { backgroundColor: "#E5E7EB" },
    memberAvatarMoreText: { fontSize: 9, fontWeight: "700", color: "#6B7280" },
    memberCount: { fontSize: 11, color: "#9CA3AF", marginLeft: 8 },
    projectCardBottom: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderTopWidth: 1, borderTopColor: "#F3F4F6", paddingTop: 12 },
    dateRow: { flexDirection: "row", alignItems: "center", gap: 6 },
    dateText: { fontSize: 12, color: "#6B7280" },
    openFileText: { fontSize: 13, color: "#2563EB", fontWeight: "600" },
    statsLayout: { marginBottom: 32, gap: 16 },
    totalCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 2 },
    avgCard: { backgroundColor: "#fff", borderRadius: 16, padding: 20, elevation: 2 },
    totalCardHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
    totalCardTitle: { fontSize: 11, fontWeight: "700", color: "#6B7280", letterSpacing: 0.5 },
    folderIconLight: { backgroundColor: "#EEF2FF", padding: 8, borderRadius: 8 },
    totalNumber: { fontSize: 28, fontWeight: "800", color: "#111827" },
    modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 20 },
    modalContent: { backgroundColor: "#fff", borderRadius: 24, padding: 24 },
    modalHeader: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 24 },
    modalTitle: { fontSize: 20, fontWeight: "800", color: "#111827" },
    closeBtn: { padding: 4 },
    label: { fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 8, marginTop: 16, letterSpacing: 0.5 },
    modalInput: { height: 48, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: "#111827" },
    textArea: { height: 100, paddingTop: 16 },
    modalHint: { fontSize: 12, color: "#9CA3AF", marginTop: 8 },
    submitBtn: { backgroundColor: "#2563EB", height: 52, borderRadius: 12, alignItems: "center", justifyContent: "center", marginTop: 24 },
    submitBtnText: { color: "#fff", fontSize: 16, fontWeight: "700" },
});