// src/pages/api/personal/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    // --- MÉTODO PUT: Editar Barbero ---
    if (req.method === 'PUT') {
        const { nom_bar, apell_bar, tel_bar, edad_bar, email, posicion, estado } = req.body;

        try {
            const query = `
                UPDATE barber
                SET nom_bar = $1, apell_bar = $2, tel_bar = $3, edad_bar = $4, email = $5, posicion = $6, estado = $7
                WHERE id_bar = $8
                RETURNING *;
            `;
            const values = [nom_bar, apell_bar, tel_bar, parseInt(edad_bar, 10), email, posicion, estado, id];
            const result = await db.query(query, values);

            if (result.rowCount === 0) return res.status(404).json({ message: 'Barbero no encontrado' });
            return res.status(200).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API (PUT personal):", error);
            if (error.code === '23505') {
                 return res.status(409).json({ message: 'Error: El email ya está en uso por otro barbero.' });
            }
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }

    // --- MÉTODO DELETE: Cambiar estado a 'Inactivo' (Soft Delete) ---
    // ¡Es mejor práctica no borrar barberos por el historial de servicios!
    if (req.method === 'DELETE') {
         try {
            const query = `
                UPDATE barber
                SET estado = 'Inactivo'
                WHERE id_bar = $1
                RETURNING *;
            `;
            const result = await db.query(query, [id]);

            if (result.rowCount === 0) return res.status(404).json({ message: 'Barbero no encontrado' });
            return res.status(200).json({ message: 'Barbero desactivado', user: result.rows[0] });

        } catch (error) {
            console.error("Error en API (DELETE personal):", error);
            return res.status(500).json({ message: 'Error interno del servidor' });
        }
    }
    
    return res.status(405).json({ message: 'Método no permitido' });
}