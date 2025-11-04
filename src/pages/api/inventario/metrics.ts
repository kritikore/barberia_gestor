import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

// 🔑 Definimos "Stock Bajo" como productos con 10 o menos unidades, pero más de 0
const STOCK_BAJO_THRESHOLD = 10;

const getInventoryMetricsQuery = `
    SELECT
        -- 1. Total de tipos de productos (SKUs)
        COUNT(*) AS "totalProductos",
        
        -- 2. Conteo de productos con Stock Bajo (entre 1 y 10)
        COUNT(CASE WHEN STOCK > 0 AND STOCK <= ${STOCK_BAJO_THRESHOLD} THEN 1 END) AS "stockBajo",
        
        -- 3. Conteo de productos Sin Stock (stock = 0)
        COUNT(CASE WHEN STOCK = 0 THEN 1 END) AS "sinStock",
        
        -- 4. Valor total del inventario (Precio * Stock)
        COALESCE(SUM(PRECIO_PROD * STOCK), 0) AS "valorTotal"
    FROM PRODUCTO;
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        const result = await db.query(getInventoryMetricsQuery);
        const metrics = result.rows[0];

        // Convertimos los resultados a números (PostgreSQL los devuelve como strings)
        res.status(200).json({
            totalProductos: parseInt(metrics.totalProductos, 10) || 0,
            stockBajo: parseInt(metrics.stockBajo, 10) || 0,
            sinStock: parseInt(metrics.sinStock, 10) || 0,
            valorTotal: parseFloat(metrics.valorTotal) || 0,
        });

    } catch (error) {
        console.error("Error al consultar métricas de inventario:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}