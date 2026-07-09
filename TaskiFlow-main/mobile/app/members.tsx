import React, { useState, useEffect, useMemo } from "react";
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  View,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";

type Member = {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function MembersScreen() {
  const router = useRouter();
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [orgId, setOrgId] = useState<string | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [email, setEmail] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => { loadMembers(); }, []);

  const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), timeout)),
    ]) as Promise<Response>;
  };

  const loadMembers = async () => {
    try {
      setLoading(true);
      const token = await AsyncStorage.getItem("token");
      const storedUser = await AsyncStorage.getItem("user");
      const activeOrgId = await AsyncStorage.getItem("activeOrgId");

      if (!token || !storedUser) { setLoading(false); return; }

      const user = JSON.parse(storedUser);
      const foundOrgId = activeOrgId || user?.organizationId || user?.organization?.id ||
        user?.organizations?.[0]?.organizationId || user?.organizations?.[0]?.organization?.id;

      if (!foundOrgId) { setLoading(false); return; }

      setOrgId(foundOrgId);

      const response = await fetchWithTimeout(`${API_URL}/organizations/${foundOrgId}/members`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data = await response.json();
      if (!response.ok) throw new Error("Üyeler alınamadı");

      const list = Array.isArray(data) ? data : data?.members || [];
      setMembers(list.map((item: any, i: number) => ({
        id: String(item?.id ?? i),
        name: item?.name ?? "İsimsiz",
        email: item?.email ?? "-",
        role: item?.role ?? "MEMBER",
        status: item?.status ?? "active",
      })));
    } catch (e) {
      console.log("MEMBERS ERROR:", e);
      Alert.alert("Hata", "Üyeler yüklenemedi");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMember = async () => {
    if (!email.trim()) { Alert.alert("Hata", "E-posta adresi boş olamaz."); return; }
    if (!orgId) { Alert.alert("Hata", "Organizasyon bulunamadı."); return; }

    try {
      setAdding(true);
      const token = await AsyncStorage.getItem("token");
      const res = await fetch(`${API_URL}/organizations/invite`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ email: email.trim(), orgId }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert("Başarılı", `${email} organizasyona davet edildi!`);
        setEmail("");
        setModalVisible(false);
        loadMembers();
      } else {
        Alert.alert("Hata", data.error || "Üye eklenemedi.");
      }
    } catch (e) {
      Alert.alert("Hata", "Sunucuya bağlanılamadı.");
    } finally {
      setAdding(false);
    }
  };

  const filteredMembers = useMemo(() => {
    const keyword = search.toLowerCase();
    return members.filter(m =>
      m.name.toLowerCase().includes(keyword) || m.email.toLowerCase().includes(keyword)
    );
  }, [members, search]);

  return (
    <SafeAreaView style={styles.safe}>
      <StatusBar barStyle="dark-content" />

      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <MaterialIcons name="arrow-back" size={22} />
        </Pressable>
        <Text style={styles.title}>Üyeler ({members.length})</Text>
        <Pressable onPress={loadMembers}>
          <MaterialIcons name="refresh" size={20} color="#2563EB" />
        </Pressable>
      </View>

      <View style={styles.searchBox}>
        <MaterialIcons name="search" size={18} color="#9CA3AF" />
        <TextInput value={search} onChangeText={setSearch} placeholder="Ara..." style={{ flex: 1 }} />
      </View>

      {loading ? (
        <ActivityIndicator style={{ marginTop: 50 }} />
      ) : (
        <FlatList
          data={filteredMembers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View style={styles.row}>
              <Text style={styles.name}>{item.name}</Text>
              <Text style={styles.email}>{item.email}</Text>
            </View>
          )}
        />
      )}

      {/* ÜYE DAVET ET BUTONU */}
      <View style={styles.bottomActions}>
        <Pressable style={styles.inviteBtn} onPress={() => setModalVisible(true)}>
          <Text style={styles.inviteText}>Üye Davet Et</Text>
        </Pressable>
      </View>

      {/* EMAIL MODAL */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <Pressable style={styles.modalOverlay} onPress={() => setModalVisible(false)}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>Üye Davet Et</Text>
            <Text style={styles.modalLabel}>E-POSTA ADRESİ</Text>
            <TextInput
              style={styles.modalInput}
              value={email}
              onChangeText={setEmail}
              placeholder="ornek@email.com"
              placeholderTextColor="#9CA3AF"
              keyboardType="email-address"
              autoCapitalize="none"
            />
            <Text style={styles.modalHint}>Bu e-posta adresiyle kayıtlı kullanıcı organizasyona eklenecek.</Text>
            <Pressable
              style={[styles.submitBtn, adding && { opacity: 0.6 }]}
              onPress={handleAddMember}
              disabled={adding}
            >
              {adding ? <ActivityIndicator color="#fff" /> : <Text style={styles.submitText}>Davet Et</Text>}
            </Pressable>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#F8FAFC" },
  header: { flexDirection: "row", justifyContent: "space-between", padding: 16, alignItems: "center" },
  title: { fontSize: 18, fontWeight: "800" },
  searchBox: { flexDirection: "row", borderWidth: 1, margin: 16, padding: 10, borderRadius: 10, alignItems: "center" },
  row: { padding: 16, borderBottomWidth: 1, borderColor: "#eee" },
  name: { fontWeight: "700" },
  email: { color: "#6B7280" },
  bottomActions: { position: "absolute", bottom: 0, left: 0, right: 0, padding: 16, backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#eee" },
  inviteBtn: { backgroundColor: "#2563eb", padding: 12, borderRadius: 10 },
  inviteText: { color: "#fff", textAlign: "center", fontWeight: "600" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", padding: 24 },
  modalBox: { backgroundColor: "#fff", borderRadius: 20, padding: 24 },
  modalTitle: { fontSize: 18, fontWeight: "800", color: "#111827", marginBottom: 16 },
  modalLabel: { fontSize: 11, fontWeight: "700", color: "#6B7280", marginBottom: 8, letterSpacing: 0.5 },
  modalInput: { height: 48, backgroundColor: "#F9FAFB", borderWidth: 1, borderColor: "#E5E7EB", borderRadius: 12, paddingHorizontal: 16, fontSize: 14, color: "#111827", marginBottom: 8 },
  modalHint: { fontSize: 12, color: "#9CA3AF", marginBottom: 16 },
  submitBtn: { backgroundColor: "#2563EB", height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  submitText: { color: "#fff", fontSize: 15, fontWeight: "700" },
});