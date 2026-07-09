import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  ActivityIndicator,
  FlatList,
  RefreshControl,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialIcons } from "@expo/vector-icons";
import { API_URL } from "@/constants/api";

type NotificationItem = {
  id: string;
  title: string;
  message: string;
  type?: string;
  isRead?: boolean;
  createdAt?: string;

  organization?: {
    name?: string;
  };
  organizationName?: string;
  teamName?: string;
  workspaceName?: string;
};

type FilterKey = "ALL" | "UNREAD" | "ALERTS";
type SortKey = "NEWEST" | "UNREAD_FIRST";

export default function BildirimlerScreen() {
  const [token, setToken] = useState<string | null>(null);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [firstLoading, setFirstLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<FilterKey>("ALL");
  const [sortBy, setSortBy] = useState<SortKey>("NEWEST");

  const intervalRef = useRef<any>(null);

  const fetchWithTimeout = async (
    url: string,
    options: RequestInit = {},
    timeout = 7000
  ) => {
    return Promise.race([
      fetch(url, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error("İstek zaman aşımına uğradı.")), timeout)
      ),
    ]) as Promise<Response>;
  };

  const loadToken = async () => {
    const t = await AsyncStorage.getItem("token");
    setToken(t);
    return t;
  };

  const fetchNotifications = useCallback(
    async (tParam?: string | null) => {
      const t = tParam ?? token ?? (await AsyncStorage.getItem("token"));

      if (!t) {
        setFirstLoading(false);
        return;
      }

      try {
        const res = await fetchWithTimeout(
          `${API_URL}/notifications`,
          {
            headers: { Authorization: `Bearer ${t}` },
          },
          7000
        );

        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.log("Bildirimler alınamadı:", err);
        setNotifications([]);
      } finally {
        setFirstLoading(false);
      }
    },
    [token]
  );

  useEffect(() => {
    (async () => {
      const t = await loadToken();
      fetchNotifications(t);

      intervalRef.current = setInterval(() => {
        fetchNotifications(t);
      }, 60000);
    })();

    return () => clearInterval(intervalRef.current);
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchNotifications();
    setRefreshing(false);
  };

  const unreadCount = useMemo(
    () => notifications.filter((n) => n.isRead === false).length,
    [notifications]
  );

  const allReadText = useMemo(() => {
    return unreadCount > 0
      ? `${unreadCount} okunmamış bildirim`
      : "Tüm bildirimler okundu";
  }, [unreadCount]);

  const filteredAndSorted = useMemo(() => {
    let list = [...notifications];

    if (filter === "UNREAD") {
      list = list.filter((n) => n.isRead === false);
    } else if (filter === "ALERTS") {
      list = list.filter(
        (n) =>
          (n.type || "").toUpperCase().includes("ALERT") ||
          (n.type || "").toUpperCase().includes("UYARI")
      );
    }

    if (sortBy === "UNREAD_FIRST") {
      list.sort((a, b) => {
        const aRead = a.isRead ? 1 : 0;
        const bRead = b.isRead ? 1 : 0;
        if (aRead !== bRead) return aRead - bRead;

        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    } else {
      list.sort((a, b) => {
        const aTime = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const bTime = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return bTime - aTime;
      });
    }

    return list;
  }, [notifications, filter, sortBy]);

  const formatDate = (date?: string) => {
    if (!date) return "";

    const d = new Date(date);

    if (Number.isNaN(d.getTime())) return "";

    return d.toLocaleString("tr-TR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getWorkspaceName = (item: NotificationItem) => {
    return (
      item.organization?.name ||
      item.organizationName ||
      item.teamName ||
      item.workspaceName ||
      ""
    );
  };

  const markAsRead = async (id: string) => {
    if (!token) return;

    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n))
    );

    try {
      await fetch(`${API_URL}/notifications/${id}/read`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.log("Bildirim okundu yapılamadı:", err);
    }
  };

  const markAllAsRead = async () => {
    if (!token) return;

    setLoading(true);
    try {
      await fetch(`${API_URL}/notifications/read-all`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${token}` },
      });

      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    } catch (err) {
      console.log("Tümü okundu yapılamadı:", err);
    } finally {
      setLoading(false);
    }
  };

  const respondInvite = async (
    notificationId: string,
    action: "ACCEPT" | "REJECT"
  ) => {
    if (!token) return;

    try {
      const res = await fetch(`${API_URL}/notifications/respond-invite`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ notificationId, action }),
      });

      const data = await res.json();

      if (res.ok) {
        Alert.alert(
          "Başarılı",
          action === "ACCEPT" ? "Ekibe katıldınız!" : "Davet reddedildi."
        );
        fetchNotifications();
      } else {
        Alert.alert("Hata", data.error || "İşlem başarısız.");
      }
    } catch (e) {
      Alert.alert("Hata", "Sunucuya bağlanılamadı.");
    }
  };

  const toggleSort = () => {
    setSortBy((prev) => (prev === "NEWEST" ? "UNREAD_FIRST" : "NEWEST"));
  };

  const Chip = ({
    label,
    active,
    badge,
    onPress,
  }: {
    label: string;
    active: boolean;
    badge?: number;
    onPress: () => void;
  }) => (
    <Pressable
      onPress={onPress}
      style={[styles.chip, active ? styles.chipActive : styles.chipPassive]}
    >
      <Text style={active ? styles.chipTextActive : styles.chipTextPassive}>
        {label}
      </Text>

      {!!badge && badge > 0 && (
        <View style={active ? styles.badgeActive : styles.badgePassive}>
          <Text style={active ? styles.badgeTextActive : styles.badgeTextPassive}>
            {badge}
          </Text>
        </View>
      )}
    </Pressable>
  );

  const renderItem = ({ item }: { item: NotificationItem }) => {
    const workspaceName = getWorkspaceName(item);
    const isInvite = item.type === "INVITE";

    return (
      <Pressable
        style={[styles.card, item.isRead ? styles.cardRead : styles.cardUnread]}
        onPress={() => {
          if (!item.isRead) markAsRead(item.id);
        }}
      >
        <View style={styles.cardTopRow}>
          <View style={isInvite ? styles.inviteIconBox : styles.taskIconBox}>
            <MaterialIcons
              name={isInvite ? "groups" : "check-circle-outline"}
              size={24}
              color={isInvite ? "#2563EB" : "#16A34A"}
            />
          </View>

          <View style={styles.cardTextArea}>
            <View style={styles.cardHeaderRow}>
              <Text style={styles.title}>{item.title}</Text>

              <View style={styles.rightInfo}>
                {!!item.createdAt && (
                  <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
                )}

                {!item.isRead && <View style={styles.unreadDot} />}
              </View>
            </View>

            <Text style={styles.msg}>{item.message}</Text>

            {isInvite && !!workspaceName && (
              <View style={styles.workspaceBox}>
                <MaterialIcons name="groups" size={15} color="#2563EB" />
                <Text style={styles.workspaceLabel}>Davet edildiğin ekip:</Text>
                <Text style={styles.workspaceName}>{workspaceName}</Text>
              </View>
            )}

            {isInvite && !item.isRead && (
              <View style={styles.inviteActions}>
                <Pressable
                  style={styles.acceptButton}
                  onPress={() => respondInvite(item.id, "ACCEPT")}
                >
                  <MaterialIcons name="check" size={16} color="#FFFFFF" />
                  <Text style={styles.acceptText}>Katıl</Text>
                </Pressable>

                <Pressable
                  style={styles.rejectButton}
                  onPress={() => respondInvite(item.id, "REJECT")}
                >
                  <MaterialIcons name="close" size={16} color="#334155" />
                  <Text style={styles.rejectText}>Reddet</Text>
                </Pressable>
              </View>
            )}
          </View>

          {!item.isRead && !isInvite && (
            <Pressable style={styles.doneButton} onPress={() => markAsRead(item.id)}>
              <MaterialIcons name="done" size={18} color="#2563EB" />
            </Pressable>
          )}
        </View>
      </Pressable>
    );
  };

  if (firstLoading) {
    return (
      <SafeAreaView style={styles.center}>
        <ActivityIndicator size="large" color="#2563EB" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <View style={styles.headerLeft}>
            <View style={styles.iconBox}>
              <MaterialIcons name="notifications-none" size={24} color="#2563EB" />
            </View>

            <View style={styles.headerTextArea}>
              <Text style={styles.headerTitle}>Bildirimler</Text>
              <Text style={styles.headerSub}>{allReadText}</Text>
            </View>
          </View>

          <Pressable
            style={[
              styles.readAllButton,
              (notifications.length === 0 || loading) && { opacity: 0.5 },
            ]}
            onPress={markAllAsRead}
            disabled={notifications.length === 0 || loading}
          >
            <MaterialIcons name="done-all" size={16} color="#FFFFFF" />
            <Text style={styles.readAllButtonText}>Tümünü Okundu Say</Text>
          </Pressable>
        </View>

        <View style={styles.filtersWrap}>
          <Pressable style={styles.sortButton} onPress={toggleSort}>
            <MaterialIcons
              name={sortBy === "NEWEST" ? "filter-list" : "sort"}
              size={20}
              color="#64748B"
            />
          </Pressable>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chipsScroll}
          >
            <Chip label="Hepsi" active={filter === "ALL"} onPress={() => setFilter("ALL")} />

            <Chip
              label="Okunmadı"
              active={filter === "UNREAD"}
              badge={unreadCount}
              onPress={() => setFilter("UNREAD")}
            />

            <Chip
              label="Uyarılar"
              active={filter === "ALERTS"}
              onPress={() => setFilter("ALERTS")}
            />
          </ScrollView>
        </View>

        {filteredAndSorted.length === 0 ? (
          <View style={styles.empty}>
            <View style={styles.emptyIconBox}>
              <MaterialIcons name="notifications-none" size={34} color="#CBD5E1" />
            </View>
            <Text style={styles.emptyTitle}>Hiç bildirim yok</Text>
            <Text style={styles.emptyDesc}>Şu an gösterilecek bir şey yok.</Text>
          </View>
        ) : (
          <FlatList
            data={filteredAndSorted}
            keyExtractor={(item) => item.id}
            renderItem={renderItem}
            contentContainerStyle={styles.listContent}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            showsVerticalScrollIndicator={false}
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 12,
  },

  headerRow: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    marginBottom: 14,
  },
  headerLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  headerTextArea: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "900",
    color: "#0F172A",
  },
  headerSub: {
    fontSize: 13,
    color: "#64748B",
    marginTop: 2,
  },
  readAllButton: {
    marginTop: 14,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
    backgroundColor: "#2563EB",
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 11,
  },
  readAllButtonText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#FFFFFF",
  },

  filtersWrap: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  sortButton: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: "#FFFFFF",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 9,
  },
  chipsScroll: {
    gap: 8,
    paddingRight: 8,
  },
  chip: {
    minHeight: 38,
    paddingHorizontal: 15,
    paddingVertical: 9,
    borderRadius: 16,
    borderWidth: 1,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    gap: 7,
  },
  chipPassive: {
    backgroundColor: "#FFFFFF",
    borderColor: "#E2E8F0",
  },
  chipActive: {
    backgroundColor: "#2563EB",
    borderColor: "#2563EB",
  },
  chipTextPassive: {
    color: "#475569",
    fontWeight: "800",
    fontSize: 14,
  },
  chipTextActive: {
    color: "#FFFFFF",
    fontWeight: "800",
    fontSize: 14,
  },
  badgePassive: {
    minWidth: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: "#EAF1FF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeActive: {
    minWidth: 22,
    height: 22,
    borderRadius: 99,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 6,
  },
  badgeTextPassive: {
    fontSize: 12,
    fontWeight: "900",
    color: "#2563EB",
  },
  badgeTextActive: {
    fontSize: 12,
    fontWeight: "900",
    color: "#2563EB",
  },

  listContent: {
    paddingTop: 6,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 20,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
  },
  cardUnread: {
    backgroundColor: "#FFFFFF",
    borderColor: "#2563EB",
  },
  cardRead: {
    backgroundColor: "#F8FAFC",
    borderColor: "#E5E7EB",
  },
  cardTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
  },
  taskIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#DCFCE7",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  inviteIconBox: {
    width: 46,
    height: 46,
    borderRadius: 15,
    backgroundColor: "#DBEAFE",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  cardTextArea: {
    flex: 1,
  },
  cardHeaderRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 8,
    marginBottom: 6,
  },
  title: {
    flex: 1,
    fontSize: 15,
    fontWeight: "900",
    color: "#0F172A",
  },
  rightInfo: {
    flexDirection: "row",
    alignItems: "center",
    gap: 7,
  },
  dateText: {
    fontSize: 11,
    color: "#64748B",
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 999,
    backgroundColor: "#2563EB",
  },
  msg: {
    fontSize: 14,
    color: "#475569",
    lineHeight: 20,
  },
  workspaceBox: {
    marginTop: 12,
    alignSelf: "flex-start",
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#EFF6FF",
    borderWidth: 1,
    borderColor: "#BFDBFE",
    borderRadius: 13,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  workspaceLabel: {
    fontSize: 12,
    color: "#2563EB",
    fontWeight: "700",
  },
  workspaceName: {
    fontSize: 12,
    color: "#0F172A",
    fontWeight: "900",
  },
  inviteActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  acceptButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#111827",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  acceptText: {
    color: "#FFFFFF",
    fontSize: 13,
    fontWeight: "900",
  },
  rejectButton: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: "#F1F5F9",
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 10,
  },
  rejectText: {
    color: "#334155",
    fontSize: 13,
    fontWeight: "900",
  },
  doneButton: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: "#EFF6FF",
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 10,
  },

  empty: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 40,
  },
  emptyIconBox: {
    width: 74,
    height: 74,
    borderRadius: 22,
    backgroundColor: "#F8FAFC",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: "800",
    color: "#0F172A",
  },
  emptyDesc: {
    marginTop: 6,
    fontSize: 14,
    color: "#94A3B8",
    textAlign: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F5F7FB",
  },
});