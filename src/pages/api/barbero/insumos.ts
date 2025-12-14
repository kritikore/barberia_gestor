// src/pages/api/barbero/insumos.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // GET: Obtener insumos de un barbero
    if (req.method === 'GET') {
        const { id_bar } = req.query;
        if (!id_bar) return res.status(400).json({ message: 'Falta ID Barbero' });

        try {
            const query = `
                SELECT ib.id_ib, i.nombre, ib.usos_restantes, i.capacidad_total, ib.estado
                FROM INSUMO_BARBERO ib
                JOIN INSUMO i ON ib.id_insumo = i.id_insumo
                WHERE ib.id_bar = $1
                ORDER BY ib.usos_restantes ASC; -- Los más vacíos primero
            `;
            const result = await db.query(query, [id_bar]);
            return res.status(200).json(result.rows);
        } catch (error: any) {
            return res.status(500).json({ message: error.message });
        }
    }

    // PUT: Solicitar Restock (Cambiar estado)
    if (req.method === 'PUT') {
        const { id_ib, accion } = req.body;

        if (accion === 'solicitar') {
            try {
                await db.query("UPDATE INSUMO_BARBERO SET estado = 'Solicitado' WHERE id_ib = $1", [id_ib]);
                return res.status(200).json({ message: 'Solicitado' });
            } catch (error: any) {
                return res.status(500).json({ message: error.message });
            }
        }
    }

    return res.status(405).end();
}