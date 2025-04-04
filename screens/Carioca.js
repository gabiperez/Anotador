import React from "react";
import { View, Text, StyleSheet } from "react-native";

const Carioca = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Anotador de Carioca</Text>
    </View>
  );
};

export default Carioca;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 24,
  },
});
