import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // MÉTODO GET: Listar PRODUCTOS PARA VENTA (Desde tabla PRODUCTO)
    if (req.method === 'GET') {
        try {
            console.log("📡 Consultando tabla PRODUCTO para la Tienda...");

            // Seleccionamos de la tabla PRODUCTO
            // Hacemos Alias (AS) para que el frontend no se rompa y reciba los nombres que espera
            const query = `
                SELECT 
                    id_prod AS id_insumo,    -- El frontend usa id_insumo
                    nom_prod AS nom_insumo,  -- El frontend usa nom_insumo
                    stock AS stock_bodega,   -- El frontend usa stock_bodega
                    precio_prod AS costo,    -- El frontend usa costo
                    marc_prod,
                    es_insumo
                FROM PRODUCTO
                WHERE stock > 0 
                  AND (es_insumo = false OR es_insumo IS NULL) -- Solo productos de venta
                ORDER BY nom_prod ASC;
            `;
            
            const result = await db.query(query);
            console.log(`✅ Encontrados ${result.rows.length} productos vendibles.`);
            
            return res.status(200).json(result.rows);
            
        } catch (error: any) {
            console.error("❌ Error en API Tienda:", error);
            return res.status(500).json({ message: 'Error interno', error: error.message });
        }
    }

    // El método POST ya no lo usamos aquí porque los productos se crean en el módulo Inventario
}