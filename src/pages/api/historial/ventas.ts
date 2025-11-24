// src/pages/api/historial/ventas.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        const query = `
            SELECT 
                v.ID_VENTA,
                v.DIA, v.MES, v.AO,
                v.Total,
                b.nom_bar || ' ' || b.apell_bar as vendedor,
                -- Agrupamos los productos en un string para mostrar en la tabla
                STRING_AGG(p.nom_prod || ' (' || dv.CANTIDAD || ')', ', ') as productos
            FROM VENTA v
            JOIN barber b ON v.ID_BAR = b.id_bar
            JOIN detalle_venta dv ON v.ID_VENTA = dv.ID_VENTA
            JOIN PRODUCTO p ON dv.ID_PROD = p.id_prod
            GROUP BY v.ID_VENTA, v.DIA, v.MES, v.AO, v.Total, b.nom_bar, b.apell_bar
            ORDER BY v.ID_VENTA DESC
            LIMIT 50; -- Mostramos las últimas 50 ventas
        `;
        
        const result = await db.query(query);
        res.status(200).json(result.rows);

    } catch (error: any) {
        console.error(error);
        res.status(500).json({ message: error.message });
    }
}