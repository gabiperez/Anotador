import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
} from "react-native";
import {
  Button,
  Text as PaperText,
  IconButton,
  Dialog,
  Portal,
  RadioButton,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";

const GameScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { players = [], scope = "generico" } = route.params;

  const PLAYERS_KEY = `@${scope}_players`;
  const WINNERS_KEY = `@${scope}_winners`;

  const [inicio, setInicio] = useState(Date.now());
  const [tiempo, setTiempo] = useState(0);
  const [partidaActiva, setPartidaActiva] = useState(false);
  const [winnerDialogVisible, setWinnerDialogVisible] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState("");
  const [pausado, setPausado] = useState(false);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    if (!partidaActiva || pausado) return;

    const interval = setInterval(() => {
      setTiempo(Date.now() - inicio);
    }, 1000);

    return () => clearInterval(interval);
  }, [inicio, partidaActiva, pausado]);

  const guardarGanador = async (nombre) => {
    const data = await AsyncStorage.getItem(WINNERS_KEY);
    const winners = data ? JSON.parse(data) : {};
    winners[nombre] = (winners[nombre] || 0) + 1;
    await AsyncStorage.setItem(WINNERS_KEY, JSON.stringify(winners));
  };

  const mostrarGanadores = async () => {
    const data = await AsyncStorage.getItem(WINNERS_KEY);
    const winners = data ? JSON.parse(data) : {};
    const lista = Object.entries(winners)
      .filter(([_, wins]) => wins > 0)
      .sort((a, b) => b[1] - a[1]);

    Alert.alert("🏆 Ganadores", lista.map(([name, wins]) => `${name}: ${wins} victoria(s)`).join("\n") || "No hay ganadores aún.");
  };

  const finalizarPartida = () => {
    Alert.alert("¿Finalizar partida?", "Se guardará al historial.", [
      { text: "Cancelar", style: "cancel" },
      { text: "Finalizar", onPress: () => setWinnerDialogVisible(true) },
    ]);
  };

  const confirmarGanador = () => {
    if (selectedWinner) {
      guardarGanador(selectedWinner);
      setHistorial([...historial, { tiempo, ganador: selectedWinner }]);
      setInicio(Date.now());
      setTiempo(0);
      setPartidaActiva(false);
      setWinnerDialogVisible(false);
      setSelectedWinner("");
    }
  };

  const formatearTiempo = (ms) => {
    const totalSeg = Math.floor(ms / 1000);
    const min = Math.floor(totalSeg / 60).toString().padStart(2, "0");
    const seg = (totalSeg % 60).toString().padStart(2, "0");
    return `${min}:${seg}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <PaperText variant="titleLarge" style={styles.titulo}>
        🎮 {scope.charAt(0).toUpperCase() + scope.slice(1)} - Partida
      </PaperText>

      {!partidaActiva && (
        <>
          <Button
            mode="contained"
            icon="play"
            onPress={() => {
              setInicio(Date.now());
              setPartidaActiva(true);
            }}
            style={{ marginBottom: 10 }}
          >
            Empezar partida
          </Button>

          <Button
            mode="outlined"
            icon="account-plus"
            onPress={() => navigation.navigate("AddPlayers", { scope })}
            style={{ marginBottom: 10 }}
          >
            Agregar jugadores
          </Button>

          <Button
            mode="outlined"
            icon="trophy"
            onPress={mostrarGanadores}
            style={{ marginBottom: 10 }}
          >
            Ganadores
          </Button>
        </>
      )}

      {partidaActiva && (
        <>
          <View style={styles.tiempoContainer}>
            <PaperText style={styles.tiempo}>
              ⏱️ Tiempo: {formatearTiempo(tiempo)}
            </PaperText>
            <IconButton
              icon={pausado ? "play" : "pause"}
              size={24}
              onPress={() => setPausado(!pausado)}
              style={{ marginLeft: 10 }}
            />
          </View>

          <Button
            mode="contained"
            icon="stop"
            buttonColor="#FF6347"
            onPress={finalizarPartida}
            style={{ marginTop: 20 }}
          >
            Finalizar partida
          </Button>
        </>
      )}

      {historial.length > 0 && (
        <>
          <PaperText style={styles.subtitulo}>📁 Historial</PaperText>
          {historial.map((h, idx) => (
            <View key={idx} style={styles.historialItem}>
              <PaperText style={{ fontWeight: "bold" }}>
                Partida {idx + 1} – Tiempo: {formatearTiempo(h.tiempo)} – Ganador: {h.ganador}
              </PaperText>
            </View>
          ))}
        </>
      )}

      <Portal>
        <Dialog visible={winnerDialogVisible} onDismiss={() => setWinnerDialogVisible(false)}>
          <Dialog.Title>🏆 ¿Quién ganó?</Dialog.Title>
          <Dialog.Content>
            <RadioButton.Group
              onValueChange={(value) => setSelectedWinner(value)}
              value={selectedWinner}
            >
              {players.map((player) => (
                <RadioButton.Item key={player} label={player} value={player} />
              ))}
            </RadioButton.Group>
          </Dialog.Content>
          <Dialog.Actions>
            <Button onPress={() => setWinnerDialogVisible(false)}>Cancelar</Button>
            <Button onPress={confirmarGanador}>Confirmar</Button>
          </Dialog.Actions>
        </Dialog>
      </Portal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "stretch",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  tiempo: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  subtitulo: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  historialItem: {
    padding: 10,
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
  tiempoContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
});

export default GameScreen;
