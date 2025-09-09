import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  Provider as PaperProvider,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import "react-native-gesture-handler";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "./firebase";
import { onAuthStateChanged, signInAnonymously } from "firebase/auth";
import { theme } from "./theme";

import HomeScreen from "./screens/HomeScreen";
import ProductFormScreen from "./screens/ProductFormScreen";
import SalesScreen from "./screens/SalesScreen";
import CashFlowScreen from "./screens/CashFlowScreen";
import SettingsScreen from "./screens/SettingsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";

const Tab = createBottomTabNavigator();

export default function App() {
  const [ready, setReady] = useState(false);
  const [initError, setInitError] = useState(null);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (u) => {
      try {
        if (!u) {
          await signInAnonymously(auth);
        }
      } catch (e) {
        setInitError(e);
        console.warn("Auth init error:", e);
      } finally {
        setReady(true); // garante saída do loading
      }
    });
    return () => unsub();
  }, []);

  if (!ready) {
    return (
      <PaperProvider theme={theme}>
        <View
          style={{ flex: 1, justifyContent: "center", alignItems: "center" }}
        >
          <ActivityIndicator />
          <Text style={{ marginTop: 12 }}>Inicializando…</Text>
          {initError?.code === "auth/operation-not-allowed" && (
            <Text style={{ textAlign: "center", marginTop: 8 }}>
              Ative o login anônimo no Firebase (Authentication → Sign-in method
              → Anonymous).
            </Text>
          )}

          {initError?.code === "auth/network-request-failed" && (
            <Text style={{ textAlign: "center", marginTop: 8 }}>
              Sem conexão à internet. Tente novamente.
            </Text>
          )}
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        <Tab.Navigator
          screenOptions={({ route }) => ({
            headerShown: false,
            tabBarIcon: ({ color, size }) => {
              const map = {
                Home: "home-variant",
                Products: "cube-outline",
                Sales: "barcode-scan",
                CashFlow: "cash-multiple",
                Settings: "cog",
                Notifications: "bell-ring-outline",
              };
              return (
                <MaterialCommunityIcons
                  name={map[route.name] || "dots-horizontal"}
                  size={size}
                  color={color}
                />
              );
            },
          })}
        >
          <Tab.Screen
            name="Home"
            component={HomeScreen}
            options={{ title: "SAME" }}
          />
          <Tab.Screen
            name="Products"
            component={ProductFormScreen}
            options={{ title: "Produtos" }}
          />
          <Tab.Screen
            name="Sales"
            component={SalesScreen}
            options={{ title: "Vendas" }}
          />
          <Tab.Screen
            name="CashFlow"
            component={CashFlowScreen}
            options={{ title: "Fluxo" }}
          />
          <Tab.Screen
            name="Settings"
            component={SettingsScreen}
            options={{ title: "Config." }}
          />
          {/* Tela oculta, aberta pelo sino */}
          <Tab.Screen
            name="Notifications"
            component={NotificationsScreen}
            options={{ title: "Alertas", tabBarButton: () => null }}
          />
        </Tab.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}
