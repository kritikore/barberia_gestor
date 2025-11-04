import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Importa la conexión desde el archivo corregido

// Esta es la consulta SQL de PostgreSQL que diseñamos
const getDashboardMetricsQuery = `
    WITH ServiciosHoy AS (
        SELECT
            COALESCE(SUM(TOTAL), 0) AS total_servicios,
            COUNT(*) AS conteo_servicios,
            COUNT(DISTINCT ID_CLIE) AS clientes_atendidos
        FROM SERVICIO_REALIZADO
        WHERE FECHA = CURRENT_DATE
    ),
    VentasHoy AS (
        SELECT
            COALESCE(SUM(V.Total), 0) AS total_ventas,
            COALESCE(SUM(DV.CANTIDAD), 0) AS productos_vendidos
        FROM VENTA V
        JOIN detalle_venta DV ON V.ID_VENTA = DV.ID_VENTA
        WHERE V.DIA = EXTRACT(DAY FROM CURRENT_DATE)
          AND V.MES = EXTRACT(MONTH FROM CURRENT_DATE)
          AND V.AO = EXTRACT(YEAR FROM CURRENT_DATE)
    )
    SELECT
        (SELECT total_servicios FROM ServiciosHoy) + (SELECT total_ventas FROM VentasHoy) AS "totalRevenue",
        (SELECT conteo_servicios FROM ServiciosHoy) AS "servicesCount",
        (SELECT productos_vendidos FROM VentasHoy) AS "productsSoldCount",
        (SELECT clientes_atendidos FROM ServiciosHoy) AS "clientsAttended";
`;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        // Ejecutamos la consulta en la base de datos
        const result = await db.query(getDashboardMetricsQuery);

        // PostgreSQL devuelve los números como strings, los convertimos
        const metrics = {
            totalRevenue: parseFloat(result.rows[0].totalRevenue) || 0,
            servicesCount: parseInt(result.rows[0].servicesCount, 10) || 0,
            productsSoldCount: parseInt(result.rows[0].productsSoldCount, 10) || 0,
            clientsAttended: parseInt(result.rows[0].clientsAttended, 10) || 0,
        };

        // Devolvemos los datos listos para el frontend
        res.status(200).json(metrics);

    } catch (error) {
        console.error("Error al consultar métricas del Dashboard:", error);
        res.status(500).json({ message: 'Error interno del servidor' });
    }
}