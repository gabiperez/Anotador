import AsyncStorage from "@react-native-async-storage/async-storage";

// Funciones reutilizables para claves por juego
const getPlayersKey = (scope) => `@players_${scope}`;
const getWinnersKey = (scope) => `@winners_${scope}`;

// Guardar jugador
export const savePlayer = async (name, scope) => {
  try {
    const key = getPlayersKey(scope);
    const data = await AsyncStorage.getItem(key);
    let players = data ? JSON.parse(data) : [];
    if (!players.includes(name)) {
      players.push(name);
      await AsyncStorage.setItem(key, JSON.stringify(players));
    }
  } catch (error) {
    console.error("Error al guardar jugador:", error);
  }
};

// Obtener jugadores
export const getPlayers = async (scope) => {
  try {
    const key = getPlayersKey(scope);
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Error al cargar jugadores:", error);
    return [];
  }
};

// Eliminar jugador
export const removePlayer = async (name, scope) => {
  try {
    const key = getPlayersKey(scope);
    const data = await AsyncStorage.getItem(key);
    let players = data ? JSON.parse(data) : [];
    players = players.filter((p) => p !== name);
    await AsyncStorage.setItem(key, JSON.stringify(players));
  } catch (error) {
    console.error("Error al eliminar jugador:", error);
  }
};

// Guardar ganador
export const saveWinner = async (name, scope) => {
  try {
    const key = getWinnersKey(scope);
    const data = await AsyncStorage.getItem(key);
    let winners = data ? JSON.parse(data) : {};
    winners[name] = (winners[name] || 0) + 1;
    await AsyncStorage.setItem(key, JSON.stringify(winners));
  } catch (error) {
    console.error("Error al guardar ganador:", error);
  }
};

// Obtener ganadores
export const getWinners = async (scope) => {
  try {
    const key = getWinnersKey(scope);
    const data = await AsyncStorage.getItem(key);
    return data ? JSON.parse(data) : {};
  } catch (error) {
    console.error("Error al obtener ganadores:", error);
    return {};
  }
};
