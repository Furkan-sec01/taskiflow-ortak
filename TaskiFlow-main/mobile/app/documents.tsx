import React, { useMemo, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TextInput,
  Pressable,
} from "react-native";
import { MaterialIcons } from "@expo/vector-icons";

type FileType = "PDF" | "Excel" | "Sunu" | "Word" | "Görsel";

type FileItem = {
  id: string;
  title: string;
  type: FileType;
  size: string;
  project: string;
  updatedAt: string;
  owner: string;
};

const SAMPLE_FILES: FileItem[] = [
  {
    id: "1",
    title: "Q1 2024 Report",
    type: "PDF",
    size: "2.4 MB",
    project: "Rapor",
    updatedAt: "2 saat önce",
    owner: "Finans",
  },
  {
    id: "2",
    title: "Proje Planı",
    type: "Excel",
    size: "1.1 MB",
    project: "Proje",
    updatedAt: "1 gün önce",
    owner: "Operasyon",
  },
  {
    id: "3",
    title: "Sunum Taslağı",
    type: "Sunu",
    size: "5.0 MB",
    project: "Sunum",
    updatedAt: "3 gün önce",
    owner: "Yönetim",
  },
  {
    id: "4",
    title: "Sözleşme v2",
    type: "Word",
    size: "340 KB",
    project: "Hukuk",
    updatedAt: "1 hafta önce",
    owner: "Legal",
  },
  {
    id: "5",
    title: "Logo Görselleri",
    type: "Görsel",
    size: "1.2 MB",
    project: "Tasarım",
    updatedAt: "2 hafta önce",
    owner: "Design",
  },
  {
    id: "6",
    title: "Bütçe Tablosu",
    type: "Excel",
    size: "920 KB",
    project: "Bütçe",
    updatedAt: "1 gün önce",
    owner: "Finans",
  },
];

