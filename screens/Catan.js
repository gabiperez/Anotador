// screens/Catan.js
import React, { useState } from "react";
import { View, Text, Button, StyleSheet } from "react-native";

const Catan = () => {
  const [puntos, setPuntos] = useState(0);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anotador de Catan</Text>
      <Text>Puntos: {puntos}</Text>
      <Button title="+1 Punto" onPress={() => setPuntos((p) => p + 1)} />
    </View>
  );
};

export default Catan;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
    marginBottom: 20,
  },
});
