// screens/Carioca.js
import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import AddPlayers from "./AddPlayers"; // ya no está en /Carioca
import GameScreen from "./Carioca/GameScreem";

const Stack = createNativeStackNavigator();

export default function Carioca() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Setup"
        component={AddPlayers}
        options={{ title: "Jugadores" }}
      />
      <Stack.Screen
        name="Game"
        component={GameScreen}
        options={{ title: "Partida" }}
      />
    </Stack.Navigator>
  );
}
