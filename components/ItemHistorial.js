import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import { formatearFecha, formatearHora, obtenerColorAzucar } from '../utils/formato';
import { Ionicons } from '@expo/vector-icons';

export default function ItemHistorial({ item, onLongPress }) {
  let posicionMomento = 'flex-start';
  if (item.momento.includes('Almuerzo')) {
    posicionMomento = 'center';
  } else if (item.momento.includes('Cena')) {
    posicionMomento = 'flex-end';
  }

  return (
    <TouchableOpacity
      style={styles.itemHistorial}
      onLongPress={onLongPress}
      delayLongPress={500}
    >
      <View style={styles.filaSuperior}>
        <Text style={[styles.valorTexto, { color: obtenerColorAzucar(item.valor) }]}>
          {item.valor} <Text style={styles.unidadTexto}>mg/dL</Text>
        </Text>
        <View style={styles.contenedorFechaHora}>
          <Text style={styles.fechaTexto}>{formatearFecha(item.fecha)},</Text>
          <Text style={styles.horaTexto}>{formatearHora(item.fecha)}</Text>
        </View>
      </View>

      <View style={[styles.filaMomentoDinamica, { justifyContent: posicionMomento }]}>
        <Text style={styles.momentoTexto}>{item.momento}</Text>
      </View>

      {item.comentario ? (
        <View style={styles.contenedorComentario}>
          <Ionicons name="chatbubble-ellipses-outline" size={16} color="#333" />
          <Text style={styles.comentarioTexto} numberOfLines={2}>
            {item.comentario}
          </Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  itemHistorial: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 12,
    marginTop: 10,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#e1e8ed',
  },
  filaSuperior: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  valorTexto: { fontSize: 28, fontWeight: 'bold' },
  unidadTexto: { fontSize: 16, color: '#666', fontWeight: 'normal' },
  contenedorFechaHora: { alignItems: 'flex-end' },
  fechaTexto: { fontSize: 13, color: '#777' },
  horaTexto: { fontSize: 13, color: '#777', marginTop: 2 },

  filaMomentoDinamica: {
    flexDirection: 'row',
    width: '100%',
    marginVertical: 8,
  },
  momentoTexto: { fontSize: 15, fontWeight: '700', color: '#111' },

contenedorComentario: {
  flexDirection: 'row',
  alignItems: 'flex-start',
  backgroundColor: '#f0f2f5',
  borderRadius: 8,
  padding: 8,
  marginTop: 4,
},
iconoComentario: {
  marginTop: 2,
  marginRight: 6,
},
comentarioTexto: {
  flex: 1,
  fontSize: 13,
  color: '#555',
  fontStyle: 'italic',
},
});