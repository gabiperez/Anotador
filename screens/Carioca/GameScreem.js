// screens/Carioca/GameScreen.js
import React from "react";
import { View, Text, StyleSheet } from "react-native";
import styles from "./styles";

export default function GameScreen({ route }) {
  const { players } = route.params;

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Jugadores en juego:</Text>
      {players.map((player, index) => (
        <Text key={index} style={styles.player}>
          {player}
        </Text>
      ))}
      {/* Aquí irá la lógica de puntajes más adelante */}
    </View>
  );
}
