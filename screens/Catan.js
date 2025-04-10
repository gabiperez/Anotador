import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import {
  Text as PaperText,
  Button as PaperButton,
  Title,
  IconButton,
  Provider as PaperProvider,
} from "react-native-paper";

const Catan = () => {
  const numeros = Array.from({ length: 11 }, (_, i) => i + 2);
  const inicializarConteo = () =>
    numeros.reduce((acc, n) => ({ ...acc, [n]: 0 }), {});

  const [conteo, setConteo] = useState(inicializarConteo());
  const [historial, setHistorial] = useState([]);
  const [inicio, setInicio] = useState(Date.now());
  const [tiempo, setTiempo] = useState(0);
  const [partidaActiva, setPartidaActiva] = useState(false);

  useEffect(() => {
    if (!partidaActiva) return;

    const interval = setInterval(() => {
      setTiempo(Date.now() - inicio);
    }, 1000);

    return () => clearInterval(interval);
  }, [inicio, partidaActiva]);

  const incrementar = (numero) => {
    setConteo((prev) => ({
      ...prev,
      [numero]: prev[numero] + 1,
    }));
  };

  const Finalizar = () => {
    Alert.alert("¿Finalizar partida?", "Se guardará en el historial.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Finalizar",
        onPress: () => {
          setHistorial([...historial, { datos: conteo, tiempo }]);
          setConteo(inicializarConteo());
          setInicio(Date.now());
          setTiempo(0);
          setPartidaActiva(false);
        },
      },
    ]);
  };

  const formatearTiempo = (ms) => {
    const totalSeg = Math.floor(ms / 1000);
    const min = Math.floor(totalSeg / 60)
      .toString()
      .padStart(2, "0");
    const seg = (totalSeg % 60).toString().padStart(2, "0");
    return `${min}:${seg}`;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Title style={styles.titulo}>🎲 Catan - Contador de dados</Title>

      {!partidaActiva && (
        <PaperButton
          mode="contained"
          buttonColor="green"
          onPress={() => {
            setInicio(Date.now());
            setPartidaActiva(true);
          }}
        >
          🎬 Empezar partida
        </PaperButton>
      )}

      {partidaActiva && (
        <>
          <PaperText style={styles.tiempo}>
            ⏱️ Tiempo: {formatearTiempo(tiempo)}
          </PaperText>

          <View style={styles.botonera}>
            {numeros.map((numero) => (
              <View key={numero} style={styles.botonContenedor}>
                <TouchableOpacity
                  style={styles.botonRedondo}
                  onPress={() => incrementar(numero)}
                >
                  <PaperText style={styles.numeroTexto}>{numero}</PaperText>
                </TouchableOpacity>
                <PaperText style={styles.contador}>{conteo[numero]}</PaperText>
              </View>
            ))}
          </View>

          <PaperText style={styles.subtitulo}>
            📊 Estadísticas actuales
          </PaperText>
          <View style={styles.barrasContainer}>
            {Object.entries(conteo).map(([numero, cantidad]) => (
              <View key={numero} style={styles.columna}>
                <PaperText style={styles.cantidadTexto}>{cantidad}</PaperText>
                <View
                  style={[styles.barraVertical, { height: cantidad * 10 }]}
                />
                <PaperText style={styles.numeroTexto}>{numero}</PaperText>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <PaperButton
              mode="contained"
              buttonColor="#FF6347"
              onPress={Finalizar}
            >
              🔄 Finalizar partida
            </PaperButton>
          </View>
        </>
      )}

      {historial.length > 0 && (
        <>
          <PaperText style={styles.subtitulo}>
            📁 Historial de partidas
          </PaperText>
          {historial.map((h, idx) => (
            <View key={idx} style={styles.historialItem}>
              <PaperText style={{ fontWeight: "bold" }}>
                Partida {idx + 1} – Tiempo: {formatearTiempo(h.tiempo)}
              </PaperText>
              {Object.entries(h.datos).map(([n, c]) => (
                <PaperText key={n}>
                  Número {n}: {c} veces
                </PaperText>
              ))}
            </View>
          ))}
        </>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: "stretch",
  },
  titulo: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    textAlign: "center",
  },
  tiempo: {
    fontSize: 18,
    marginBottom: 10,
    textAlign: "center",
  },
  botonera: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },
  botonContenedor: {
    width: 80,
    height: 100,
    margin: 10,
    alignItems: "center",
    justifyContent: "center",
    marginVertical: 10,
  },
  botonRedondo: {
    width: 40,
    height: 40,
    borderRadius: 30,
    marginVertical: 15,
    backgroundColor: "#4682B4",
    alignItems: "center",
    justifyContent: "center",
  },
  numeroTexto: {
    color: "black",
    fontSize: 20,
    fontWeight: "bold",
  },
  contador: {
    marginTop: 5,
    fontSize: 16,
  },
  subtitulo: {
    fontSize: 20,
    marginTop: 20,
    marginBottom: 5,
  },
  barrasContainer: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-around",
    width: "100%",
    height: 150,
    marginTop: 10,
  },
  columna: {
    alignItems: "center",
    justifyContent: "flex-end",
    marginHorizontal: 4,
    height: "100%",
  },
  barraVertical: {
    width: 20,
    backgroundColor: "#4a90e2",
    borderRadius: 4,
  },
  cantidadTexto: {
    marginBottom: 4,
    fontSize: 12,
    fontWeight: "bold",
  },
  historialItem: {
    padding: 10,
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
});

export default Catan;
