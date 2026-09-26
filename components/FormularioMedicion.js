import React, { useState } from 'react';
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { MOMENTOS, RELACIONES } from '../utils/formato';
import { Ionicons } from '@expo/vector-icons';

export default function FormularioMedicion({ onGuardar }) {
  const [azucar, setAzucar] = useState('');
  const [comida, setComida] = useState('Desayuno');
  const [relacion, setRelacion] = useState('Antes');
  const [comentario, setComentario] = useState('');
  const [fecha, setFecha] = useState(new Date());
  const [mostrarPicker, setMostrarPicker] = useState(false);
  const [mostrarPickerHora, setMostrarPickerHora] = useState(false);

  const handleGuardar = async () => {
    const exito = await onGuardar({ azucar, fecha, relacion, comida, comentario });
    if (exito) {
      setAzucar('');
      setComentario('');
      setComida('Desayuno');
      setRelacion('Antes');
      setFecha(new Date());
    }
  };

  return (
    <View style={styles.card}>
      <Text style={styles.label}>Ingrese el valor actual (mg/dL):</Text>
      <TextInput
        style={styles.input}
        placeholder="Ej. 120"
        placeholderTextColor="#999"
        keyboardType="numeric"
        value={azucar}
        onChangeText={setAzucar}
      />

      <Text style={styles.label}>¿Cuándo se midió?:</Text>
      <View style={styles.selectorContenedorVertical}>
        {MOMENTOS.map((opcion) => (
          <TouchableOpacity
            key={opcion}
            style={[styles.opcionBotonVertical, comida === opcion && styles.opcionSeleccionada]}
            onPress={() => setComida(opcion)}
          >
            <Text style={[styles.opcionTexto, comida === opcion && styles.opcionTextoSeleccionado]}>
              {opcion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>¿Antes o después de comer?:</Text>
      <View style={styles.selectorContenedorHorizontal}>
        {RELACIONES.map((opcion) => (
          <TouchableOpacity
            key={opcion}
            style={[styles.opcionBotonHorizontal, relacion === opcion && styles.opcionSeleccionada]}
            onPress={() => setRelacion(opcion)}
          >
            <Text style={[styles.opcionTexto, relacion === opcion && styles.opcionTextoSeleccionado]}>
              {opcion}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={styles.label}>Fecha:</Text>
      <View style={styles.filaFecha}>
        <Text style={styles.textoFechaActual}>
          {fecha.toLocaleDateString('es-ES', { day: 'numeric', month: 'numeric', year: 'numeric' })}
        </Text>
        <TouchableOpacity onPress={() => setMostrarPicker(true)} style={styles.botonCalendario}>
          <Ionicons name="calendar-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>
      {mostrarPicker && (
        <DateTimePicker
          value={fecha}
          mode="date"
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedDate) => {
            setMostrarPicker(false);
            if (selectedDate) setFecha(selectedDate);
          }}
        />
      )}

      <Text style={styles.label}>Hora:</Text>
      <View style={styles.filaFecha}>
        <Text style={styles.textoFechaActual}>
          {fecha.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
        </Text>
        <TouchableOpacity onPress={() => setMostrarPickerHora(true)} style={styles.botonCalendario}>
          <Ionicons name="time-outline" size={22} color="#333" />
        </TouchableOpacity>
      </View>
      {mostrarPickerHora && (
        <DateTimePicker
          value={fecha}
          mode="time"
          is24Hour={true}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
          onChange={(event, selectedTime) => {
            setMostrarPickerHora(false);
            if (selectedTime) {
              const nuevaFecha = new Date(fecha);
              nuevaFecha.setHours(selectedTime.getHours());
              nuevaFecha.setMinutes(selectedTime.getMinutes());
              setFecha(nuevaFecha);
            }
          }}
        />
      )}

      <Text style={styles.label}>Comentarios u observaciones (Opcional):</Text>
      <TextInput
        style={[styles.input, styles.inputComentario]}
        placeholder="Ej. Cambié de medicación, me sentía mareado..."
        placeholderTextColor="#999"
        value={comentario}
        onChangeText={setComentario}
        multiline={true}
        numberOfLines={2}
      />

      <TouchableOpacity style={styles.botonGuardar} onPress={handleGuardar}>
        <Text style={styles.botonTexto}>Guardar Medición</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { backgroundColor: '#fff', padding: 15, borderRadius: 12, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 4 },
  label: { fontSize: 15, fontWeight: '600', color: '#444', marginBottom: 8, marginTop: 5 },
  input: { backgroundColor: '#f0f2f5', padding: 12, borderRadius: 8, fontSize: 18, textAlign: 'center', marginBottom: 12, fontWeight: 'bold' },
  inputComentario: { fontSize: 14, textAlign: 'left', fontWeight: 'normal', height: 65, textAlignVertical: 'top' },

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

  botonGuardar: { backgroundColor: '#28a745', padding: 15, borderRadius: 8, alignItems: 'center', marginTop: 5 },
  botonTexto: { color: '#fff', fontSize: 16, fontWeight: 'bold' },
});