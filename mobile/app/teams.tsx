import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";

type OrganizationItem = {
  id: string;
  name: string;
  role: string;
};

export default function TeamsScreen() {
  const router = useRouter();
  const [teams, setTeams] = useState<OrganizationItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadTeamsFromStorage(); }, []);

  const loadTeamsFromStorage = async () => {
    try {
      setLoading(true);
      const storedUser = await AsyncStorage.getItem("user");
      const token = await AsyncStorage.getItem("token");

      if (!token) { Alert.alert("Hata", "Token bulunamadı. Önce giriş yapmalısın."); return; }
      if (!storedUser) { Alert.alert("Hata", "Kullanıcı bilgisi bulunamadı."); return; }

      const user = JSON.parse(storedUser);
      const organizations = Array.isArray(user?.organizations) ? user.organizations : [];

      const normalized: OrganizationItem[] = organizations.map((item: any) => ({
        id: String(item?.organizationId ?? item?.organization?.id ?? ""),
        name: item?.organization?.name ?? "İsimsiz Workspace",
        role: item?.role ?? "OWNER",
      }));

      setTeams(normalized);
    } catch (error: any) {
      Alert.alert("Hata", error?.message || "Çalışma alanları yüklenemedi.");
    } finally {
      setLoading(false);
    }
  };

  const handleOpenWorkspace = async (teamId: string, teamName: string) => {
    try {
      await AsyncStorage.setItem("activeOrgId", String(teamId));
      await AsyncStorage.setItem("activeOrgName", teamName);
      router.push("/workspace");
    } catch (error) {
      Alert.alert("Hata", "Çalışma alanı açılırken hata oluştu.");
    }
  };

  const renderWorkspaceCard = ({ item }: { item: OrganizationItem }) => {
    const firstLetter = item.name?.charAt(0)?.toUpperCase() || "W";

    return (
      <View style={styles.card}>
        <View style={styles.avatarBox}>
          <Text style={styles.avatarText}>{firstLetter}</Text>
        </View>

        <Text style={styles.workspaceName} numberOfLines={2}>
          {item.name} Workspace
        </Text>

        <View style={styles.roleBadge}>
          <Text style={styles.roleBadgeText}>{item.role}</Text>
        </View>

        <Pressable
          style={styles.openButton}
          onPress={() => handleOpenWorkspace(item.id, item.name)}
        >
          <Text style={styles.openButtonText}>Çalışma Alanına Git</Text>
          <MaterialIcons name="arrow-circle-right" size={18} color="#6B7280" style={{ marginLeft: 8 }} />
        </Pressable>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <StatusBar barStyle="dark-content" backgroundColor="#F8FAFC" />

      <View style={styles.header}>
        <View style={styles.headerTopRow}>
          <View style={styles.headerTextWrap}>
            <Text style={styles.headerTitle}>Organizasyonlarım</Text>
            <Text style={styles.headerSubtitle}>Dahil olduğun gerçek çalışma alanları.</Text>
          </View>
        </View>
      </View>

      {loading ? (
        <View style={styles.centerState}>
          <ActivityIndicator size="large" color="#2563EB" />
          <Text style={styles.centerText}>Yükleniyor...</Text>
        </View>
      ) : (
        <FlatList
          data={teams}
          keyExtractor={(item) => item.id}
          renderItem={renderWorkspaceCard}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { paddingHorizontal: 16, paddingTop: 30, paddingBottom: 16 },
  headerTopRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", gap: 12 },
  headerTextWrap: { flex: 1 },
  headerTitle: { fontSize: 20, fontWeight: "900", color: "#0F172A" },
  headerSubtitle: { marginTop: 8, fontSize: 13, color: "#6B7280" },
  centerState: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerText: { marginTop: 10, color: "#6B7280" },
  listContent: { paddingHorizontal: 16, paddingBottom: 30, gap: 14 },
  card: { backgroundColor: "#FFFFFF", borderRadius: 22, padding: 18, elevation: 2 },
  avatarBox: { width: 50, height: 50, borderRadius: 12, backgroundColor: "#DBEAFE", justifyContent: "center", alignItems: "center", marginBottom: 14 },
  avatarText: { fontSize: 24, fontWeight: "900", color: "#2563EB" },
  workspaceName: { fontSize: 18, fontWeight: "800", marginBottom: 10 },
  roleBadge: { backgroundColor: "#EFF6FF", paddingHorizontal: 10, paddingVertical: 5, borderRadius: 999, alignSelf: "flex-start", marginBottom: 16 },
  roleBadgeText: { fontSize: 11, color: "#2563EB", fontWeight: "800" },
  openButton: { backgroundColor: "#F3F4F6", borderRadius: 12, paddingVertical: 12, flexDirection: "row", justifyContent: "center", alignItems: "center" },
  openButtonText: { fontSize: 14, fontWeight: "700" },
});