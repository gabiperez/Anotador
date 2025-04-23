import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
  Alert,
} from "react-native";
import styles from "./Carioca/styles";
import { savePlayer, getPlayers, removePlayer } from "../utils/storage";
import AsyncStorage from "@react-native-async-storage/async-storage";

export default function AddPlayers({ navigation }) {
  const [name, setName] = useState("");
  const [players, setPlayers] = useState([]);
  const [savedPlayers, setSavedPlayers] = useState([]);

  useEffect(() => {
    loadSavedPlayers();
  }, []);

  const loadSavedPlayers = async () => {
    const loaded = await getPlayers();
    setSavedPlayers(loaded || []);
  };

  const addPlayer = async (playerName) => {
    const nombre = playerName.trim();
    if (!nombre) return;

    if (players.includes(nombre)) {
      Alert.alert("Jugador ya agregado", `"${nombre}" ya está en la lista.`);
      return;
    }

    const updated = [...players, nombre];
    setPlayers(updated);
    await savePlayer(nombre);
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
            await removePlayer(nombre);
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

      <Button title="Agregar" onPress={() => addPlayer(name)} />

      <Text style={styles.subtitle}>Jugadores actuales:</Text>
      <FlatList
        data={players}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => renderJugador(item)}
      />

      <Text style={styles.subtitle}>Jugadores guardados:</Text>
      <FlatList
        data={savedPlayers}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => addPlayer(item)}>
            {renderJugador(item, true)}
          </TouchableOpacity>
        )}
      />

      {players.length > 0 && (
        <Button
        title="Jugar"
        onPress={async () => {
          const scope = navigation.getState().routes.find(r => r.name === "AddPlayers")?.params?.scope || "general";
          await AsyncStorage.setItem(`@${scope}_players`, JSON.stringify(players));
          navigation.goBack(); // vuelve a Catan
        }}
        />
      )}
    </View>
  );
}
