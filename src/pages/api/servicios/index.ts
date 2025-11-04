// src/pages/api/servicios/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Importa tu conexión a la DB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // --- MÉTODO GET: Listar todos los servicios ---
    if (req.method === 'GET') {
        try {
            const query = 'SELECT * FROM SERVICIO ORDER BY tipo ASC';
            const result = await db.query(query);
            return res.status(200).json(result.rows);
        } catch (error: any) {
             console.error("Error en API al listar servicios:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // --- MÉTODO POST: Crear nuevo servicio ---
    if (req.method === 'POST') {
        // Quitamos 'duracion_estimada_min'
        const { tipo, precio, descripcion } = req.body;

        if (!tipo || !precio) {
            return res.status(400).json({ message: 'Tipo y Precio son obligatorios.' });
        }

        try {
            const query = `
                INSERT INTO SERVICIO (tipo, precio, descripcion)
                VALUES ($1, $2, $3)
                RETURNING *; 
            `;
            const values = [tipo, parseFloat(precio), descripcion];
            
            const result = await db.query(query, values);
            return res.status(201).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API al crear servicio:", error);
            return res.status(500).json({ message: 'Error al crear servicio', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}