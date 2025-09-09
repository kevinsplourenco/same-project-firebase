import React, { useEffect, useState } from "react";
import { View } from "react-native";
import {
  Appbar,
  Card,
  TextInput,
  Button,
  Snackbar,
  Avatar,
  Text,
} from "react-native-paper";
import { CameraView, useCameraPermissions } from "expo-camera";
import {
  query,
  where,
  getDocs,
  runTransaction,
  serverTimestamp,
  doc,
  collection,
} from "firebase/firestore";
import { colPath, db, TENANT_ID } from "../firebase";

export default function SalesScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanning, setScanning] = useState(false);
  const [manualCode, setManualCode] = useState("");
  const [qty, setQty] = useState("1");
  const [feedback, setFeedback] = useState(null);
  const [busy, setBusy] = useState(false);
  const [scanLock, setScanLock] = useState(false); // evita múltiplos disparos

  useEffect(() => {
    (async () => {
      if (!permission?.granted) {
        await requestPermission();
      }
    })();
  }, [permission]);

  const handleCode = async (code) => {
    if (busy) return;
    setBusy(true);
    try {
      const qProd = query(colPath("products"), where("code", "==", code));
      const snap = await getDocs(qProd);
      if (snap.empty) {
        setFeedback("Produto não encontrado para o código: " + code);
        return;
      }
      const d = snap.docs[0];
      const found = { id: d.id, ...d.data() };

      const qtyNum = Number(qty) || 1;

      await runTransaction(db, async (tx) => {
        const pRef = doc(db, "tenants", TENANT_ID, "products", found.id);
        const pSnap = await tx.get(pRef);
        if (!pSnap.exists()) throw new Error("Produto ausente");
        const current = pSnap.data();
        const newQty = (current.quantity || 0) - qtyNum;
        if (newQty < 0) throw new Error("Estoque insuficiente");
        tx.update(pRef, { quantity: newQty });

        const sRef = doc(collection(db, "tenants", TENANT_ID, "sales"));
        tx.set(sRef, {
          productId: found.id,
          qty: qtyNum,
          total: (current.price || 0) * qtyNum,
          at: serverTimestamp(),
        });
      });

      setFeedback("Venda registrada!");
    } catch (e) {
      setFeedback("Erro: " + (e?.message || String(e)));
    } finally {
      setBusy(false);
      setScanning(false);
      setManualCode("");
      setScanLock(false);
    }
  };

  const renderCamera = () => {
    if (!permission) return null; // ainda carregando
    if (!permission.granted) {
      return (
        <Card style={{ margin: 16 }}>
          <Card.Title title="Câmera bloqueada" />
          <Card.Content>
            <Text>Precisamos da sua permissão para acessar a câmera.</Text>
            <Button
              mode="contained"
              style={{ marginTop: 8 }}
              onPress={requestPermission}
            >
              Permitir câmera
            </Button>
          </Card.Content>
        </Card>
      );
    }

    return (
      <View
        style={{
          height: 280,
          margin: 16,
          borderRadius: 16,
          overflow: "hidden",
        }}
      >
        <CameraView
          style={{ flex: 1 }}
          barcodeScannerSettings={{
            barcodeTypes: ["qr", "ean13", "ean8", "upc_a", "code128"],
          }}
          onBarcodeScanned={({ data }) => {
            if (scanLock) return; // evita múltiplos
            setScanLock(true);
            handleCode(String(data));
          }}
        />
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Vendas" subtitle="QR/EAN + baixa de estoque" />
        <Appbar.Action
          icon={scanning ? "close" : "barcode-scan"}
          onPress={() => {
            setScanning((v) => !v);
            setScanLock(false);
          }}
        />
      </Appbar.Header>

      {scanning && renderCamera()}

      <Card style={{ margin: 16 }}>
        <Card.Title
          title="Venda manual"
          subtitle="Use código EAN/QR/SKU cadastrado"
          left={(p) => <Avatar.Icon {...p} icon="pencil" />}
        />
        <Card.Content>
          <View style={{ flexDirection: "row", gap: 12 }}>
            <TextInput
              label="Código"
              value={manualCode}
              onChangeText={setManualCode}
              style={{ flex: 2 }}
            />
            <TextInput
              label="Qtd"
              value={qty}
              onChangeText={setQty}
              keyboardType="number-pad"
              style={{ flex: 1 }}
            />
            <Button
              mode="contained"
              icon="check"
              onPress={() => handleCode(manualCode)}
              loading={busy}
            >
              OK
            </Button>
          </View>
        </Card.Content>
      </Card>

      <Snackbar
        visible={!!feedback}
        onDismiss={() => setFeedback(null)}
        duration={2500}
      >
        {feedback}
      </Snackbar>
    </View>
  );
}
