// src/pages/api/configuracion/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Importa tu conexión a la DB

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // Asumimos que la configuración siempre tiene el id = 1
    const CONFIG_ID = 1; 

    // --- MÉTODO GET: Leer la configuración actual (REQ-CONF1) ---
    if (req.method === 'GET') {
        try {
            const query = 'SELECT * FROM configuracion_negocio WHERE id_config = $1';
            const result = await db.query(query, [CONFIG_ID]);
            
            if (result.rows.length === 0) {
                return res.status(404).json({ message: 'Configuración no encontrada.' });
            }
            return res.status(200).json(result.rows[0]);
        } catch (error: any) {
             console.error("Error en API al leer configuración:", error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    // --- MÉTODO PUT: Actualizar la configuración (REQ-CONF1) ---
    if (req.method === 'PUT') {
        const { nombre_negocio, direccion, telefono, horario, politica_cancelacion, moneda } = req.body;

        if (!nombre_negocio) {
            return res.status(400).json({ message: 'El nombre del negocio es obligatorio.' });
        }

        try {
            const query = `
                UPDATE configuracion_negocio
                SET 
                    nombre_negocio = $1,
                    direccion = $2,
                    telefono = $3,
                    horario = $4,
                    politica_cancelacion = $5,
                    moneda = $6
                WHERE id_config = $7
                RETURNING *; 
            `;
            const values = [nombre_negocio, direccion, telefono, horario, politica_cancelacion, moneda, CONFIG_ID];
            
            const result = await db.query(query, values);
            return res.status(200).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API al actualizar configuración:", error);
            return res.status(500).json({ message: 'Error al guardar configuración' });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}