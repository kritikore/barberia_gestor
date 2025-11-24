// src/pages/api/barbero/registrar-servicio.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // Solo aceptamos POST
    if (req.method !== 'POST') {
        return res.status(405).json({ message: 'Método no permitido' });
    }

    // 🔑 CAMBIO IMPORTANTE: Ahora esperamos 'servicios' (Array), no 'id_serv' (Individual)
    const { id_clie, servicios, fecha } = req.body;

    // Validación para asegurar que hay cliente y al menos un servicio en la lista
    if (!id_clie || !servicios || !Array.isArray(servicios) || servicios.length === 0) {
        return res.status(400).json({ message: 'Faltan datos: Cliente y al menos un servicio son obligatorios.' });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN'); // Iniciar Transacción (Todo o nada)

        // Asumimos el ID del barbero logueado (ej: 1)
        const id_bar_actual = 1; 
        const fechaRegistro = fecha || new Date().toISOString().split('T')[0];

        // 🔑 BUCLE: Iteramos sobre cada servicio del ticket para guardarlo
        for (const item of servicios) {
            const { id_serv, precio } = item;

            // 1. Crear detalle (Requisito de tu DB)
            const detalleRes = await client.query(
                'INSERT INTO DETALLE_SERVICIO (ID_SERV) VALUES ($1) RETURNING ID_DESE',
                [id_serv]
            );
            const id_dese = detalleRes.rows[0].id_dese;

            // 2. Crear registro de servicio realizado
            const insertQuery = `
                INSERT INTO SERVICIO_REALIZADO (ID_DESE, FECHA, TOTAL, ID_BAR, ID_CLIE)
                VALUES ($1, $2, $3, $4, $5);
            `;
            // Usamos el precio que viene del ticket (que puede haber sido editado en el frontend)
            await client.query(insertQuery, [id_dese, fechaRegistro, parseFloat(precio), id_bar_actual, id_clie]);
        }

        await client.query('COMMIT'); // Confirmar todos los cambios
        res.status(201).json({ message: 'Servicios registrados con éxito' });

    } catch (error: any) {
        await client.query('ROLLBACK'); // Si algo falla, cancela todo
        console.error("Error al registrar servicios:", error);
        res.status(500).json({ message: 'Error interno del servidor', error: error.message });
    } finally {
        client.release();
    }
}