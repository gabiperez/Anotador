import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  FlatList,
  TouchableOpacity,
} from "react-native";
import {
  Button,
  Text as PaperText,
  IconButton,
  Dialog,
  Portal,
  RadioButton,
  List,
} from "react-native-paper";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation } from "@react-navigation/native";

const PLAYERS_Catan_KEY = "@catan_players";
const CATAN_WINNERS_KEY = "@catan_winners";

const Catan = () => {
  const navigation = useNavigation();
  const numeros = Array.from({ length: 11 }, (_, i) => i + 2);

  const inicializarConteo = () =>
    numeros.reduce((acc, n) => ({ ...acc, [n]: 0 }), {});

  const [conteo, setConteo] = useState(inicializarConteo());
  const [historial, setHistorial] = useState([]);
  const [inicio, setInicio] = useState(Date.now());
  const [tiempo, setTiempo] = useState(0);
  const [partidaActiva, setPartidaActiva] = useState(false);
  const [players, setPlayers] = useState([]);
  const [winnerDialogVisible, setWinnerDialogVisible] = useState(false);
  const [selectedWinner, setSelectedWinner] = useState("");
  const [pausado, setPausado] = useState(false);

  useEffect(() => {
    if (!partidaActiva || pausado) return;
  
    const interval = setInterval(() => {
      setTiempo(Date.now() - inicio);
    }, 1000);
  
    return () => clearInterval(interval);
  }, [inicio, partidaActiva, pausado]);

  useEffect(() => {
    const loadPlayers = async () => {
      const data = await AsyncStorage.getItem(PLAYERS_Catan_KEY);
      setPlayers(data ? JSON.parse(data) : []);
    };
    loadPlayers();
  }, []);

  const incrementar = (numero) => {
    setConteo((prev) => ({ ...prev, [numero]: prev[numero] + 1 }));
  };

  const guardarGanador = async (nombre) => {
    const data = await AsyncStorage.getItem(CATAN_WINNERS_KEY);
    const winners = data ? JSON.parse(data) : {};
    winners[nombre] = (winners[nombre] || 0) + 1;
    await AsyncStorage.setItem(CATAN_WINNERS_KEY, JSON.stringify(winners));
  };

  const mostrarGanadores = async () => {
    const data = await AsyncStorage.getItem(CATAN_WINNERS_KEY);
    const winners = data ? JSON.parse(data) : {};
    const lista = Object.entries(winners)
      .filter(([_, wins]) => wins > 0)
      .sort((a, b) => b[1] - a[1]);

    Alert.alert("🏆 Ganadores", lista.map(([name, wins]) => `${name}: ${wins} victoria(s)`).join("\n") || "No hay ganadores aún.");
  };

  const finalizarPartida = () => {
    Alert.alert("¿Finalizar partida?", "Se guardará en el historial.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Finalizar",
        onPress: () => {
          setWinnerDialogVisible(true);
        },
      },
    ]);
  };

  const confirmarGanador = () => {
    if (selectedWinner) {
      guardarGanador(selectedWinner);
      setHistorial([...historial, { datos: conteo, tiempo, ganador: selectedWinner }]);
      setConteo(inicializarConteo());
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
        🎲 Catan - Contador de dados
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
            onPress={() => navigation.navigate("AddPlayers", { scope: "catan" })}
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

          <View style={styles.botonera}>
            {numeros.map((numero) => (
              <View key={numero} style={styles.botonContenedor}>
                <IconButton
                  icon={`numeric-${numero}-circle`}
                  size={40}
                  onPress={() => incrementar(numero)}
                  containerColor="#4682B4"
                  iconColor="white"
                />
                <PaperText style={styles.contador}>{conteo[numero]}</PaperText>
              </View>
            ))}
          </View>

          <PaperText style={styles.subtitulo}>📊 Estadísticas actuales</PaperText>
          <View style={styles.barrasContainer}>
            {Object.entries(conteo).map(([numero, cantidad]) => (
              <View key={numero} style={styles.columna}>
                <PaperText style={styles.cantidadTexto}>{cantidad}</PaperText>
                <View
                  style={[styles.barraVertical, { height: cantidad * 10 }]}
                />
                <PaperText style={styles.numeroTexto}>{numero}</PaperText>
              </View>
            ))}
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
          <PaperText style={styles.subtitulo}>📁 Historial de partidas</PaperText>
          {historial.map((h, idx) => (
            <View key={idx} style={styles.historialItem}>
              <PaperText style={{ fontWeight: "bold" }}>
                Partida {idx + 1} – Tiempo: {formatearTiempo(h.tiempo)} – Ganador: {h.ganador || "N/A"}
              </PaperText>
              {Object.entries(h.datos).map(([n, c]) => (
                <PaperText key={n}>
                  Número {n}: {c} veces
                </PaperText>
              ))}
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
  botonera: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  botonContenedor: {
    width: 80,
    height: 100,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  contador: {
    marginTop: 5,
    fontSize: 16,
  },
  subtitulo: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  barrasContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    width: "100%",
    height: 150,
    marginTop: 10,
  },
  columna: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 4,
    height: "100%",
  },
  barraVertical: {
    width: 20,
    backgroundColor: "#4a90e2",
    borderRadius: 4,
  },
  numeroTexto: {
    marginTop: 4,
    fontSize: 14,
  },
  cantidadTexto: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "bold",
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

export default Catan;
