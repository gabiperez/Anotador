import React, { useState, useEffect } from "react";
import {
  View,
  Text,
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

import { useNavigation, useFocusEffect } from "@react-navigation/native";

const PLAYERS_Catan_KEY = "@catan_players";
const CATAN_WINNERS_KEY = "@catan_winners";

const MAX_BAR_HEIGHT = 100; // altura máxima en px

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
  const cantidadMax = Math.max(...Object.values(conteo));
  const [jugadores, setJugadores] = useState([]);
  const [robos, setRobos] = useState({});

  useEffect(() => {
    if (!partidaActiva || pausado) return;

    const interval = setInterval(() => {
      setTiempo(Date.now() - inicio);
    }, 1000);

    return () => clearInterval(interval);
  }, [inicio, partidaActiva, pausado]);

  useEffect(() => {
    const cargarJugadores = async () => {
      const data = await AsyncStorage.getItem("@catan_players");
      const lista = JSON.parse(data) || [];
      setJugadores(lista);
      // Inicializa los robos
      const robosIniciales = {};
      lista.forEach((j) => {
        robosIniciales[j] = 0;
      });
      setRobos(robosIniciales);
    };
    cargarJugadores();
  }, []);

  const incrementarRobo = (nombre) => {
    setRobos((prev) => ({
      ...prev,
      [nombre]: prev[nombre] + 1,
    }));
  };

  useFocusEffect(
    React.useCallback(() => {
      const loadPlayers = async () => {
        const data = await AsyncStorage.getItem("@catan_players");
        if (data) {
          const parsed = JSON.parse(data);
          setPlayers(parsed);

          // Inicializar los robos con los jugadores cargados
          const robosIniciales = parsed.reduce((acc, nombre) => {
            acc[nombre] = 0;
            return acc;
          }, {});
          setRobos(robosIniciales);
        }
      };

      loadPlayers();
    }, [])
  );

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

  useEffect(() => {
    const unsubscribe = navigation.addListener("beforeRemove", (e) => {
      e.preventDefault(); // Cancela la acción por defecto (volver atrás)

      Alert.alert(
        "¿Salir sin guardar?",
        "Se perderán los datos de la partida actual.",
        [
          { text: "Cancelar", style: "cancel", onPress: () => {} },
          {
            text: "Salir",
            style: "destructive",
            onPress: () => navigation.dispatch(e.data.action),
          },
        ]
      );
    });

    return unsubscribe;
  }, [navigation]);

  useEffect(() => {
    setJugadores(players);
    // Inicializa los robos para los nuevos jugadores
    const robosIniciales = {};
    players.forEach((j) => {
      robosIniciales[j] = 0;
    });
    setRobos(robosIniciales);
  }, [players]);

  /////////////////////////////////////////////////////////////////////////
  const calcularRondas = (conteo, numJugadores) => {
    if (numJugadores === 0) {
      return 0;
    }
    // 1. Calcular el total de lanzamientos realizados
    const totalLanzamientos = Object.values(conteo).reduce(
      (suma, cantidad) => suma + cantidad,
      0
    );
    const cantidadDeNumeros = 11;
    // 3. Calcular el número de lanzamientos por ronda
    const lanzamientosPorRonda = cantidadDeNumeros * numJugadores;
    // 4. Calcular el número de rondas completadas
    const rondasCompletadas = Math.floor(
      totalLanzamientos / lanzamientosPorRonda
    );
    return rondasCompletadas;
  };
  /////////////////////////////////////////////////////////////////////////

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

    Alert.alert(
      "🏆 Ganadores",
      lista.map(([name, wins]) => `${name}: ${wins} victoria(s)`).join("\n") ||
        "No hay ganadores aún."
    );
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
      setHistorial([
        ...historial,
        { datos: conteo, tiempo, ganador: selectedWinner },
      ]);
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
    const horas = Math.floor(totalSeg / 3600);
    const min = Math.floor((totalSeg % 3600) / 60)
      .toString()
      .padStart(2, "0");

    const seg = (totalSeg % 60).toString().padStart(2, "0");
    // Si hay horas, incluye el formato HH:MM:SS
    if (horas > 0) {
      const hrs = horas.toString().padStart(2, "0");
      return `${hrs}:${min}:${seg}`;
    }
    // Si no hay horas (menos de 60 minutos), mantiene el formato MM:SS
    return `${min}:${seg}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/*
      <PaperText variant="titleLarge" style={styles.titulo}>
        🎲 Catan
      </PaperText>
      */}
      <PaperText variant="titleLarge" style={styles.titulo}>
        Partida en curso
      </PaperText>

      {!partidaActiva && (
        <>
          <Button
            mode="contained"
            icon="play"
            onPress={() => {
              if (players.length === 0) {
                Alert.alert("Agrega jugadores antes de comenzar");
                return;
              }
              setInicio(Date.now());
              setPartidaActiva(true);

              ////////////////////Reseteo de Robos/////////////////////////
              const robosIniciales = players.reduce((acc, nombre) => {
                acc[nombre] = 0;
                return acc;
              }, {});
              setRobos(robosIniciales);
              /////////////////////////////////////////////////////////////
            }}
            style={{ marginBottom: 10 }}
          >
            Empezar partida
          </Button>

          <Button
            mode="outlined"
            icon="account-plus"
            onPress={() =>
              navigation.navigate("AddPlayers", { scope: "catan" })
            }
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
            <PaperText style={styles.tiempo}>
              🔁 **Ronda: {rondasActuales}**
            </PaperText>
          </View>

          <View style={styles.botonera}>
            {numeros.map((numero) => (
              <View key={numero} style={styles.botonContenedor}>
                {/* Botón TouchableOpacity */}
                <TouchableOpacity
                  style={styles.iconoCirculo}
                  onPress={() => incrementar(numero)}
                >
                  <Text style={styles.iconoTexto}>{numero}</Text>
                  {""}
                  {/* Mostramos el número dentro del círculo */}
                </TouchableOpacity>
                <PaperText style={styles.contador}>{conteo[numero]}</PaperText>
              </View>
            ))}
          </View>
          <PaperText style={styles.subtitulo}>🕵️‍♂️Jugadores Robados</PaperText>
          <View style={styles.robosContainer}>
            {jugadores.map((nombre) => (
              <Button
                key={nombre}
                mode="contained"
                style={styles.roboButton}
                labelStyle={styles.roboLabel}
                onPress={() => incrementarRobo(nombre)}
                compact
              >
                {nombre} {robos[nombre] > 0 ? `(${robos[nombre]})` : ""}
              </Button>
            ))}
          </View>

          <PaperText style={styles.subtitulo}>
            📊 Estadísticas actuales
          </PaperText>

          <View style={styles.barrasContainer}>
            {Object.entries(conteo).map(([numero, cantidad]) => {
              const altura =
                cantidadMax > 0 ? (cantidad / cantidadMax) * MAX_BAR_HEIGHT : 0;
              return (
                <View key={numero} style={styles.columna}>
                  <PaperText style={styles.cantidadTexto}>{cantidad}</PaperText>
                  <View style={[styles.barraVertical, { height: altura }]} />
                  <PaperText style={styles.numeroTexto}>{numero}</PaperText>
                </View>
              );
            })}
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
          <PaperText style={styles.subtitulo}>
            📁 Resultado de la Partida
          </PaperText>
          {historial.map((h, idx) => (
            <View key={idx} style={styles.historialItem}>
              <PaperText style={{ fontWeight: "bold" }}>
                Partida {idx + 1} – Tiempo: {formatearTiempo(h.tiempo)} –
                Ganador: {h.ganador || "N/A"}
              </PaperText>

              {/* Números lanzados */}
              {Object.entries(h.datos).map(([n, c]) => (
                <PaperText key={n}>
                  Número {n}: {c} veces
                </PaperText>
              ))}

              {/* Robos por jugador */}
              {h.robos && Object.keys(h.robos).length > 0 && (
                <PaperText style={{ marginTop: 6 }}>
                  🕵️‍♂️ Robos:{""}
                  {Object.entries(h.robos)
                    .map(([nombre, cantidad]) => `${nombre} (${cantidad})`)
                    .join(", ")}
                </PaperText>
              )}
            </View>
          ))}
        </>
      )}

      <Portal>
        <Dialog
          visible={winnerDialogVisible}
          onDismiss={() => setWinnerDialogVisible(false)}
        >
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
            <Button onPress={() => setWinnerDialogVisible(false)}>
              Cancelar
            </Button>
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
    marginBottom: 5,
    textAlign: "center",
  },
  botonera: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    marginBottom: 0,
  },

  botonContenedor: {
    width: 50,
    height: 70,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
  },

  iconoCirculo: {
    backgroundColor: "#4682B4", // Color del círculo
    borderRadius: 50, // Hace el círculo
    width: 60, // Tamaño del círculo
    height: 60,
    justifyContent: "center",
    alignItems: "center",
  },

  iconoTexto: {
    color: "white",
    fontSize: 20, // Tamaño del número
    fontWeight: "bold",
  },

  contador: {
    marginTop: 2,
    fontSize: 16,
  },
  subtitulo: {
    fontSize: 20,
    marginTop: 10,
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
  subtitulo: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    textAlign: "center",
  },
  robosContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    justifyContent: "center",
  },
  roboButton: {
    backgroundColor: "#4682B4",
    margin: 4,
    borderRadius: 20,
  },
  roboLabel: {
    color: "white",
    textTransform: "none",
  },
});

export default Catan;
