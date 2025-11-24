// src/pages/api/barbero/registrar-venta.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== 'POST') return res.status(405).json({ message: 'Método no permitido' });

    // Recibimos el carrito de compras y el ID del barbero
    const { carrito, total, id_bar } = req.body;

    if (!carrito || carrito.length === 0 || !total) {
        return res.status(400).json({ message: 'El carrito está vacío.' });
    }

    const client = await db.connect();

    try {
        await client.query('BEGIN'); // Iniciar Transacción (Todo o nada)

        // 1. Preparar datos de fecha para la tabla VENTA (DIA, MES, AO)
        const hoy = new Date();
        const dia = hoy.getDate();
        const mes = hoy.getMonth() + 1; // Los meses en JS van de 0 a 11
        const anio = hoy.getFullYear();

        // 2. Crear el registro en la tabla VENTA
        // (Asumimos ID_BAR = 1 si no viene, pero debería venir del frontend)
        const barberoId = id_bar || 1; 

        const ventaQuery = `
            INSERT INTO VENTA (DIA, MES, AO, Total, ID_BAR)
            VALUES ($1, $2, $3, $4, $5)
            RETURNING ID_VENTA;
        `;
        const ventaRes = await client.query(ventaQuery, [dia, mes, anio, total, barberoId]);
        const idVenta = ventaRes.rows[0].id_venta;

        // 3. Procesar cada producto del carrito
        for (const item of carrito) {
            const { id_prod, cantidad, precio } = item;

            // A. Insertar en detalle_venta
            await client.query(
                'INSERT INTO detalle_venta (ID_VENTA, ID_PROD, CANTIDAD, PRECIO) VALUES ($1, $2, $3, $4)',
                [idVenta, id_prod, cantidad, precio]
            );

            // B. DESCONTAR STOCK del Inventario (Tabla PRODUCTO)
            // Esto es crítico: Restamos la cantidad vendida al stock actual
            await client.query(
                'UPDATE PRODUCTO SET STOCK = STOCK - $1 WHERE id_prod = $2',
                [cantidad, id_prod]
            );
        }

        await client.query('COMMIT'); // Confirmar venta
        res.status(201).json({ message: 'Venta registrada y stock actualizado', id_venta: idVenta });

    } catch (error: any) {
        await client.query('ROLLBACK'); // Cancelar si hay error
        console.error("Error en venta:", error);
        res.status(500).json({ message: 'Error al procesar la venta', error: error.message });
    } finally {
        client.release();
    }
}