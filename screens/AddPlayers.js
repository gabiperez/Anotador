import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
  StyleSheet,
} from "react-native";
//import styles from "./Carioca/styles";
import { savePlayer, getPlayers, removePlayer } from "../utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { PaperButton, Button } from "react-native-paper";

export default function AddPlayers({ navigation }) {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);
  const scope = "catan"; // Fijamos el juego como Catan

  useEffect(() => {
    loadSavedPlayers();
  }, []);

  useEffect(() => {
    setPlayers([]); // Limpiamos jugadores anteriores
    loadSavedPlayers();
  }, []);

  const loadSavedPlayers = async () => {
    const loaded = await getPlayers(scope);
    setSavedPlayers(loaded || []);
  };

  const sortedPlayers = [...savedPlayers].sort((a, b) =>
    a.localeCompare(b, "es", { sensitivity: "base" })
  );

  const addPlayer = async (playerName) => {
    const nombre = playerName.trim();
    if (!nombre) return;

    if (players.includes(nombre)) {
      Alert.alert("Jugador ya agregado", `"${nombre}" ya está en la lista.`);
      return;
    }

    const updated = [...players, nombre];
    setPlayers(updated);
    await savePlayer(nombre, scope);
    setName("");
    loadSavedPlayers();
  };

  const eliminarJugador = (nombre) => {
    setPlayers(players.filter((p) => p !== nombre));
  };

  const eliminarJugadorGuardado = (nombre) => {
    Alert.alert(
      "Eliminar jugador guardado",
      `¿Seguro que quieres eliminar a "${nombre}" de los guardados?`,
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Eliminar",
          style: "destructive",
          onPress: async () => {
            await removePlayer(nombre, scope);
            loadSavedPlayers();
          },
        },
      ]
    );
  };

  const renderJugador = (item, esGuardado = false) => (
    <View style={styles.playerRow}>
      <Text style={styles.player}>{item}</Text>
      <TouchableOpacity
        onPress={() =>
          esGuardado ? eliminarJugadorGuardado(item) : eliminarJugador(item)
        }
      >
        <Text style={styles.deleteButton}>❌</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Agregar Jugadores</Text>

      <TextInput
        placeholder="Nombre del jugador"
        style={styles.input}
        value={name}
        onChangeText={setName}
      />

      <Button
        mode="contained"
        onPress={() => addPlayer(name)}
        style={styles.addButton}
      >
        Agregar
      </Button>

      <Text style={styles.subtitle}>Jugadores actuales:</Text>
      <FlatList
        data={players}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => renderJugador(item)}
      />

      <Text style={styles.subtitle}>Jugadores guardados:</Text>
      <View style={styles.savedPlayersContainer}>
        {sortedPlayers.map((player) => (
          <Button
            key={player}
            mode="contained"
            style={styles.playerButton}
            labelStyle={styles.playerButtonLabel}
            onPress={() => addPlayer(player)}
            onLongPress={() => {
              Alert.alert(
                "Eliminar jugador guardado",
                `¿Eliminar a "${player}" de los guardados?`,
                [
                  { text: "Cancelar", style: "cancel" },
                  {
                    text: "Eliminar",
                    style: "destructive",
                    onPress: async () => {
                      await removePlayer(player, scope);
                      loadSavedPlayers();
                    },
                  },
                ]
              );
            }}
            compact
          >
            {player}
          </Button>
        ))}
      </View>

      {players.length > 0 && (
        <Button
          mode="contained"
          onPress={async () => {
            await AsyncStorage.setItem(
              `@catan_players`,
              JSON.stringify(players)
            );
            navigation.goBack();
          }}
          style={styles.jugarButton}
          labelStyle={styles.jugarButtonLabel}
        >
          Jugar
        </Button>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 12,
    textAlign: "center",
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    marginBottom: 10,
    borderRadius: 5,
  },
  subtitle: {
    fontSize: 18,
    marginTop: 20,
    marginBottom: 8,
  },
  savedPlayersContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  playerButton: {
    margin: 4,
    alignSelf: "flex-start",
    paddingHorizontal: 8,
  },
  playerButtonLabel: {
    fontSize: 14,
  },
  playerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  player: {
    fontSize: 16,
    flex: 1,
  },
  deleteButton: {
    fontSize: 16,
    color: "red",
    paddingLeft: 8,
  },
  addButton: {
    marginTop: 10,
    marginBottom: 20,
    alignSelf: "center",
  },
});
