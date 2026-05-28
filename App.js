import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, FlatList, SafeAreaView, Alert, Modal } from 'react-native';
import * as SQLite from 'expo-sqlite';

export default function App() {
  const [azucar, setAzucar] = useState('');
  const [momento, setMomento] = useState('Antes del Desayuno');
  const [historial, setHistorial] = useState([]);
  const [db, setDb] = useState(null);

  // Estados para el Modal de Edición
  const [modalVisible, setModalVisible] = useState(false);
  const [editId, setEditId] = useState(null);
  const [editAzucar, setEditAzucar] = useState('');
  const [editMomento, setEditMomento] = useState('');

  useEffect(() => {
    async function initDB() {
      // Creamos la versión v6 para asegurar que la base de datos se adapte al diseño sin conflictos
      const database = await SQLite.openDatabaseAsync('diabetes_v6.db');
      setDb(database);
      await database.execAsync(`
        PRAGMA journal_mode = WAL;
        CREATE TABLE IF NOT EXISTS mediciones (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          valor INTEGER NOT NULL,
          fecha TEXT NOT NULL,
          momento TEXT NOT NULL
        );
      `);
      cargarMediciones(database);
    }
    initDB();
  }, []);

  const cargarMediciones = async (database) => {
    const databaseInstance = database || db;
    if (!databaseInstance) return;
    const todasLasMediciones = await databaseInstance.getAllAsync('SELECT * FROM mediciones ORDER BY fecha DESC');
    setHistorial(todasLasMediciones);
  };

  const guardarMedicion = async () => {
    if (!azucar) {
      Alert.alert('Error', 'Por favor, ingresa el valor de azúcar.');
      return;
    }
    const fechaISO = new Date().toISOString();
    try {
      await db.runAsync(
        'INSERT INTO mediciones (valor, fecha, momento) VALUES (?, ?, ?)',
        [parseInt(azucar), fechaISO, momento]
      );
      setAzucar(''); setMomento('Antes del Desayuno');
      cargarMediciones();
      Alert.alert('¡Éxito!', 'Medición guardada correctamente.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo guardar.');
    }
  };

  const abrirEditor = (item) => {
    setEditId(item.id);
    setEditAzucar(item.valor.toString());
    setEditMomento(item.momento);
    setEditComentario(item.comentario || '');
    setModalVisible(true);
  };

  const actualizarMedicion = async () => {
    try {
      await db.runAsync(
        'UPDATE mediciones SET valor = ?, momento = ?, comentario = ? WHERE id = ?',
        [parseInt(editAzucar), editMomento, editComentario, editId]
      );
      setModalVisible(false);
      cargarMediciones();
      Alert.alert('Actualizado', 'La medición ha sido corregida.');
    } catch (error) {
      Alert.alert('Error', 'No se pudo actualizar.');
    }
  };

  const borrarMedicion = async () => {
    Alert.alert('Borrar', '¿Estás seguro de que quieres eliminar esta medición?', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: async () => {
          await db.runAsync('DELETE FROM mediciones WHERE id = ?', [editId]);
          setModalVisible(false);
          cargarMediciones();
        }
      }
    ]);
  };

  const obtenerColorAzucar = (valor) => {
    if (valor < 80) return '#f0ad4e'; // Amarillo
    if (valor > 130) return '#d9534f'; // Rojo
    return '#5cb85c'; // Verde
  };

  const formatearFecha = (isoString) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleString('es-ES', { 
      day: 'numeric', 
      month: 'numeric', 
      year: 'numeric' 
    });
  };

  const formatearHora = (isoString) => {
    const fecha = new Date(isoString);
    return fecha.toLocaleString('es-ES', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.tituloHeader}>Control de Azúcar</Text>
      
      <FlatList
        data={historial}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={
          <View style={styles.card}>
            <Text style={styles.label}>Ingresa el valor actual (mg/dL):</Text>
            <TextInput
              style={styles.input}
              placeholder="Ej. 120"
              keyboardType="numeric"
              value={azucar}
              onChangeText={setAzucar}
            />

            <Text style={styles.label}>¿Cuándo se midió?:</Text>
            <View style={styles.selectorContenedorVertical}>
              {['Antes del Desayuno', 'Antes del Almuerzo', 'Antes de la Cena'].map((opcion) => (
                <TouchableOpacity
                  key={opcion}
                  style={[styles.opcionBotonVertical, momento === opcion && styles.opcionSeleccionada]}
                  onPress={() => setMomento(opcion)}
                >
                  <Text style={[styles.opcionTexto, momento === opcion && styles.opcionTextoSeleccionado]}>
                    {opcion}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.botonGuardar} onPress={guardarMedicion}>
              <Text style={styles.botonTexto}>Guardar Medición</Text>
            </TouchableOpacity>
          </View>
        }
        renderItem={({ item }) => {
          // Lógica dinámica para definir la posición del pin en la fila intermedia
          let posicionMomento = 'flex-start'; // Izquierda por defecto (Desayuno)
          if (item.momento === 'Antes del Almuerzo') {
            posicionMomento = 'center'; // Centro
          } else if (item.momento === 'Antes de la Cena') {
            posicionMomento = 'flex-end'; // Derecha
          }

          return (
            /* TARJETA CON PRESION LARGA (onLongPress) */
            <TouchableOpacity 
              style={styles.itemHistorial} 
              onLongPress={() => abrirEditor(item)}
              delayLongPress={600}
            >
              {/* FILA SUPERIOR: Valor a la izquierda y Fecha/Hora a la derecha */}
              <View style={styles.filaSuperior}>
                <Text style={[styles.valorTexto, { color: obtenerColorAzucar(item.valor) }]}>
                  {item.valor} <Text style={styles.unidadTexto}>mg/dL</Text>
                </Text>
                <View style={styles.contenedorFechaHora}>
                  <Text style={styles.fechaTexto}>{formatearFecha(item.fecha)},</Text>
                  <Text style={styles.horaTexto}>{formatearHora(item.fecha)}</Text>
                </View>
              </View>

              {/* FILA MEDIO: Pin dinámico que se mueve según el momento */}
              <View style={[styles.filaMomentoDinamica, { justifyContent: posicionMomento }]}>
                <Text style={styles.momentoTexto}>
                  {item.momento}
                </Text>
              </View>
            </TouchableOpacity>
          );
        }}
        ListEmptyComponent={<Text style={styles.listaVacia}>Aún no hay registros guardados.</Text>}
        ListHeaderComponentStyle={{ marginBottom: 10 }}
      />

      {/* MODAL PARA EDITAR Y BORRAR */}
      <Modal visible={modalVisible} animationType="fade" transparent={true}>
        <View style={styles.modalCentrado}>
          <View style={styles.modalContenido}>
            <Text style={styles.modalTitulo}>Modificar Registro</Text>
            
            <Text style={styles.label}>Nivel de Azúcar:</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={editAzucar} onChangeText={setEditAzucar} />

            <Text style={styles.label}>Momento del día:</Text>
            <View style={styles.selectorContenedorVertical}>
              {['Antes del Desayuno', 'Antes del Almuerzo', 'Antes de la Cena'].map((opcion) => (
                <TouchableOpacity key={opcion} style={[styles.opcionBotonVertical, editMomento === opcion && styles.opcionSeleccionada]} onPress={() => setEditMomento(opcion)}>
                  <Text style={[styles.opcionTexto, editMomento === opcion && styles.opcionTextoSeleccionado]}>{opcion}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity style={styles.botonActualizarModal} onPress={actualizarMedicion}>
              <Text style={styles.botonTexto}>Aplicar Cambios</Text>
            </TouchableOpacity>

            <View style={styles.filaBotonesModal}>
              <TouchableOpacity style={styles.botonBorrar} onPress={borrarMedicion}>
                <Text style={styles.botonTexto}>Borrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCancelar} onPress={() => setModalVisible(false)}>
                <Text style={styles.botonTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', paddingHorizontal: 15 },
  tituloHeader: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#1a1a1a' },
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  label: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 5 },
  input: { backgroundColor: '#f0f2f5', padding: 12, borderRadius: 8, fontSize: 18, textAlign: 'center', marginBottom: 12, fontWeight: 'bold' },
  inputComentario: { fontSize: 14, textAlign: 'left', fontWeight: 'normal', height: 50, textAlignVertical: 'top' },
  
  // Selector vertical original
  selectorContenedorVertical: { marginBottom: 12 },
  opcionBotonVertical: { backgroundColor: '#f0f2f5', padding: 12, borderRadius: 8, marginBottom: 6, alignItems: 'center', borderWidth: 1, borderColor: '#e1e8ed' },
  opcionSeleccionada: { backgroundColor: '#007bff', borderColor: '#007bff' },
  opcionTexto: { fontSize: 15, color: '#333', fontWeight: '500' },
  opcionTextoSeleccionado: { color: '#fff', fontWeight: 'bold' },
  
  botonGuardar: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  
  // ESTILOS DE LA TARJETA CLON DE TU CAPTURA
  itemHistorial: { 
    backgroundColor: '#fff', 
    padding: 15, 
    borderRadius: 12, 
    marginTop: 10, 
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e1e8ed'
  },
  filaSuperior: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  valorTexto: { fontSize: 28, fontWeight: 'bold' },
  unidadTexto: { fontSize: 16, color: '#666', fontWeight: 'normal' },
  contenedorFechaHora: { alignItems: 'flex-end' },
  fechaTexto: { fontSize: 13, color: '#777' },
  horaTexto: { fontSize: 13, color: '#777', marginTop: 2 },

  // Fila del pin que permite alineación dinámica (izquierda, centro, derecha)
  filaMomentoDinamica: { 
    flexDirection: 'row', 
    width: '100%', 
    marginVertical: 8 
  },
  momentoTexto: { fontSize: 15, fontWeight: '700', color: '#111' },
  
  listaVacia: { textAlign: 'center', marginTop: 40, color: '#aaa', fontSize: 16 },

  // Estilos del Modal
  modalCentrado: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContenido: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5 },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  botonActualizarModal: { backgroundColor: '#28a745', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  filaBotonesModal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  botonBorrar: { backgroundColor: '#dc3545', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' },
  botonCancelar: { backgroundColor: '#6c757d', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' }
});