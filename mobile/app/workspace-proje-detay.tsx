import React from "react";
import { View, Text, StyleSheet, Pressable, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { MaterialIcons } from "@expo/vector-icons";

export default function WorkspaceProjeDetay() {
  const router = useRouter();
  const { projectId, projectTitle } = useLocalSearchParams();

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.container}>
        <Pressable onPress={() => router.back()} style={styles.back}>
          <MaterialIcons name="arrow-back" size={20} color="#111" />
          <Text style={styles.backText}>Çalışma Alanına Dön</Text>
        </Pressable>

        <Text style={styles.title}>{projectTitle || "Proje"}</Text>

        <View style={styles.section}>
          <Pressable style={styles.card} onPress={() => router.push({ pathname: "/members", params: { projectId } })}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconWrap, { backgroundColor: "#E0F2FE" }]}>
                <MaterialIcons name="group" size={22} color="#0284C7" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Tüm Üyeler</Text>
                <Text style={styles.cardDesc}>Bu projedeki tüm üyeleri görüntüle</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>

          <Pressable style={styles.card} onPress={() => router.push({ pathname: "/proje-panosu", params: { projectId } })}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconWrap, { backgroundColor: "#DCFCE7" }]}>
                <MaterialIcons name="dashboard" size={22} color="#16A34A" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Proje Panosu</Text>
                <Text style={styles.cardDesc}>Görevleri ve kolonları görüntüle</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>

          <Pressable style={styles.card} onPress={() => router.push({ pathname: "/documents", params: { projectId } })}>
            <View style={styles.cardLeft}>
              <View style={[styles.iconWrap, { backgroundColor: "#FEF3C7" }]}>
                <MaterialIcons name="description" size={22} color="#D97706" />
              </View>
              <View>
                <Text style={styles.cardTitle}>Belgeler</Text>
                <Text style={styles.cardDesc}>Projeye ait belgeleri görüntüle</Text>
              </View>
            </View>
            <MaterialIcons name="chevron-right" size={22} color="#9CA3AF" />
          </Pressable>
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#f9fafb" },
  container: { padding: 16 },
  back: { flexDirection: "row", alignItems: "center", marginBottom: 10, gap: 6 },
  backText: { fontSize: 14, color: "#6b7280" },
  title: { fontSize: 24, fontWeight: "700", marginBottom: 24, color: "#111827" },
  section: { marginTop: 4 },
  card: { backgroundColor: "#fff", borderRadius: 14, padding: 14, marginBottom: 12, flexDirection: "row", alignItems: "center", justifyContent: "space-between", elevation: 1 },
  cardLeft: { flexDirection: "row", alignItems: "center", gap: 12, flex: 1 },
  iconWrap: { width: 46, height: 46, borderRadius: 13, alignItems: "center", justifyContent: "center" },
  cardTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  cardDesc: { fontSize: 12, color: "#6b7280", marginTop: 3 },
});