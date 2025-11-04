// src/pages/api/servicios/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    // --- MÉTODO PUT: Editar Servicio ---
    if (req.method === 'PUT') {
        const { tipo, precio, descripcion } = req.body;

        if (!tipo || !precio) {
            return res.status(400).json({ message: 'Tipo y Precio son obligatorios.' });
        }
        
        try {
            const query = `
                UPDATE SERVICIO
                SET tipo = $1, precio = $2, descripcion = $3
                WHERE id_serv = $4
                RETURNING *;
            `;
            const values = [tipo, parseFloat(precio), descripcion, id];
            const result = await db.query(query, values);

            if (result.rowCount === 0) return res.status(404).json({ message: 'Servicio no encontrado' });
            return res.status(200).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API (PUT servicio):", error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    // --- MÉTODO DELETE: Eliminar Servicio ---
    if (req.method === 'DELETE') {
         try {
            // 1. Borrar de DETALLE_SERVICIO (para evitar error de Foreign Key)
            await db.query('DELETE FROM DETALLE_SERVICIO WHERE ID_SERV = $1', [id]);
            
            // 2. Borrar de SERVICIO
            const result = await db.query('DELETE FROM SERVICIO WHERE id_serv = $1 RETURNING *', [id]);

            if (result.rowCount === 0) return res.status(404).json({ message: 'Servicio no encontrado' });
            return res.status(200).json({ message: 'Servicio eliminado' });

        } catch (error: any) {
            console.error("Error en API (DELETE servicio):", error);
             if (error.code === '23503') { 
                 return res.status(409).json({ message: 'Error: Este servicio ya fue realizado (está en una bitácora) y no puede ser borrado.' });
            }
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
    
    return res.status(405).json({ message: 'Método no permitido' });
}