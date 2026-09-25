import { useState, useEffect, useCallback } from 'react';
import { Alert } from 'react-native';
import {
  initDB,
  obtenerMediciones,
  insertarMedicion,
  actualizarMedicionDB,
  borrarMedicionDB,
} from '../database/db';
import { construirMomento } from '../utils/formato';

export default function useMediciones() {
  const [db, setDb] = useState(null);
  const [historial, setHistorial] = useState([]);

  useEffect(() => {
    (async () => {
      const database = await initDB();
      setDb(database);
      const mediciones = await obtenerMediciones(database);
      setHistorial(mediciones);
    })();
  }, []);

  const cargarMediciones = useCallback(async (database) => {
    const databaseInstance = database || db;
    if (!databaseInstance) return;
    const mediciones = await obtenerMediciones(databaseInstance);
    setHistorial(mediciones);
  }, [db]);

  const guardarMedicion = useCallback(async ({ azucar, fecha, relacion, comida, comentario }) => {
    if (!azucar) {
      Alert.alert('Error', 'Por favor, ingresa el valor de azúcar.');
      return false;
    }
    const momento = construirMomento(relacion, comida);
    try {
      await insertarMedicion(db, {
        valor: parseInt(azucar),
        fecha: fecha.toISOString(),
        momento,
        comentario,
      });
      await cargarMediciones();
      Alert.alert('¡Éxito!', 'Medición guardada correctamente.');
      return true;
    } catch (error) {
      console.error('Error al guardar:', error);
      Alert.alert('Error', 'No se pudo guardar.');
      return false;
    }
  }, [db, cargarMediciones]);

  const actualizarMedicion = useCallback(async ({ id, azucar, editRelacion, editComida, comentario, fecha }) => {
    const momento = construirMomento(editRelacion, editComida);
    try {
      await actualizarMedicionDB(db, {
        id,
        valor: parseInt(azucar),
        momento,
        comentario,
        fecha: fecha.toISOString(),
      });
      await cargarMediciones();
      Alert.alert('Actualizado', 'La medición ha sido corregida.');
      return true;
    } catch (error) {
      console.error('Error al actualizar:', error);
      Alert.alert('Error', 'No se pudo actualizar.');
      return false;
    }
  }, [db, cargarMediciones]);

  const borrarMedicion = useCallback(async (id) => {
    await borrarMedicionDB(db, id);
    await cargarMediciones();
  }, [db, cargarMediciones]);

  return {
    historial,
    guardarMedicion,
    actualizarMedicion,
    borrarMedicion,
  };
}