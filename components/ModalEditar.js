import React, { useState, useEffect } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Modal, Platform, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MOMENTOS, RELACIONES, parsearMomento } from '../utils/formato';

export default function ModalEditar({ visible, item, onCerrar, onActualizar, onBorrar }) {
  const [editAzucar, setEditAzucar] = useState('');
  const [editComida, setEditComida] = useState('Desayuno');
  const [editRelacion, setEditRelacion] = useState('Antes');
  const [editComentario, setEditComentario] = useState('');
  const [editFecha, setEditFecha] = useState(new Date());
  const [mostrarPickerModal, setMostrarPickerModal] = useState(false);
  const [mostrarPickerHoraModal, setMostrarPickerHoraModal] = useState(false);

  useEffect(() => {
    if (item) {
      setEditAzucar(item.valor.toString());
      const { relacion, comida } = parsearMomento(item.momento);
      setEditRelacion(relacion);
      setEditComida(comida);
      setEditComentario(item.comentario || '');
      setEditFecha(new Date(item.fecha));
    }
  }, [item]);

  if (!item) return null;

  const handleActualizar = async () => {
    const exito = await onActualizar({
      id: item.id,
      azucar: editAzucar,
      editRelacion,
      editComida,
      comentario: editComentario,
      fecha: editFecha,
    });
    if (exito) onCerrar();
  };

  const handleBorrar = () => {
    Alert.alert('Borrar', '¿Estás seguro de que quieres eliminar esta medición?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Borrar',
        style: 'destructive',
        onPress: async () => {
          await onBorrar(item.id);
          onCerrar();
        },
      },
    ]);
  };

  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.modalCentrado}>
        <View style={styles.modalContenido}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.modalTitulo}>Modificar Registro</Text>

            <Text style={styles.label}>Nivel de Azúcar:</Text>
            <TextInput style={styles.input} keyboardType="numeric" value={editAzucar} onChangeText={setEditAzucar} />

            <Text style={styles.label}>¿Cuándo se midió?:</Text>
            <View style={styles.selectorContenedorVertical}>
              {MOMENTOS.map((opcion) => (
                <TouchableOpacity key={opcion} style={[styles.opcionBotonVertical, editComida === opcion && styles.opcionSeleccionada]} onPress={() => setEditComida(opcion)}>
                  <Text style={[styles.opcionTexto, editComida === opcion && styles.opcionTextoSeleccionado]}>{opcion}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>¿Antes o después de comer?:</Text>
            <View style={styles.selectorContenedorHorizontal}>
              {RELACIONES.map((opcion) => (
                <TouchableOpacity key={opcion} style={[styles.opcionBotonHorizontal, editRelacion === opcion && styles.opcionSeleccionada]} onPress={() => setEditRelacion(opcion)}>
                  <Text style={[styles.opcionTexto, editRelacion === opcion && styles.opcionTextoSeleccionado]}>{opcion}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.label}>Fecha:</Text>
            <View style={styles.filaFecha}>
              <Text style={styles.textoFechaActual}>
                {editFecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })}
              </Text>
              <TouchableOpacity onPress={() => setMostrarPickerModal(true)} style={styles.botonCalendario}>
                <Text style={styles.emojiCalendario}>📅</Text>
              </TouchableOpacity>
            </View>
            {mostrarPickerModal && (
              <DateTimePicker
                value={editFecha}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  setMostrarPickerModal(false);
                  if (selectedDate) setEditFecha(selectedDate);
                }}
              />
            )}

            <Text style={styles.label}>Hora:</Text>
            <View style={styles.filaFecha}>
              <Text style={styles.textoFechaActual}>
                {editFecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
              </Text>
              <TouchableOpacity onPress={() => setMostrarPickerHoraModal(true)} style={styles.botonCalendario}>
                <Text style={styles.emojiCalendario}>🕒</Text>
              </TouchableOpacity>
            </View>
            {mostrarPickerHoraModal && (
              <DateTimePicker
                value={editFecha}
                mode="time"
                is24Hour={true}
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedTime) => {
                  setMostrarPickerHoraModal(false);
                  if (selectedTime) {
                    const nuevaFecha = new Date(editFecha);
                    nuevaFecha.setHours(selectedTime.getHours());
                    nuevaFecha.setMinutes(selectedTime.getMinutes());
                    setEditFecha(nuevaFecha);
                  }
                }}
              />
            )}

            <Text style={styles.label}>Comentario:</Text>
            <TextInput style={styles.input} value={editComentario} onChangeText={setEditComentario} />

            <TouchableOpacity style={styles.botonActualizarModal} onPress={handleActualizar}>
              <Text style={styles.botonTexto}>Aplicar Cambios</Text>
            </TouchableOpacity>

            <View style={styles.filaBotonesModal}>
              <TouchableOpacity style={styles.botonBorrar} onPress={handleBorrar}>
                <Text style={styles.botonTexto}>Borrar</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.botonCancelar} onPress={onCerrar}>
                <Text style={styles.botonTexto}>Cancelar</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  label: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 5 },
  input: { backgroundColor: '#f0f2f5', padding: 12, borderRadius: 8, fontSize: 18, textAlign: 'center', marginBottom: 12, fontWeight: 'bold' },

  selectorContenedorVertical: { marginBottom: 12 },
  opcionBotonVertical: { backgroundColor: '#f0f2f5', padding: 12, borderRadius: 8, marginBottom: 6, alignItems: 'center', borderWidth: 1, borderColor: '#e1e8ed' },
  opcionSeleccionada: { backgroundColor: '#007bff', borderColor: '#007bff' },
  opcionTexto: { fontSize: 15, color: '#333', fontWeight: '500' },
  opcionTextoSeleccionado: { color: '#fff', fontWeight: 'bold' },

  selectorContenedorHorizontal: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  opcionBotonHorizontal: { flex: 1, backgroundColor: '#f0f2f5', padding: 12, borderRadius: 8, alignItems: 'center', borderWidth: 1, borderColor: '#e1e8ed' },

  filaFecha: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', backgroundColor: '#f0f2f5', padding: 12, borderRadius: 8, marginBottom: 12 },
  textoFechaActual: { fontSize: 18, fontWeight: 'bold', color: '#333' },
  botonCalendario: { padding: 4 },
  emojiCalendario: { fontSize: 22 },

  modalCentrado: { flex: 1, justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', padding: 20 },
  modalContenido: { backgroundColor: '#fff', borderRadius: 20, padding: 20, elevation: 5, maxHeight: '85%' },
  modalTitulo: { fontSize: 20, fontWeight: 'bold', marginBottom: 15, textAlign: 'center' },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
  botonActualizarModal: { backgroundColor: '#28a745', padding: 12, borderRadius: 10, alignItems: 'center', marginTop: 15 },
  filaBotonesModal: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 10, gap: 10 },
  botonBorrar: { backgroundColor: '#dc3545', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' },
  botonCancelar: { backgroundColor: '#6c757d', padding: 12, borderRadius: 10, flex: 1, alignItems: 'center' },
});