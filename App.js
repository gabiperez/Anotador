// App.js
import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { View, Text, Button, StyleSheet } from "react-native";
import Catan from "./screens/Catan";
import Carioca from "./screens/Carioca";

const Stack = createNativeStackNavigator();

function HomeScreen({ navigation }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anotador de Juegos</Text>
      <Button title="Catan" onPress={() => navigation.navigate("Catan")} />
      <View style={{ height: 20 }} />
      <Button title="Carioca" onPress={() => navigation.navigate("Carioca")} />
    </View>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <Stack.Navigator>
        <Stack.Screen name="Inicio" component={HomeScreen} />
        <Stack.Screen name="Catan" component={Catan} />
        <Stack.Screen name="Carioca" component={Carioca} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 40,
  },
});
