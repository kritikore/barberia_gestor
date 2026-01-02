import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).json({ message: 'Method Not Allowed' });

    const { fecha } = req.query; 

    try {
        const dateFilterCitas = fecha && fecha !== 'todos' ? `AND c.fecha = '${fecha}'` : '';
        const dateFilterVentas = fecha && fecha !== 'todos' ? `AND DATE(vp.fecha) = '${fecha}'` : '';
        const limit = fecha === 'todos' ? 'LIMIT 100' : '';

        const query = `
            WITH HistorialUnificado AS (
                -- 1. INGRESOS POR SERVICIOS (Citas Completadas)
                SELECT 
                    'SERVICIO' as tipo,
                    c.id_cita as id_referencia,
                    c.fecha,
                    c.hora::text, -- 👈 AQUÍ ESTÁ EL ARREGLO (Convertimos TIME a TEXT)
                    s.precio as total,
                    COALESCE(b.nom_bar || ' ' || b.apell_bar, 'Sin Asignar') as vendedor,
                    s.tipo as detalle
                FROM cita c
                JOIN barber b ON c.id_bar = b.id_bar
                JOIN servicio s ON c.id_serv = s.id_serv
                WHERE c.estado = 'Completada' ${dateFilterCitas}

                UNION ALL

                -- 2. INGRESOS POR PRODUCTOS (Ventas de Tienda)
                SELECT 
                    'PRODUCTO' as tipo,
                    vp.id_venta as id_referencia,
                    DATE(vp.fecha) as fecha,
                    TO_CHAR(vp.fecha, 'HH24:MI:SS') as hora, -- Esto ya devuelve TEXT
                    vp.total,
                    COALESCE(b.nom_bar || ' ' || b.apell_bar, 'Caja') as vendedor,
                    p.nom_prod || ' (x' || vp.cantidad || ')' as detalle
                FROM venta_producto vp
                JOIN producto p ON vp.id_prod = p.id_prod
                LEFT JOIN barber b ON vp.id_bar = b.id_bar
                WHERE 1=1 ${dateFilterVentas}
            )
            SELECT * FROM HistorialUnificado
            ORDER BY fecha DESC, hora DESC
            ${limit};
        `;
        
        const result = await db.query(query);
        return res.status(200).json(result.rows);

    } catch (error: any) {
        console.error("Error historial:", error);
        return res.status(500).json([]);
    }
}