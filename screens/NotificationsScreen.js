import React from "react";
import { View, FlatList } from "react-native";
import { Appbar, Card, Text, Avatar, Chip } from "react-native-paper";

const daysBetweenN = (a, b) =>
  Math.ceil((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));

export default function NotificationsScreen({ route }) {
  const low = route?.params?.low || [];
  const expiring = route?.params?.expiring || [];

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Alertas de Estoque" />
      </Appbar.Header>

      <FlatList
        contentContainerStyle={{ padding: 16 }}
        data={[{ k: "low" }, { k: "exp" }]}
        keyExtractor={(i) => i.k}
        renderItem={({ item }) =>
          item.k === "low" ? (
            <Card style={{ marginBottom: 12 }}>
              <Card.Title
                title="Próximos de acabar"
                left={(p) => <Avatar.Icon {...p} icon="alert-outline" />}
              />
              <Card.Content>
                {low.length === 0 ? (
                  <Text>Nenhum item crítico</Text>
                ) : (
                  low.map((p) => (
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
          ) : (
            <Card style={{ marginBottom: 12 }}>
              <Card.Title
                title="Vencendo em breve"
                left={(p) => <Avatar.Icon {...p} icon="calendar-alert" />}
              />
              <Card.Content>
                {expiring.length === 0 ? (
                  <Text>Sem vencimentos próximos</Text>
                ) : (
                  expiring.map((p) => (
                    <Chip
                      key={p.id}
                      style={{ marginVertical: 4 }}
                      icon="calendar"
                    >
                      {p.name} ·{" "}
                      {p.expiry
                        ? daysBetweenN(
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
          )
        }
      />
    </View>
  );
}
