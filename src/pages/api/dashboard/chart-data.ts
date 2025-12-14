// src/pages/api/dashboard/chart-data.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        // Usamos MAKE_DATE para crear fechas válidas desde los números
        const query = `
            WITH DailySales AS (
                -- 1. Ingresos por Servicios (Bitácora)
                SELECT FECHA, SUM(TOTAL) as total
                FROM SERVICIO_REALIZADO
                WHERE FECHA >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY FECHA
                
                UNION ALL
                
                -- 2. Ingresos por Ventas de Productos (Tienda)
                SELECT MAKE_DATE(AO::int, MES::int, DIA::int) as FECHA, SUM(Total) as total
                FROM VENTA
                WHERE MAKE_DATE(AO::int, MES::int, DIA::int) >= CURRENT_DATE - INTERVAL '7 days'
                GROUP BY FECHA
            )
            SELECT 
                TO_CHAR(FECHA, 'DD/MM') as fecha, 
                SUM(total) as total
            FROM DailySales
            GROUP BY FECHA
            ORDER BY MIN(FECHA) ASC;
        `;
        
        const result = await db.query(query);
        
        const formattedData = result.rows.map(row => ({
            fecha: row.fecha,
            total: parseFloat(row.total)
        }));

        res.status(200).json(formattedData);

    } catch (error: any) {
        console.error("Error gráfico:", error);
        // Devolvemos un array vacío en lugar de romper la página, pero logueamos el error
        res.status(200).json([]); 
    }
}