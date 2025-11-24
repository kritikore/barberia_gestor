// src/pages/api/inventario/[id].ts

// 🔑 CORRECCIÓN: Importaciones faltantes
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // Obtenemos el ID del producto desde la URL (ej: /api/inventario/2)
    const { id } = req.query;

    if (!id) {
        return res.status(400).json({ message: 'ID de producto no proporcionado' });
    }

    // --- 1. ELIMINAR PRODUCTO (DELETE) ---
    if (req.method === 'DELETE') {
        try {
            // Importante: Primero eliminamos las referencias en 'detalle_venta'
            await db.query('DELETE FROM detalle_venta WHERE ID_PROD = $1', [id]);
            
            // Ahora eliminamos el producto principal
            const result = await db.query('DELETE FROM PRODUCTO WHERE id_prod = $1 RETURNING *', [id]);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }
            
            return res.status(200).json({ message: 'Producto eliminado', deletedProduct: result.rows[0] });
        
        } catch (error: any) {
            console.error("Error en API al eliminar producto:", error);
            if (error.code === '23503') { // Error de Foreign Key
                 return res.status(409).json({ message: 'Error: El producto no se puede eliminar porque está referenciado en otras tablas.' });
            }
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // --- 2. ACTUALIZAR STOCK (PATCH) ---
    if (req.method === 'PATCH') {
        try {
            const { newStock } = req.body; 

            if (newStock === undefined) {
                return res.status(400).json({ message: 'Nueva cantidad de stock no proporcionada' });
            }
            
            const stockNum = parseInt(newStock, 10);
            if (isNaN(stockNum) || stockNum < 0) {
                return res.status(400).json({ message: 'El stock debe ser un número positivo' });
            }

            const query = `
                UPDATE PRODUCTO
                SET STOCK = $1
                WHERE id_prod = $2
                RETURNING *;
            `;
            const result = await db.query(query, [stockNum, id]);

            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            return res.status(200).json(result.rows[0]);

        } catch (error: any) {
             console.error("Error en API al actualizar stock:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // --- 3. EDITAR PRODUCTO COMPLETO (PUT) ---
    if (req.method === 'PUT') {
        try {
            const { nom_prod, marc_prod, PRECIO_PROD, STOCK } = req.body;

            if (!nom_prod || !marc_prod || !PRECIO_PROD || STOCK === undefined) {
                return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
            }
            
            const query = `
                UPDATE PRODUCTO
                SET nom_prod = $1,
                    marc_prod = $2,
                    PRECIO_PROD = $3,
                    STOCK = $4
                WHERE id_prod = $5
                RETURNING *;
            `;
            const values = [nom_prod, marc_prod, parseFloat(PRECIO_PROD), parseInt(STOCK, 10), id];
            
            const result = await db.query(query, values);
            
            if (result.rowCount === 0) {
                return res.status(404).json({ message: 'Producto no encontrado' });
            }

            return res.status(200).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API al editar producto:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    return res.status(405).json({ message: 'Método no permitido' });
}