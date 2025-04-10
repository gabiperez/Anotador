// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, StyleSheet } from "react-native";
import { Text, Button, Provider as PaperProvider } from "react-native-paper";

import Catan from "./screens/Catan";
import Carioca from "./screens/Carioca";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🎮 Anotador de Juegos</Text>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Catan")}
        style={styles.button}
      >
        Catan
      </Button>

      <Button
        mode="contained"
        onPress={() => navigation.navigate("Carioca")}
        style={styles.button}
      >
        Carioca
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
