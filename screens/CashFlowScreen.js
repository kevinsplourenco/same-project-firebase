import React, { useEffect, useMemo, useState } from "react";
import { View, FlatList, Platform } from "react-native";
import {
  Appbar,
  Card,
  TextInput,
  Button,
  Snackbar,
  Avatar,
  DataTable,
  Chip,
  SegmentedButtons,
} from "react-native-paper";
import DateTimePicker from "@react-native-community/datetimepicker";
import {
  addDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  Timestamp,
} from "firebase/firestore";
import { colPath } from "../firebase";

const currency = (v, hide = false) =>
  hide
    ? "••••"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
      }).format(v || 0);

export default function CashFlowScreen() {
  const [kind, setKind] = useState("entrada");
  const [label, setLabel] = useState("");
  const [amount, setAmount] = useState("");
  const [when, setWhen] = useState(new Date());
  const [showDate, setShowDate] = useState(false);
  const [items, setItems] = useState([]);
  const [period, setPeriod] = useState("mes");
  const [hideAmounts, setHideAmounts] = useState(false);
  const [snack, setSnack] = useState(null);

  useEffect(() => {
    const q = query(colPath("cashflows"), orderBy("when", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
      setItems(list);
    });
    return () => unsub();
  }, []);

  const filtered = useMemo(() => {
    const now = new Date();
    return items.filter((i) => {
      const d = i.when?.toDate ? i.when.toDate() : new Date(i.when);
      if (period === "dia") return d.toDateString() === now.toDateString();
      if (period === "mes")
        return (
          d.getMonth() === now.getMonth() &&
          d.getFullYear() === now.getFullYear()
        );
      return d.getFullYear() === now.getFullYear();
    });
  }, [items, period]);

  const totals = useMemo(() => {
    const entrada = filtered
      .filter((i) => i.kind === "entrada")
      .reduce((s, x) => s + (x.amount || 0), 0);
    const saida = filtered
      .filter((i) => i.kind === "saida")
      .reduce((s, x) => s + (x.amount || 0), 0);
    return { entrada, saida, saldo: entrada - saida };
  }, [filtered]);

  const save = async () => {
    if (!label || !(Number(amount) > 0)) {
      setSnack("Preencha descrição e valor > 0");
      return;
    }
    try {
      await addDoc(colPath("cashflows"), {
        kind,
        label,
        amount: Number(amount),
        when: Timestamp.fromDate(when),
        createdAt: serverTimestamp(),
      });
      setLabel("");
      setAmount("");
      setWhen(new Date());
      setSnack("Lançamento adicionado");
    } catch (e) {
      setSnack("Erro: " + e.message);
    }
  };

  return (
    <View style={{ flex: 1 }}>
      <Appbar.Header>
        <Appbar.Content title="Fluxo de Caixa" />
        <Appbar.Action
          icon={hideAmounts ? "eye-off" : "eye"}
          onPress={() => setHideAmounts((v) => !v)}
        />
      </Appbar.Header>

      <FlatList
        ListHeaderComponent={
          <View style={{ padding: 16 }}>
            <Card style={{ marginBottom: 12 }}>
              <Card.Title
                title="Novo lançamento"
                left={(p) => (
                  <Avatar.Icon
                    {...p}
                    icon={
                      kind === "entrada" ? "arrow-down-bold" : "arrow-up-bold"
                    }
                  />
                )}
              />
              <Card.Content>
                <SegmentedButtons
                  value={kind}
                  onValueChange={setKind}
                  buttons={[
                    { value: "entrada", label: "Entrada" },
                    { value: "saida", label: "Saída" },
                  ]}
                />
                <View style={{ height: 8 }} />
                <TextInput
                  label="Descrição"
                  value={label}
                  onChangeText={setLabel}
                  style={{ marginBottom: 8 }}
                />
                <View style={{ flexDirection: "row", gap: 12 }}>
                  <TextInput
                    label="Valor (R$)"
                    value={amount}
                    onChangeText={setAmount}
                    keyboardType="decimal-pad"
                    style={{ flex: 1 }}
                  />
                  <TextInput
                    label="Data"
                    value={when.toLocaleDateString("pt-BR")}
                    onFocus={() => setShowDate(true)}
                    right={
                      <TextInput.Icon
                        icon="calendar"
                        onPress={() => setShowDate(true)}
                      />
                    }
                    style={{ flex: 1 }}
                  />
                </View>
                {showDate && (
                  <DateTimePicker
                    value={when}
                    mode="date"
                    display={Platform.OS === "ios" ? "spinner" : "default"}
                    onChange={(e, d) => {
                      setShowDate(Platform.OS === "ios");
                      if (d) setWhen(d);
                    }}
                  />
                )}
                <View style={{ height: 8 }} />
                <Button mode="contained" icon="plus" onPress={save}>
                  Adicionar
                </Button>
              </Card.Content>
            </Card>

            <Card style={{ marginBottom: 12 }}>
              <Card.Title
                title="Resumo"
                left={(p) => <Avatar.Icon {...p} icon="chart-areaspline" />}
              />
              <Card.Content>
                <SegmentedButtons
                  value={period}
                  onValueChange={setPeriod}
                  buttons={[
                    { value: "dia", label: "Dia" },
                    { value: "mes", label: "Mês" },
                    { value: "ano", label: "Ano" },
                  ]}
                />
                <View style={{ height: 12 }} />
                <View
                  style={{ flexDirection: "row", gap: 12, flexWrap: "wrap" }}
                >
                  <Chip icon="arrow-down-bold">
                    Entradas: {currency(totals.entrada, hideAmounts)}
                  </Chip>
                  <Chip icon="arrow-up-bold">
                    Saídas: {currency(totals.saida, hideAmounts)}
                  </Chip>
                  <Chip icon="equal">
                    Saldo: {currency(totals.saldo, hideAmounts)}
                  </Chip>
                </View>
              </Card.Content>
            </Card>

            <Card>
              <Card.Title
                title="Lançamentos"
                left={(p) => (
                  <Avatar.Icon {...p} icon="clipboard-list-outline" />
                )}
              />
              <Card.Content>
                <DataTable>
                  <DataTable.Header>
                    <DataTable.Title>Data</DataTable.Title>
                    <DataTable.Title>Descrição</DataTable.Title>
                    <DataTable.Title numeric>Valor</DataTable.Title>
                  </DataTable.Header>
                  {filtered.map((i) => {
                    const d = i.when?.toDate
                      ? i.when.toDate()
                      : new Date(i.when);
                    return (
                      <DataTable.Row key={i.id}>
                        <DataTable.Cell>
                          {d.toLocaleDateString("pt-BR")}
                        </DataTable.Cell>
                        <DataTable.Cell>
                          {(i.kind === "saida" ? "🔴 " : "🟢 ") + i.label}
                        </DataTable.Cell>
                        <DataTable.Cell numeric>
                          {currency(i.amount, hideAmounts)}
                        </DataTable.Cell>
                      </DataTable.Row>
                    );
                  })}
                </DataTable>
              </Card.Content>
            </Card>
          </View>
        }
        data={[]}
        renderItem={null}
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
