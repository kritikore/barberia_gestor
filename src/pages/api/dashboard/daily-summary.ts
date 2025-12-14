// src/pages/api/dashboard/daily-summary.ts

import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    try {
        // Consulta SQL optimizada para obtener las 4 métricas en una sola llamada
        const getDailySummaryQuery = `
            WITH ServiciosHoy AS (
                SELECT
                    COALESCE(SUM(TOTAL), 0) AS total_servicios,
                    COUNT(*) AS conteo_servicios,
                    COUNT(DISTINCT ID_CLIE) AS clientes_atendidos
                FROM SERVICIO_REALIZADO
                WHERE FECHA = CURRENT_DATE
            ),
            VentasHoy AS (
                SELECT COALESCE(SUM(V.Total), 0) AS total_ventas
                FROM VENTA V
                WHERE V.DIA = EXTRACT(DAY FROM CURRENT_DATE) 
                  AND V.MES = EXTRACT(MONTH FROM CURRENT_DATE) 
                  AND V.AO = EXTRACT(YEAR FROM CURRENT_DATE)
            ),
            -- 🔑 NUEVO: Obtener la próxima cita pendiente de hoy
            ProximaCita AS (
                SELECT hora
                FROM cita
                WHERE fecha = CURRENT_DATE 
                  AND estado = 'Confirmada' 
                  AND hora >= CURRENT_TIME
                ORDER BY hora ASC
                LIMIT 1
            )
            SELECT
                (SELECT total_servicios FROM ServiciosHoy) + (SELECT total_ventas FROM VentasHoy) AS "ingresosHoy",
                (SELECT conteo_servicios FROM ServiciosHoy) AS "serviciosHoy",
                (SELECT clientes_atendidos FROM ServiciosHoy) AS "clientesAtendidos",
                (SELECT hora FROM ProximaCita) AS "proximaCita";
        `;

        const result = await db.query(getDailySummaryQuery);
        const metrics = result.rows[0];

        // Formatear hora (quitar segundos si viene como 15:30:00)
        const nextAppt = metrics.proximaCita ? metrics.proximaCita.toString().substring(0, 5) : null;

        res.status(200).json({
            ingresos: parseFloat(metrics.ingresosHoy) || 0,
            servicios: parseInt(metrics.serviciosHoy, 10) || 0,
            clientes: parseInt(metrics.clientesAtendidos, 10) || 0,
            proximaCita: nextAppt // Ahora devuelve la hora real o null
        });

    } catch (error: any) {
        console.error("Error en API (daily-summary):", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    }
}