import React, { useState } from "react";
import { View } from "react-native";
import { Appbar, Card, TextInput, Button, Snackbar } from "react-native-paper";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase";

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [snack, setSnack] = useState(null);

  const recover = async () => {
    setBusy(true);
    try {
      await sendPasswordResetEmail(auth, email.trim());
      setSnack("Enviamos um link de recuperação para seu e-mail.");
    } catch (e) {
      setSnack(e?.message || "Erro ao enviar e-mail");
    } finally {
      setBusy(false);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Recuperar senha" />
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
            <Button mode="contained" onPress={recover} loading={busy}>
              Enviar link
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