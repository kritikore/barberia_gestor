// src/pages/api/clientes/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Importa la conexión

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // ---------------------------------
    // MÉTODO POST: CREAR NUEVO CLIENTE
    // ---------------------------------
    if (req.method === 'POST') {
        const { nom_clie, apell_clie, tel_clie, edad_clie, ocupacion } = req.body;

        // Validaciones (deberías añadir más)
        if (!nom_clie || !apell_clie || !tel_clie || !edad_clie || !ocupacion) {
            return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }

        try {
            // Asumimos que el barbero '1' (Julio) es el que registra
            const id_bar_default = 1; 

            const query = `
                INSERT INTO cliente (nom_clie, apell_clie, tel_clie, edad_clie, ocupacion, id_bar)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *; 
            `;
            const values = [nom_clie, apell_clie, tel_clie, parseInt(edad_clie, 10), ocupacion, id_bar_default];
            
            const result = await db.query(query, values);

            return res.status(201).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API al crear cliente:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // ---------------------------------
    // MÉTODO GET: LISTAR CLIENTES (Para la tabla)
    // ---------------------------------
    if (req.method === 'GET') {
        try {
            const result = await db.query('SELECT * FROM cliente ORDER BY id_clie DESC');
            return res.status(200).json(result.rows);
        } catch (error: any) {
             console.error("Error en API al listar clientes:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // Si es otro método
    return res.status(405).json({ message: 'Método no permitido' });
}