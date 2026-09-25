import React, { useState } from 'react';
import { StyleSheet, Text, FlatList, SafeAreaView } from 'react-native';
import useMediciones from './hooks/useMediciones';
import FormularioMedicion from './components/FormularioMedicion';
import ItemHistorial from './components/ItemHistorial';
import ModalEditar from './components/ModalEditar';

export default function App() {
  const { historial, guardarMedicion, actualizarMedicion, borrarMedicion } = useMediciones();

  const [modalVisible, setModalVisible] = useState(false);
  const [itemEditando, setItemEditando] = useState(null);

  const abrirEditor = (item) => {
    setItemEditando(item);
    setModalVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.tituloHeader}>Control de Azúcar</Text>

      <FlatList
        data={historial}
        keyExtractor={(item) => item.id.toString()}
        ListHeaderComponent={<FormularioMedicion onGuardar={guardarMedicion} />}
        renderItem={({ item }) => (
          <ItemHistorial item={item} onLongPress={() => abrirEditor(item)} />
        )}
        ListEmptyComponent={<Text style={styles.listaVacia}>Aún no hay registros guardados.</Text>}
        ListHeaderComponentStyle={{ marginBottom: 10 }}
      />

      <ModalEditar
        visible={modalVisible}
        item={itemEditando}
        onCerrar={() => setModalVisible(false)}
        onActualizar={actualizarMedicion}
        onBorrar={borrarMedicion}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#f5f7fa', paddingHorizontal: 15 },
  tituloHeader: { fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginVertical: 15, color: '#1a1a1a' },
  listaVacia: { textAlign: 'center', marginTop: 40, color: '#aaa', fontSize: 16 },
});