export default function DocumentsScreen() {
  const [search, setSearch] = useState("");
  const [activeCardId, setActiveCardId] = useState<string | null>(null);

  const filteredFiles = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return SAMPLE_FILES;

    return SAMPLE_FILES.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.type.toLowerCase().includes(q) ||
        item.project.toLowerCase().includes(q) ||
        item.owner.toLowerCase().includes(q)
    );
  }, [search]);

  const handleCardPress = (id: string) => {
    setActiveCardId((prev) => (prev === id ? null : id));
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.pageTitle}>Documents</Text>
        <Text style={styles.pageSubtitle}>
          Dosyaları görüntüle, seç ve daha sonra istediğin yere bağla.
        </Text>

        {/* Search + filters */}
        <View style={styles.topBar}>
          <View style={styles.searchBox}>
            <MaterialIcons name="search" size={20} color="#94A3B8" />
            <TextInput
              value={search}
              onChangeText={setSearch}
              placeholder="Belge ara..."
              placeholderTextColor="#94A3B8"
              style={styles.searchInput}
            />
          </View>

          <Pressable style={styles.filterButton}>
            <Text style={styles.filterButtonText}>Tümü</Text>
          </Pressable>

          <Pressable style={styles.iconButton}>
            <MaterialIcons name="grid-view" size={20} color="#475569" />
          </Pressable>
        </View>

        {/* Upload area */}
        <Pressable style={styles.uploadBox}>
          <View style={styles.uploadIconWrapper}>
            <MaterialIcons name="cloud-upload" size={28} color="#3B82F6" />
          </View>
          <Text style={styles.uploadTitle}>Dosyaları buraya sürükleyin veya seçin</Text>
          <Text style={styles.uploadSubtitle}>
            PDF, Word, Excel, Sunu, Görseller desteklenir
          </Text>
        </Pressable>

        {/* Cards */}
        <View style={styles.grid}>
          {filteredFiles.map((item) => {
            const isActive = activeCardId === item.id;
            const fileMeta = getFileMeta(item.type);

            return (
              <View key={item.id} style={styles.cardWrapper}>
                <Pressable
                  onPress={() => handleCardPress(item.id)}
                  style={[styles.card, isActive && styles.cardActive]}
                >
                  <View style={styles.cardTopRow}>
                    <View
                      style={[
                        styles.fileIconBox,
                        { backgroundColor: fileMeta.softColor },
                      ]}
                    >
                      <MaterialIcons
                        name={fileMeta.icon}
                        size={20}
                        color={fileMeta.color}
                      />
                    </View>

                    <Pressable
                      style={styles.moreButton}
                      onPress={() => handleCardPress(item.id)}
                    >
                      <MaterialIcons name="more-horiz" size={20} color="#64748B" />
                    </Pressable>
                  </View>

                  <Text style={styles.cardTitle} numberOfLines={1}>
                    {item.title}
                  </Text>

                  <Text style={styles.cardType}>
                    {item.type} • {item.size}
                  </Text>

                  <View style={styles.cardFooter}>
                    <Text style={styles.cardProject}>{item.project}</Text>
                    <View style={styles.statusDot} />
                  </View>
                </Pressable>

                {isActive && (
                  <View style={styles.expandedPanel}>
                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Dosya adı</Text>
                      <Text style={styles.expandedValue}>{item.title}</Text>
                    </View>

                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Tür</Text>
                      <Text style={styles.expandedValue}>{item.type}</Text>
                    </View>

                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Boyut</Text>
                      <Text style={styles.expandedValue}>{item.size}</Text>
                    </View>

                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Sahibi</Text>
                      <Text style={styles.expandedValue}>{item.owner}</Text>
                    </View>

                    <View style={styles.expandedRow}>
                      <Text style={styles.expandedLabel}>Güncelleme</Text>
                      <Text style={styles.expandedValue}>{item.updatedAt}</Text>
                    </View>

                    <View style={styles.actionRow}>
                      <Pressable style={styles.primaryAction}>
                        <MaterialIcons name="visibility" size={18} color="#FFFFFF" />
                        <Text style={styles.primaryActionText}>Aç</Text>
                      </Pressable>

                      <Pressable style={styles.secondaryAction}>
                        <MaterialIcons name="download" size={18} color="#334155" />
                        <Text style={styles.secondaryActionText}>İndir</Text>
                      </Pressable>

                      <Pressable style={styles.secondaryAction}>
                        <MaterialIcons name="share" size={18} color="#334155" />
                        <Text style={styles.secondaryActionText}>Paylaş</Text>
                      </Pressable>
                    </View>
                  </View>
                )}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

function getFileMeta(type: FileType) {
  switch (type) {
    case "PDF":
      return {
        icon: "picture-as-pdf" as const,
        color: "#EF4444",
        softColor: "#FEE2E2",
      };
    case "Excel":
      return {
        icon: "table-chart" as const,
        color: "#22C55E",
        softColor: "#DCFCE7",
      };
    case "Sunu":
      return {
        icon: "slideshow" as const,
        color: "#F59E0B",
        softColor: "#FEF3C7",
      };
    case "Word":
      return {
        icon: "description" as const,
        color: "#3B82F6",
        softColor: "#DBEAFE",
      };
    case "Görsel":
      return {
        icon: "image" as const,
        color: "#A855F7",
        softColor: "#F3E8FF",
      };
    default:
      return {
        icon: "insert-drive-file" as const,
        color: "#64748B",
        softColor: "#E2E8F0",
      };
  }
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F8FAFC",
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 32,
  },
  pageTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0F172A",
    marginBottom: 6,
  },
  pageSubtitle: {
    fontSize: 14,
    color: "#64748B",
    marginBottom: 18,
  },
  topBar: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  searchBox: {
    flex: 1,
    height: 46,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
  },
  searchInput: {
    flex: 1,
    marginLeft: 8,
    color: "#0F172A",
    fontSize: 14,
  },
  filterButton: {
    height: 46,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "#2563EB",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  filterButtonText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 13,
  },
  iconButton: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },
  uploadBox: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    borderWidth: 1.5,
    borderStyle: "dashed",
    borderColor: "#BFDBFE",
    paddingVertical: 26,
    paddingHorizontal: 16,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 18,
  },
  uploadIconWrapper: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  uploadTitle: {
    fontSize: 15,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
    marginBottom: 4,
  },
  uploadSubtitle: {
    fontSize: 13,
    color: "#64748B",
    textAlign: "center",
  },
  grid: {
    gap: 14,
  },
  cardWrapper: {
    width: "100%",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: "#E2E8F0",
  },
  cardActive: {
    borderColor: "#3B82F6",
    backgroundColor: "#F8FBFF",
    shadowColor: "#3B82F6",
    shadowOpacity: 0.08,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 4 },
    elevation: 3,
  },
  cardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  fileIconBox: {
    width: 42,
    height: 42,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  moreButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  cardTitle: {
    marginTop: 14,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
  },
  cardType: {
    marginTop: 6,
    fontSize: 13,
    color: "#64748B",
  },
  cardFooter: {
    marginTop: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  cardProject: {
    fontSize: 12,
    color: "#94A3B8",
    fontWeight: "600",
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FACC15",
  },
  expandedPanel: {
    marginTop: 10,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#DBEAFE",
    borderRadius: 16,
    padding: 14,
  },
  expandedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: "#F1F5F9",
  },
  expandedLabel: {
    fontSize: 13,
    color: "#64748B",
    fontWeight: "600",
  },
  expandedValue: {
    fontSize: 13,
    color: "#0F172A",
    fontWeight: "700",
    maxWidth: "58%",
    textAlign: "right",
  },
  actionRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginTop: 16,
  },
  primaryAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  primaryActionText: {
    color: "#FFFFFF",
    fontWeight: "700",
    marginLeft: 6,
  },
  secondaryAction: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  secondaryActionText: {
    color: "#334155",
    fontWeight: "700",
    marginLeft: 6,
  },
});
