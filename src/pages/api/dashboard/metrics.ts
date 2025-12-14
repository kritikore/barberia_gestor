// src/pages/api/dashboard/metrics.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'GET') return res.status(405).end();

    try {
        // 1. INGRESOS DESGLOSADOS (Servicios vs Productos) - Mes Actual
        const serviciosQuery = `
            SELECT COALESCE(SUM(total), 0) as total 
            FROM servicio_realizado 
            WHERE EXTRACT(MONTH FROM fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
            AND EXTRACT(YEAR FROM fecha) = EXTRACT(YEAR FROM CURRENT_DATE);
        `;
        
        const productosQuery = `
            SELECT COALESCE(SUM(total), 0) as total 
            FROM venta 
            WHERE mes = EXTRACT(MONTH FROM CURRENT_DATE)::int
            AND ao = EXTRACT(YEAR FROM CURRENT_DATE)::int;
        `;

        // 2. ALERTAS DE INSUMOS (Bodega Baja)
        const insumosAlertQuery = `
            SELECT COUNT(*) as alertas FROM insumo WHERE stock_bodega <= nivel_alerta;
        `;

        // 3. MEJOR BARBERO DEL MES (Por dinero generado)
        const topBarberQuery = `
            SELECT b.nom_bar, SUM(sr.total) as total
            FROM servicio_realizado sr
            JOIN barber b ON sr.id_bar = b.id_bar
            WHERE EXTRACT(MONTH FROM sr.fecha) = EXTRACT(MONTH FROM CURRENT_DATE)
            GROUP BY b.nom_bar
            ORDER BY total DESC
            LIMIT 1;
        `;

        // 4. METRICAS GENERALES (Las que ya tenías)
        const citasQuery = `SELECT COUNT(*) as total FROM cita WHERE (estado = 'Pendiente' OR estado = 'Confirmada') AND fecha >= CURRENT_DATE;`;
        const clientesQuery = `SELECT COUNT(*) as total FROM cliente;`;
        const proxCitaQuery = `SELECT hora FROM cita WHERE fecha = CURRENT_DATE AND hora >= CURRENT_TIME AND estado != 'Cancelada' ORDER BY hora ASC LIMIT 1;`;

        // Ejecutar todo
        const [servRes, prodRes, insumoRes, topBarberRes, citasRes, clieRes, proxRes] = await Promise.all([
            db.query(serviciosQuery),
            db.query(productosQuery),
            db.query(insumosAlertQuery),
            db.query(topBarberQuery),
            db.query(citasQuery),
            db.query(clientesQuery),
            db.query(proxCitaQuery)
        ]);

        const totalServicios = parseFloat(servRes.rows[0]?.total || 0);
        const totalProductos = parseFloat(prodRes.rows[0]?.total || 0);

        res.status(200).json({
            // Financiero
            totalRevenue: totalServicios + totalProductos,
            desglose: {
                servicios: totalServicios,
                productos: totalProductos
            },
            // Operativo
            citasPendientes: parseInt(citasRes.rows[0]?.total || 0),
            clientesTotales: parseInt(clieRes.rows[0]?.total || 0),
            proximaCita: proxRes.rows.length > 0 ? proxRes.rows[0].hora.slice(0,5) : "Sin citas hoy",
            // Nuevos
            insumosBajos: parseInt(insumoRes.rows[0]?.alertas || 0),
            topBarber: topBarberRes.rows[0] ? topBarberRes.rows[0].nom_bar : "N/A"
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error en métricas' });
    }
}