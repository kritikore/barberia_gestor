// src/pages/api/personal/metrics.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        // Consulta para contar empleados por estado
        const query = `
            SELECT 
                COUNT(*) AS total,
                COUNT(CASE WHEN estado = 'Activo' THEN 1 END) AS activos,
                COUNT(CASE WHEN estado = 'Inactivo' THEN 1 END) AS inactivos
            FROM barber;
        `;
        const result = await db.query(query);
        const metrics = result.rows[0];

        res.status(200).json({
            total: parseInt(metrics.total, 10),
            activos: parseInt(metrics.activos, 10),
            inactivos: parseInt(metrics.inactivos, 10),
        });

    } catch (error) {
        console.error("Error en API (metrics personal):", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}