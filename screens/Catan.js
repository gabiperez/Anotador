import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ScrollView,
  Alert,
  StyleSheet,
  TouchableOpacity,
} from "react-native";

const Catan = () => {
  const numeros = Array.from({ length: 11 }, (_, i) => i + 2); // [2, 3, ..., 12]

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

  const reiniciar = () => {
    Alert.alert("¿Reiniciar partida?", "Se guardará en el historial.", [
      { text: "Cancelar", style: "cancel" },
      {
        text: "Reiniciar",
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
      <Text style={styles.titulo}>🎲 Catan - Contador de dados</Text>

      {!partidaActiva && (
        <Button
          title="🎬 Empezar partida"
          color="green"
          onPress={() => {
            setInicio(Date.now());
            setPartidaActiva(true);
          }}
        />
      )}

      {partidaActiva && (
        <>
          <Text style={styles.tiempo}>
            ⏱️ Tiempo: {formatearTiempo(tiempo)}
          </Text>

          <View style={styles.botonera}>
            {numeros.map((numero) => (
              <View key={numero} style={styles.botonContenedor}>
                <TouchableOpacity
                  style={styles.botonRedondo}
                  onPress={() => incrementar(numero)}
                >
                  <Text style={styles.numeroTexto}>{numero}</Text>
                </TouchableOpacity>
                <Text style={styles.contador}>{conteo[numero]}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.subtitulo}>📊 Estadísticas actuales</Text>
          <View style={styles.barrasContainer}>
            {Object.entries(conteo).map(([numero, cantidad]) => (
              <View key={numero} style={styles.barraFila}>
                <Text style={{ width: 30 }}>{numero}</Text>
                <View style={[styles.barra, { width: cantidad * 10 }]} />
                <Text style={styles.cantidadTexto}>{cantidad}</Text>
              </View>
            ))}
          </View>

          <View style={{ marginTop: 20 }}>
            <Button
              title="🔄 Reiniciar partida"
              onPress={reiniciar}
              color="#FF6347"
            />
          </View>
        </>
      )}

      {historial.length > 0 && (
        <>
          <Text style={styles.subtitulo}>📁 Historial de partidas</Text>
          {historial.map((h, idx) => (
            <View key={idx} style={styles.historialItem}>
              <Text style={{ fontWeight: "bold" }}>
                Partida {idx + 1} – Tiempo: {formatearTiempo(h.tiempo)}
              </Text>
              {Object.entries(h.datos).map(([n, c]) => (
                <Text key={n}>
                  Número {n}: {c} veces
                </Text>
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
    color: "white",
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
    width: "100%",
    marginTop: 10,
  },
  barraFila: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 4,
  },
  barra: {
    height: 20,
    backgroundColor: "#4a90e2",
    borderRadius: 4,
    marginHorizontal: 10,
  },
  cantidadTexto: {
    fontSize: 16,
    minWidth: 30,
  },
  historialItem: {
    padding: 10,
    marginTop: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 6,
  },
});

export default Catan;
