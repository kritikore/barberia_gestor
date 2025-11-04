// src/pages/api/insumos/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'ID de insumo no proporcionado' });
    }

    // --- 2. ACTUALIZAR STOCK (PATCH) ---
    if (req.method === 'PATCH') {
        try {
            const { stock } = req.body; 

            if (stock === undefined) {
                return res.status(400).json({ message: 'Nuevo stock no proporcionado' });
            }
            
            const stockNum = parseInt(stock, 10);
            if (isNaN(stockNum) || stockNum < 0) {
                return res.status(400).json({ message: 'El stock debe ser un número positivo' });
            }

            const query = `
                UPDATE isumo
                SET STOCK = $1
                WHERE id_insu = $2
                RETURNING *;
            `;
            const result = await db.query(query, [stockNum, id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Insumo no encontrado' });
            }

            return res.status(200).json(result.rows[0]);

        } catch (error: any) {
             console.error("Error en API al actualizar stock de insumo:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // (Aquí podrías añadir PUT para editar nombre, o DELETE para borrar)

    return res.status(405).json({ message: 'Método no permitido' });
}