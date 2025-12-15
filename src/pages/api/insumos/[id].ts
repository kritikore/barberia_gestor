import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const { id } = req.query; // ID del Producto

    if (req.method === 'PUT') {
        // Recibimos los datos normales + los nuevos para el historial
        const { stock_bodega, id_bar, cantidad_venta, precio_venta } = req.body;

        try {
            // 1. LÓGICA EXISTENTE: Actualizar Stock (No la tocamos, sigue funcionando igual)
            await db.query(`
                UPDATE PRODUCTO 
                SET stock = $1 
                WHERE id_prod = $2
            `, [stock_bodega, id]);

            // 2. LÓGICA NUEVA: Guardar en el Historial (Bitácora)
            // Solo si nos mandan datos de venta (para no romper ediciones normales de inventario)
            if (cantidad_venta && precio_venta) {
                const total = Number(cantidad_venta) * Number(precio_venta);
                
                await db.query(`
                    INSERT INTO venta_producto (id_prod, id_bar, cantidad, total)
                    VALUES ($1, $2, $3, $4)
                `, [id, id_bar || null, cantidad_venta, total]);
                
                console.log(`📝 Venta registrada: Prod ${id} por Barbero ${id_bar}`);
            }

            return res.status(200).json({ message: 'Stock actualizado y venta registrada' });

        } catch (error: any) {
            console.error("❌ Error al actualizar/vender:", error);
            return res.status(500).json({ message: 'Error interno', error: error.message });
        }
    }
}