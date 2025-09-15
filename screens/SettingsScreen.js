import React, { useEffect, useState } from "react";
import { View, Image, FlatList } from "react-native";
import {
  Appbar,
  Card,
  TextInput,
  Button,
  Divider,
  Text,
  Switch,
  Snackbar,
} from "react-native-paper";
import * as ImagePicker from "expo-image-picker";
import { onSnapshot, setDoc, serverTimestamp } from "firebase/firestore";
import { storage, userDoc, auth } from "../firebase";
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
} from "firebase/storage";
import { signOut } from "firebase/auth";

export default function SettingsScreen() {
  const [fantasyName, setFantasyName] = useState("");
  const [logoUrl, setLogoUrl] = useState("");
  const [mods, setMods] = useState({
    sales: true,
    cashflow: true,
    notifications: true,
  });
  const [snack, setSnack] = useState(null);

  useEffect(() => {
    const ref = userDoc("meta", "settings");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        const s = snap.data();
        setFantasyName(s.fantasyName || "");
        setLogoUrl(s.logoUrl || "");
        setMods(
          s.modules || { sales: true, cashflow: true, notifications: true }
        );
      }
    });
    return () => unsub();
  }, []);

  const pickLogo = async () => {
    const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!perm.granted) return;
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (res.canceled) return;
    const uri = res.assets?.[0]?.uri;
    if (!uri) return;

    const blob = await (await fetch(uri)).blob();
    const uid = auth.currentUser?.uid;
    const ref = storageRef(storage, `tenants/${uid}/logo_${Date.now()}.jpg`);
    await uploadBytes(ref, blob);
    const url = await getDownloadURL(ref);
    setLogoUrl(url);
  };

  const save = async () => {
    try {
      const ref = userDoc("meta", "settings");
      await setDoc(
        ref,
        { fantasyName, logoUrl, modules: mods, updatedAt: serverTimestamp() },
        { merge: true }
      );
      setSnack("Configurações salvas");
    } catch (e) {
      setSnack("Erro: " + e.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Configurações" />
        <Appbar.Action icon="logout" onPress={() => signOut(auth)} />
      </Appbar.Header>

      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={[1]}
        renderItem={() => (
          <Card>
            <Card.Content>
              <TextInput
                label="Nome fantasia"
                value={fantasyName}
                onChangeText={setFantasyName}
                style={{ marginBottom: 12 }}
              />

              <View
                style={{
                  flexDirection: "row",
                  alignItems: "center",
                  gap: 12,
                  marginBottom: 12,
                }}
              >
                {logoUrl ? (
                  <Image
                    source={{ uri: logoUrl }}
                    style={{ width: 72, height: 72, borderRadius: 12 }}
                  />
                ) : (
                  <View
                    style={{
                      width: 72,
                      height: 72,
                      borderRadius: 12,
                      backgroundColor: "#eee",
                      alignItems: "center",
                      justifyContent: "center",
                    }}
                  />
                )}
                <Button
                  mode="contained-tonal"
                  onPress={pickLogo}
                  icon="image-plus"
                >
                  Enviar logotipo
                </Button>
              </View>

              <Divider style={{ marginVertical: 8 }} />
              <Text style={{ marginBottom: 8 }}>Módulos</Text>

              <View style={styles.rowBetween}>
                <Text>Vendas</Text>
                <Switch
                  value={mods.sales}
                  onValueChange={(v) => setMods({ ...mods, sales: v })}
                />
              </View>
              <View style={styles.rowBetween}>
                <Text>Fluxo de Caixa</Text>
                <Switch
                  value={mods.cashflow}
                  onValueChange={(v) => setMods({ ...mods, cashflow: v })}
                />
              </View>
              <View style={styles.rowBetween}>
                <Text>Notificações</Text>
                <Switch
                  value={mods.notifications}
                  onValueChange={(v) => setMods({ ...mods, notifications: v })}
                />
              </View>

              <View style={{ height: 12 }} />
              <Button mode="contained" icon="content-save" onPress={save}>
                Salvar
              </Button>
            </Card.Content>
          </Card>
        )}
      />

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

const styles = {
  rowBetween: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 6,
  },
};
