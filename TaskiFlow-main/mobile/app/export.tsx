import React from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  Pressable,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function ExportScreen() {
  const router = useRouter();

  const handleExport = (type: string) => {
    console.log("Export:", type);
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* HEADER */}
      <View style={styles.header}>
        <Pressable onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={22} color="#0f172a" />
        </Pressable>

        <Text style={styles.headerTitle}>Dışa Aktar</Text>

        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* TITLE */}
        <Text style={styles.title}>Projeleri Dışa Aktar</Text>

        <Text style={styles.subtitle}>
          Projelerinizi yedeklemek veya başka bir araca taşımak için dışa
          aktarabilirsiniz.
        </Text>

        {/* EMPTY STATE */}
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>
            Görüntülenecek proje bulunamadı.
          </Text>
        </View>

        {/* BUTTONS */}
        <View style={styles.buttonContainer}>
          <Pressable
            style={[styles.button, { backgroundColor: "#2563eb" }]}
            onPress={() => handleExport("json")}
          >
            <Text style={styles.buttonText}>Dışa Aktar (JSON)</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: "#4f46e5" }]}
            onPress={() => handleExport("csv")}
          >
            <Text style={styles.buttonText}>Dışa Aktar (CSV)</Text>
          </Pressable>

          <Pressable
            style={[styles.button, { backgroundColor: "#16a34a" }]}
            onPress={() => handleExport("pdf")}
          >
            <Text style={styles.buttonText}>PDF Olarak Dışa Aktar</Text>
          </Pressable>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#f8fafc",
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: "#e2e8f0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#0f172a",
  },

  container: {
    padding: 20,
  },

  title: {
    fontSize: 22,
    fontWeight: "800",
    color: "#0f172a",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#64748b",
    marginBottom: 20,
    lineHeight: 20,
  },

  emptyBox: {
    backgroundColor: "#fff",
    padding: 18,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "#e2e8f0",
    marginBottom: 24,
  },
  emptyText: {
    textAlign: "center",
    color: "#94a3b8",
    fontSize: 13,
  },

  buttonContainer: {
    gap: 12,
  },
  button: {
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "700",
    fontSize: 14,
  },
});
