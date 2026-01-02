// src/lib/db.ts
import { Pool } from 'pg';

let db: Pool;

declare global {
  var pgPool: Pool | undefined;
}

// Usamos 127.0.0.1 para evitar problemas de resolución de DNS en Node 18+
const connectionString = process.env.DATABASE_URL || process.env.POSTGRES_URL;

// Determinar si necesitamos SSL (solo si NO es localhost/127.0.0.1)
const isLocalhost = connectionString?.includes('localhost') || connectionString?.includes('127.0.0.1');

if (process.env.NODE_ENV === 'production') {
  db = new Pool({
    connectionString: connectionString,
    // ✅ Solo usa SSL si NO estamos en localhost
    ssl: isLocalhost ? false : { rejectUnauthorized: false },
  });
} else {
  if (!global.pgPool) {
    global.pgPool = new Pool({
      connectionString: connectionString,
      ssl: false, 
    });
  }
  db = global.pgPool;
}

export { db };