import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Solo permitimos GET
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    try {
        // 🧠 LÓGICA DE NEGOCIO:
        // En lugar de buscar en una tabla 'VENTA' vacía,
        // convertimos las 'CITAS COMPLETADAS' en ventas reales para el reporte.
        const query = `
            SELECT 
                c.id_cita as "id_venta", -- Alias para que el frontend lo lea bien
                EXTRACT(DAY FROM c.fecha) as "dia",
                EXTRACT(MONTH FROM c.fecha) as "mes",
                EXTRACT(YEAR FROM c.fecha) as "ao",
                s.precio as "total",
                -- Concatenamos nombre del barbero (vendedor)
                CONCAT(b.nom_bar, ' ', b.apell_bar) as "vendedor",
                -- El servicio cuenta como el producto vendido
                s.tipo as "productos"
            FROM cita c
            JOIN barber b ON c.id_bar = b.id_bar
            JOIN servicio s ON c.id_serv = s.id_serv
            WHERE c.estado = 'Completada' -- ¡IMPORTANTE! Solo lo que ya se cobró
            ORDER BY c.fecha DESC, c.hora DESC
            LIMIT 50;
        `;
        
        const result = await db.query(query);
        return res.status(200).json(result.rows);

    } catch (error: any) {
        console.error("Error en historial de ventas:", error);
        return res.status(500).json({ message: error.message });
    }
}