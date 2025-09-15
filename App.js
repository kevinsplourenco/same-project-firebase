import "react-native-gesture-handler";
import React, { useEffect, useState } from "react";
import { View } from "react-native";
import { NavigationContainer } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import {
  Provider as PaperProvider,
  ActivityIndicator,
  Text,
} from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { theme } from "./theme";

// App tabs
import HomeScreen from "./screens/HomeScreen";
import ProductFormScreen from "./screens/ProductFormScreen";
import SalesScreen from "./screens/SalesScreen";
import CashFlowScreen from "./screens/CashFlowScreen";
import SettingsScreen from "./screens/SettingsScreen";
import NotificationsScreen from "./screens/NotificationsScreen";

// Auth stack
import LoginScreen from "./screens/auth/LoginScreen";
import RegisterScreen from "./screens/auth/RegisterScreen";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";

const Tab = createBottomTabNavigator();
const AuthStack = createNativeStackNavigator();

function MainTabs() {
  return (
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
      <Tab.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{ title: "Alertas", tabBarButton: () => null }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [ready, setReady] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u || null);
      setReady(true);
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
        </View>
      </PaperProvider>
    );
  }

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer>
        {user ? (
          <MainTabs />
        ) : (
          <AuthStack.Navigator>
            <AuthStack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <AuthStack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ title: "Criar conta" }}
            />
            <AuthStack.Screen
              name="Forgot"
              component={ForgotPasswordScreen}
              options={{ title: "Recuperar senha" }}
            />
          </AuthStack.Navigator>
        )}
      </NavigationContainer>
    </PaperProvider>
  );
}
