import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList } from "react-native";
import {
  Appbar,
  Card,
  Text,
  Avatar,
  Chip,
  Divider,
  Button,
} from "react-native-paper";
import { query, orderBy, onSnapshot } from "firebase/firestore";
import { colPath } from "../firebase";
import NotificationBell from "../components/NotificationBell";

const LOW_STOCK_THRESHOLD = 5;
const EXPIRY_DAYS_THRESHOLD = 7;
const daysBetween = (a, b) =>
  Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

export default function HomeScreen({ navigation }) {
  const [products, setProducts] = useState([]);

  useEffect(() => {
    const q = query(colPath("products"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setProducts(list);
    });
    return () => unsub();
  }, []);

  const { low, expiring } = useMemo(() => {
    const now = new Date();
    const low = products.filter(
      (p) => (p.quantity || 0) <= LOW_STOCK_THRESHOLD
    );
    const expiring = products.filter((p) => {
      if (!p.expiry) return false;
      const d = p.expiry.toDate ? p.expiry.toDate() : new Date(p.expiry);
      return daysBetween(d, now) <= EXPIRY_DAYS_THRESHOLD;
    });
    return { low, expiring };
  }, [products]);

  const totalAlerts = low.length + expiring.length;

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="SAME" subtitle="Gestão simples para MEI" />
        <NotificationBell
          count={totalAlerts}
          onPress={() =>
            navigation.navigate("Notifications", { low, expiring })
          }
        />
      </Appbar.Header>

      <FlatList
        contentContainerStyle={{ padding: 16 }}
        ListHeaderComponent={
          <>
            <Card
              style={{ marginBottom: 12 }}
              onPress={() => navigation.navigate("Sales")}
            >
              <Card.Title
                title="Vendas rápidas"
                left={(p) => <Avatar.Icon {...p} icon="lightning-bolt" />}
              />
              <Card.Content>
                <Text>
                  Use QR/EAN para registrar e baixar estoque automaticamente.
                </Text>
              </Card.Content>
            </Card>

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Card style={{ flex: 1 }}>
                <Card.Title
                  title="Próximos de acabar"
                  left={(p) => <Avatar.Icon {...p} icon="alert-outline" />}
                />
                <Card.Content>
                  {low.length === 0 ? (
                    <Text>Nenhum item crítico 👌</Text>
                  ) : (
                    low.slice(0, 4).map((p) => (
                      <Chip
                        key={p.id}
                        style={{ marginVertical: 4 }}
                        icon="cube-outline"
                      >
                        {p.name} · {p.quantity} un
                      </Chip>
                    ))
                  )}
                </Card.Content>
              </Card>

              <Card style={{ flex: 1 }}>
                <Card.Title
                  title="Vencendo em breve"
                  left={(p) => <Avatar.Icon {...p} icon="calendar-alert" />}
                />
                <Card.Content>
                  {expiring.length === 0 ? (
                    <Text>Sem vencimentos próximos 📆</Text>
                  ) : (
                    expiring.slice(0, 4).map((p) => (
                      <Chip
                        key={p.id}
                        style={{ marginVertical: 4 }}
                        icon="calendar"
                      >
                        {p.name} ·{" "}
                        {p.expiry
                          ? daysBetween(
                              p.expiry.toDate
                                ? p.expiry.toDate()
                                : new Date(p.expiry),
                              new Date()
                            )
                          : "?"}
                        d
                      </Chip>
                    ))
                  )}
                </Card.Content>
              </Card>
            </View>

            <Divider style={{ marginVertical: 16 }} />

            <View style={{ flexDirection: "row", gap: 12 }}>
              <Button
                mode="contained"
                icon="barcode-scan"
                onPress={() => navigation.navigate("Sales")}
                style={{ flex: 1 }}
              >
                Vendas
              </Button>
              <Button
                mode="contained-tonal"
                icon="cash-multiple"
                onPress={() => navigation.navigate("CashFlow")}
                style={{ flex: 1 }}
              >
                Fluxo
              </Button>
            </View>
          </>
        }
        data={[]}
        renderItem={null}
      />
    </View>
  );
}
