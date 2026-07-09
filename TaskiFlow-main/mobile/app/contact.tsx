import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Pressable,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from "react-native";
import { useRouter } from "expo-router";

export default function Contact() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  const submit = () => {
    if (!name.trim() || !email.trim() || !subject.trim() || !message.trim()) {
      Alert.alert("Eksik Bilgi", "Lütfen tüm alanları doldurun.");
      return;
    }

    Alert.alert(
      "Mesajınız Alındı",
      "Teşekkürler. En kısa sürede sizinle iletişime geçeceğiz."
    );

    setName("");
    setEmail("");
    setSubject("");
    setMessage("");
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView
        style={styles.safe}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.headerRow}>
            <Pressable onPress={() => router.back()} style={styles.backBtn}>
              <Text style={styles.backText}>←</Text>
            </Pressable>
            <View style={{ flex: 1 }}>
              <Text style={styles.title}>İletişim</Text>
              <Text style={styles.subtitle}>
                Sorularınız, destek veya fiyatlandırma için bize yazabilirsiniz.
              </Text>
            </View>
          </View>

          <View style={styles.infoCard}>
            <Text style={styles.infoTitle}>İletişim Bilgileri</Text>
            <Text style={styles.infoItem}>• E-posta: ndmsoftware@gmail.com</Text>
            <Text style={styles.infoItem}>• Telefon: +90 534 338 49 82</Text>
            <Text style={styles.infoItem}>• Çalışma Saatleri: Hafta içi 09:00 - 18:00</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.cardTitle}>Mesaj Gönder</Text>

            <Text style={styles.label}>Ad Soyad</Text>
            <TextInput
              style={styles.input}
              value={name}
              onChangeText={setName}
              placeholder="Ad Soyad"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>E-posta</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="ad.soyad@firma.com"
              placeholderTextColor="#9CA3AF"
              autoCapitalize="none"
              keyboardType="email-address"
              autoCorrect={false}
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Konu</Text>
            <TextInput
              style={styles.input}
              value={subject}
              onChangeText={setSubject}
              placeholder="Konu"
              placeholderTextColor="#9CA3AF"
            />

            <Text style={[styles.label, { marginTop: 12 }]}>Mesaj</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={message}
              onChangeText={setMessage}
              placeholder="Mesajınızı yazın..."
              placeholderTextColor="#9CA3AF"
              multiline
            />

            <Pressable style={styles.button} onPress={submit}>
              <Text style={styles.buttonText}>Gönder</Text>
            </Pressable>

            <Text style={styles.hint}>
              Mesajınız ilgili birime iletilecektir.
            </Text>
          </View>

          <View style={{ height: 22 }} />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  content: { padding: 16, paddingBottom: 22 },

  headerRow: { flexDirection: "row", gap: 10, alignItems: "flex-start", marginBottom: 14 },
  backBtn: {
    width: 42,
    height: 42,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    alignItems: "center",
    justifyContent: "center",
  },
  backText: { fontSize: 18, fontWeight: "900", color: "#111827" },

  title: { fontSize: 22, fontWeight: "900", color: "#111827" },
  subtitle: { marginTop: 6, fontSize: 13, color: "#6B7280", lineHeight: 18 },

  infoCard: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    marginBottom: 12,
    backgroundColor: "#F9FAFB",
  },
  infoTitle: { fontSize: 14, fontWeight: "900", color: "#111827", marginBottom: 6 },
  infoItem: { fontSize: 12, color: "#374151", fontWeight: "700", lineHeight: 18 },

  card: {
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 18,
    padding: 14,
    backgroundColor: "#fff",
  },
  cardTitle: { fontSize: 16, fontWeight: "900", color: "#111827", marginBottom: 12 },

  label: { fontSize: 13, fontWeight: "800", color: "#374151", marginBottom: 8 },
  input: {
    height: 48,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    paddingHorizontal: 12,
    backgroundColor: "#F9FAFB",
    color: "#111827",
  },
  textArea: { height: 120, paddingTop: 12, textAlignVertical: "top" },

  button: {
    marginTop: 14,
    height: 48,
    borderRadius: 12,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontSize: 16, fontWeight: "900" },

  hint: { marginTop: 10, fontSize: 12, color: "#6B7280", textAlign: "center" },
});
