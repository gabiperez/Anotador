// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import { Text, Button, Provider as PaperProvider } from "react-native-paper";

import Catan from "./screens/Catan";
import Carioca from "./screens/Carioca";
import AddPlayers from "./screens/AddPlayers";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>⚔️Estadísticas Catan⚔️</Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Catan")}
        style={styles.button}
      >
        Comenzar
      </Button>
    </View>
  );
}

export default function App() {
  return (
    <PaperProvider>
      <NavigationContainer>
        <Stack.Navigator>
          <Stack.Screen name="Inicio" component={HomeScreen} />
          <Stack.Screen name="Catan" component={Catan} />
          <Stack.Screen name="Carioca" component={Carioca} />
          <Stack.Screen name="AddPlayers" component={AddPlayers} />
        </Stack.Navigator>
      </NavigationContainer>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 32,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    textAlign: "center",
    marginBottom: 40,
    fontWeight: "bold",
  },
  button: {
    marginVertical: 10,
  },
});
