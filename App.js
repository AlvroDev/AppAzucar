import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [azucar, setAzucar] = useState('');
  const [historial, setHistorial] = useState([]);
  const [db, setDb] = useState(null);

  // 1. Inicializar la Base de Datos
  useEffect(() => {
    async function initDB() {
      const database = await SQLite.openDatabaseAsync('diabetes.db');
      setDb(database);

      // Crear la tabla si no existe
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS mediciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          valor INTEGER NOT NULL,
          fecha TEXT NOT NULL
        );
      `);
      
      // Cargar mediciones existentes
      cargarMediciones(database);
    }
    initDB();
  }, []);

  // 2. Función para cargar los datos desde SQLite
  const cargarMediciones = async (database) => {
    const databaseInstance = database || db;
    if (!databaseInstance) return;

    // Traemos las mediciones ordenadas de la más reciente a la más antigua
    const todasLasMediciones = await databaseInstance.getAllAsync(
      'SELECT * FROM mediciones ORDER BY fecha DESC'
    );
    setHistorial(todasLasMediciones);
  };

  // 3. Función para guardar una nueva medición
  const guardarMedicion = async () => {
    if (!azucar) {
      Alert.alert('Error', 'Por favor, ingresa un número.');
      return;
    }

    // CAPTURA AUTOMÁTICA DE FECHA Y HORA
    // Guarda un string en formato ISO, ej: "2026-05-19T14:30:00.000Z"
    const fechaISO = new Date().toISOString();

    try {
      await db.runAsync(
        'INSERT INTO mediciones (valor, fecha) VALUES (?, ?)',
        [parseInt(azucar), fechaISO]
      );
      
      setAzucar(''); // Limpiar el input
      Alert.alert('¡Éxito!', 'Medición guardada correctamente.');
      cargarMediciones(); // Recargar la lista
    } catch (error) {
      console.error(error);
      Alert.alert('Error', 'No se pudo guardar en la base de datos.');
    }
  };

  // 4. Formateador de fecha para que tu papá lo entienda fácil
  const formatearFecha = (isoString) => {
    const fecha = new Date(isoString);
    // Cambia el formato a algo amigable como: "19/5/2026, 14:30"
    return fecha.toLocaleString('es-ES', {
      day: 'numeric',
      month: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.titulo}>Control de Azúcar 🩺</Text>

      {/* Formulario de Entrada */}
      <View style={styles.card}>
        <Text style={styles.label}>Ingresa el valor actual (mg/dL):</Text>
        <TextInput
          style={styles.input}
          placeholder="Ej. 120"
          keyboardType="numeric"
          value={azucar}
          onChangeText={setAzucar}
        />
        <TouchableOpacity style={styles.boton} onPress={guardarMedicion}>
          <Text style={styles.botonTexto}>Guardar Medición</Text>
        </TouchableOpacity>
      </View>

      {/* Historial */}
      <Text style={styles.subtitulo}>Historial de Mediciones</Text>
      <FlatList
        data={historial}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.itemHistorial}>
            <Text style={styles.valorTexto}>{item.valor} mg/dL</Text>
            <Text style={styles.fechaTexto}>{formatearFecha(item.fecha)}</Text>
          </View>
        )}
        ListEmptyComponent={
          <Text style={styles.listaVacia}>Aún no hay registros guardados.</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', padding: 20 },
  titulo: { fontSize: 26, fontWeight: 'bold', color: '#1a1a1a', textAlign: 'center', marginTop: 20, marginBottom: 20 },
  subtitulo: { fontSize: 18, fontWeight: 'bold', color: '#555', marginTop: 20, marginBottom: 10 },
  card: { backgroundColor: '#fff', padding: 20, borderRadius: 12, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4, elevation: 3 },
  label: { fontSize: 16, color: '#333', marginBottom: 10 },
  input: { backgroundColor: '#f0f2f5', padding: 15, borderRadius: 8, fontSize: 20, textAlign: 'center', marginBottom: 15, fontWeight: 'bold' },
  boton: { backgroundColor: '#007bff', padding: 15, borderRadius: 8, alignItems: 'center' },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  itemHistorial: { backgroundColor: '#fff', padding: 15, borderRadius: 8, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 8, borderWidth: 1, borderColor: '#e1e8ed' },
  valorTexto: { fontSize: 18, fontWeight: 'bold', color: '#d9534f' },
  fechaTexto: { fontSize: 14, color: '#777' },
  listaVacia: { textAlign: 'center', color: '#aaa', marginTop: 20, fontSize: 16 }
});