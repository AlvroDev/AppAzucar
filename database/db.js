import * as SQLite from 'expo-sqlite';

export const initDB = async () => {
  const database = await SQLite.openDatabaseAsync('walterdiabetes_v2.db');
  await database.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS mediciones (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      valor INTEGER NOT NULL,
      fecha TEXT NOT NULL,
      momento TEXT NOT NULL,
      comentario TEXT
    );
  `);
  return database;
};

export const obtenerMediciones = async (database) => {
  return await database.getAllAsync('SELECT * FROM mediciones ORDER BY fecha DESC');
};

export const insertarMedicion = async (database, { valor, fecha, momento, comentario }) => {
  await database.runAsync(
    'INSERT INTO mediciones (valor, fecha, momento, comentario) VALUES (?, ?, ?, ?)',
    [valor, fecha, momento, comentario]
  );
};

export const actualizarMedicionDB = async (database, { id, valor, momento, comentario, fecha }) => {
  await database.runAsync(
    'UPDATE mediciones SET valor = ?, momento = ?, comentario = ?, fecha = ? WHERE id = ?',
    [valor, momento, comentario, fecha, id]
  );
};

export const borrarMedicionDB = async (database, id) => {
  await database.runAsync('DELETE FROM mediciones WHERE id = ?', [id]);
};