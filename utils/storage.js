// utils/storage.js
import AsyncStorage from "@react-native-async-storage/async-storage";

const PLAYERS_KEY = "@saved_players";

export const savePlayer = async (name) => {
  try {
    const data = await AsyncStorage.getItem(PLAYERS_KEY);
    let players = data ? JSON.parse(data) : [];
    if (!players.includes(name)) {
      players.push(name);
      await AsyncStorage.setItem(PLAYERS_KEY, JSON.stringify(players));
    }
  } catch (error) {
    console.error("Error al guardar jugador:", error);
  }
};

export const getPlayers = async () => {
  try {
    const data = await AsyncStorage.getItem(PLAYERS_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error al cargar jugadores:", error);
    return [];
  }
};
