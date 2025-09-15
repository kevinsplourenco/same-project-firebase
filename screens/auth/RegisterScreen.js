import React, { useState } from "react";
import { View } from "react-native";
import { Appbar, Card, TextInput, Button, Snackbar } from "react-native-paper";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, userDoc } from "../../firebase";
import { setDoc, serverTimestamp } from "firebase/firestore";

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);
  const [snack, setSnack] = useState(null);

  const register = async () => {
    setBusy(true);
    try {
      const cred = await createUserWithEmailAndPassword(
        auth,
        email.trim(),
        password
      );
      if (name) await updateProfile(cred.user, { displayName: name });
      // cria settings iniciais do tenant do usuário
      await setDoc(
        userDoc("meta", "settings"),
        {
          fantasyName: name || "",
          logoUrl: "",
          modules: { sales: true, cashflow: true, notifications: true },
          createdAt: serverTimestamp(),
        },
        { merge: true }
      );
      navigation.goBack();
    } catch (e) {
      setSnack(e?.message || "Erro ao criar conta");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Criar conta" />
      </Appbar.Header>

      <View style={{ padding: 16 }}>
        <Card>
          <Card.Content>
            <TextInput
              label="Nome fantasia (opcional)"
              value={name}
              onChangeText={setName}
              style={{ marginBottom: 12 }}
            />
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
            <Button mode="contained" onPress={register} loading={busy}>
              Criar conta
            </Button>
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
