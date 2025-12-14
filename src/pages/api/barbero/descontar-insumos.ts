// src/pages/api/barbero/descontar-insumos.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).end();

    const { id_bar } = req.body; // Necesitamos saber qué barbero hizo el corte

    if (!id_bar) return res.status(400).json({ message: 'Falta ID Barbero' });

    try {
        // Restar 1 uso a todos los insumos activos de este barbero
        // Si usos_restantes llega a 0, se queda en 0 (no negativos)
        const updateQuery = `
            UPDATE INSUMO_BARBERO
            SET usos_restantes = GREATEST(usos_restantes - 1, 0)
            WHERE id_bar = $1 AND usos_restantes > 0;
        `;
        
        await db.query(updateQuery, [id_bar]);

        // Verificar si alguno llegó a nivel crítico para alertar (Opcional: podrías retornar alertas aquí)
        
        res.status(200).json({ message: 'Insumos descontados' });

    } catch (error) {
        console.error("Error descontando insumos:", error);
        res.status(500).json({ message: 'Error interno' });
    }
}