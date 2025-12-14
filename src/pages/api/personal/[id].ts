// src/pages/api/personal/[id].ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query; // ID del barbero

    // GET: Obtener Perfil + Sus Insumos + Catálogo Disponible
    if (req.method === 'GET') {
        try {
            // 1. Datos del Barbero
            const barberoRes = await db.query('SELECT * FROM BARBER WHERE id_bar = $1', [id]);
            if (barberoRes.rows.length === 0) return res.status(404).json({ message: 'Barbero no encontrado' });

            // 2. Insumos que YA tiene asignados
            const misInsumosRes = await db.query(`
                SELECT ib.id_ib, i.id_insumo, i.nombre, ib.usos_restantes, i.capacidad_total, i.stock_bodega, ib.estado
                FROM INSUMO_BARBERO ib
                JOIN INSUMO i ON ib.id_insumo = i.id_insumo
                WHERE ib.id_bar = $1
                ORDER BY ib.usos_restantes ASC
            `, [id]);

            // 3. Catálogo completo (Para el dropdown de "Agregar Nuevo")
            // Opcional: Podrías filtrar los que ya tiene para no repetir, pero lo haremos en el frontend
            const catalogoRes = await db.query('SELECT * FROM INSUMO ORDER BY nombre');

            res.status(200).json({
                perfil: barberoRes.rows[0],
                insumos: misInsumosRes.rows,
                catalogo: catalogoRes.rows // 🔑 Enviamos el catálogo
            });

        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Error cargando datos' });
        }
    }

    // POST: ASIGNAR NUEVO INSUMO (Primera vez)
    if (req.method === 'POST') {
        const { id_insumo } = req.body;

        const client = await db.connect();
        try {
            await client.query('BEGIN');

            // 1. Verificar Bodega
            const stockCheck = await client.query('SELECT stock_bodega, capacidad_total FROM INSUMO WHERE id_insumo = $1', [id_insumo]);
            const item = stockCheck.rows[0];

            if (item.stock_bodega <= 0) {
                throw new Error('❌ No hay stock en bodega para asignar esto.');
            }

            // 2. Verificar que no lo tenga ya asignado
            const existeCheck = await client.query('SELECT id_ib FROM INSUMO_BARBERO WHERE id_bar = $1 AND id_insumo = $2', [id, id_insumo]);
            if (existeCheck.rows.length > 0) {
                throw new Error('⚠️ Este barbero ya tiene este insumo asignado. Usa el botón de Re-Stock.');
            }

            // 3. Restar 1 de Bodega
            await client.query('UPDATE INSUMO SET stock_bodega = stock_bodega - 1 WHERE id_insumo = $1', [id_insumo]);

            // 4. Crear la asignación (INSERT)
            await client.query(
                "INSERT INTO INSUMO_BARBERO (id_bar, id_insumo, usos_restantes, estado) VALUES ($1, $2, $3, 'En Uso')",
                [id, id_insumo, item.capacidad_total]
            );

            await client.query('COMMIT');
            res.status(201).json({ message: 'Insumo asignado correctamente' });

        } catch (error: any) {
            await client.query('ROLLBACK');
            res.status(400).json({ message: error.message });
        } finally {
            client.release();
        }
    }

    // PUT: RE-STOCK (Rellenar existente) - *Mantenemos tu lógica anterior*
    if (req.method === 'PUT') {
        const { id_ib, id_insumo } = req.body;
        const client = await db.connect();
        try {
            await client.query('BEGIN');
            // Verificar stock
            const stockCheck = await client.query('SELECT stock_bodega, capacidad_total FROM INSUMO WHERE id_insumo = $1', [id_insumo]);
            if (stockCheck.rows[0].stock_bodega <= 0) throw new Error('Sin stock en bodega');
            
            // Restar y Actualizar
            await client.query('UPDATE INSUMO SET stock_bodega = stock_bodega - 1 WHERE id_insumo = $1', [id_insumo]);
            await client.query("UPDATE INSUMO_BARBERO SET usos_restantes = $1, estado = 'En Uso' WHERE id_ib = $2", [stockCheck.rows[0].capacidad_total, id_ib]);
            
            await client.query('COMMIT');
            res.status(200).json({ message: 'Restock exitoso' });
        } catch (error: any) {
            await client.query('ROLLBACK');
            res.status(400).json({ message: error.message });
        } finally { client.release(); }
    }
}