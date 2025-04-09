import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  TextInput,
  FlatList,
  TouchableOpacity,
} from "react-native";
import styles from "./Carioca/styles";
import { savePlayer, getPlayers } from "../../utils/storage";

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
    if (!playerName.trim()) return;
    const updated = [...players, playerName.trim()];
    setPlayers(updated);
    await savePlayer(playerName.trim());
    setName("");
    loadSavedPlayers();
  };

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
        renderItem={({ item }) => <Text style={styles.player}>{item}</Text>}
      />

      <Text style={styles.subtitle}>Jugadores guardados:</Text>
      <FlatList
        data={savedPlayers}
        keyExtractor={(item, index) => item + index}
        renderItem={({ item }) => (
          <TouchableOpacity onPress={() => addPlayer(item)}>
            <Text style={styles.savedPlayer}>{item}</Text>
          </TouchableOpacity>
        )}
      />

      {players.length > 0 && (
        <Button
          title="Jugar"
          onPress={() => navigation.navigate("Game", { players })}
        />
      )}
    </View>
  );
}
