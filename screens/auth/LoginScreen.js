import React, { useState } from "react";
import { View, TouchableOpacity } from "react-native";
import {
  Appbar,
  Card,
  TextInput,
  Button,
  Text,
  Snackbar,
} from "react-native-paper";
import { signInWithEmailAndPassword } from "firebase/auth";
import { auth } from "../../firebase";

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [snack, setSnack] = useState(null);

  const login = async () => {
    setBusy(true);
    try {
      await signInWithEmailAndPassword(auth, email.trim(), password);
    } catch (e) {
      setSnack(e?.message || "Erro ao entrar");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Entrar" />
      </Appbar.Header>

      <View style={{ padding: 16 }}>
        <Card>
          <Card.Content>
            <TextInput
              label="E-mail"
              autoCapitalize="none"
              keyboardType="email-address"
              value={email}
              onChangeText={setEmail}
              style={{ marginBottom: 12 }}
            />
            <TextInput
              label="Senha"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              style={{ marginBottom: 12 }}
            />
            <Button mode="contained" onPress={login} loading={busy}>
              Entrar
            </Button>

            <View style={{ height: 12 }} />
            <TouchableOpacity onPress={() => navigation.navigate("Forgot")}>
              <Text style={{ color: "#6E56CF" }}>Esqueci minha senha</Text>
            </TouchableOpacity>
            <View style={{ height: 4 }} />
            <TouchableOpacity onPress={() => navigation.navigate("Register")}>
              <Text style={{ color: "#6E56CF" }}>Criar conta</Text>
            </TouchableOpacity>
          </Card.Content>
        </Card>
      </View>

      <Snackbar
        visible={!!snack}
        onDismiss={() => setSnack(null)}
        duration={2500}
      >
        {snack}
      </Snackbar>
    </View>
  );
}