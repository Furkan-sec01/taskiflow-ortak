import React, { useEffect, useRef, useState } from "react";
import { View, ActivityIndicator, Text, StyleSheet } from "react-native";
import { WebView } from "react-native-webview";
import { useLocalSearchParams, useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { API_URL } from "@/constants/api";

export default function ThreeDSScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();

  const html = params.html as string;
  const paymentId = params.paymentId as string;
  const planId = params.planId as string;
  const period = params.period as string;
  const amount = params.amount as string;

  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [checking, setChecking] = useState(false);

  const goSuccess = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    router.replace({
      pathname: "/payment-success",
      params: {
        planId,
        period,
        amount,
      },
    });
  };

  const checkPaymentStatus = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      console.log("3DS TOKEN VAR MI:", !!token);
      console.log("3DS PAYMENT ID:", paymentId);

      if (!token || !paymentId) return;

      const res = await fetch(`${API_URL}/payments/history`, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json().catch(() => []);
      console.log("3DS HISTORY RESPONSE:", data);

      if (!Array.isArray(data)) return;

      const payment = data.find(
        (p: any) =>
          p.id === paymentId ||
          p.conversationId === paymentId ||
          p.iyzicoPaymentId === paymentId
      );

      console.log("3DS BULUNAN PAYMENT:", payment);

      if (payment?.status === "PAID") {
        goSuccess();
      }
    } catch (err) {
      console.log("Payment kontrol hatası:", err);
    }
  };

  useEffect(() => {
    checkPaymentStatus();

    intervalRef.current = setInterval(() => {
      checkPaymentStatus();
    }, 2000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [paymentId]);

  return (
    <View style={styles.container}>
      {!html ? (
        <ActivityIndicator style={{ flex: 1 }} />
      ) : (
        <>
          <WebView
            originWhitelist={["*"]}
            source={{ html }}
            javaScriptEnabled
            domStorageEnabled
            startInLoadingState
            renderLoading={() => <ActivityIndicator style={{ flex: 1 }} />}
            onLoadStart={() => {
              setChecking(true);
            }}
            onLoadEnd={() => {
              setChecking(false);
              checkPaymentStatus();
            }}
            onNavigationStateChange={(navState) => {
              console.log("3DS NAV URL:", navState.url);
              checkPaymentStatus();
            }}
            onError={(event) => {
              console.log("3DS WEBVIEW ERROR:", event.nativeEvent);
            }}
          />

          {checking ? (
            <View style={styles.checkingBox}>
              <ActivityIndicator color="#2563EB" />
              <Text style={styles.checkingText}>Ödeme doğrulanıyor...</Text>
            </View>
          ) : null}
        </>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  checkingBox: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 24,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    borderWidth: 1,
    borderColor: "#E5E7EB",
  },
  checkingText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#111827",
  },
});