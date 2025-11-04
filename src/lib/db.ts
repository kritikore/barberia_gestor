// src/lib/db.ts
import { Pool } from 'pg';

// Declaramos 'db' una sola vez
let db: Pool;

// TypeScript necesita que definamos 'pgPool' en el objeto global
declare global {
  var pgPool: Pool | undefined;
}

// Esta lógica previene que se creen nuevas conexiones en cada recarga 
// en el entorno de desarrollo (hot reload)
if (process.env.NODE_ENV === 'production') {
  // En producción, crea la conexión una vez
  db = new Pool({
    connectionString: process.env.POSTGRES_URL,
    ssl: {
      rejectUnauthorized: false, // Necesario para la mayoría de hosts de DB gratuitos
    },
  });
} else {
  // En desarrollo, usa el objeto global para guardar la conexión
  if (!global.pgPool) {
    global.pgPool = new Pool({
      connectionString: process.env.POSTGRES_URL,
      // SSL usualmente no es necesario para localhost
      ssl: false, 
    });
  }
  db = global.pgPool;
}

// Exporta la conexión
export { db };