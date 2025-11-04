// src/pages/api/inventario/index.ts

// 🔑 CORRECCIÓN: Importaciones que faltaban
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db'; // Asegúrate de que tu conexión a la DB esté en src/lib/db.ts

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // MÉTODO GET: Listar todos los productos (SOLO VENTA)
    if (req.method === 'GET') {
        try {
            // Filtramos para mostrar solo productos de VENTA (es_insumo = false)
            const result = await db.query('SELECT * FROM PRODUCTO WHERE es_insumo = false ORDER BY nom_prod ASC');
            return res.status(200).json(result.rows);
        } catch (error: any) {
             console.error("Error en API al listar productos:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // MÉTODO POST: Crear nuevo producto de VENTA
    if (req.method === 'POST') {
        const { nom_prod, marc_prod, PRECIO_PROD, STOCK } = req.body;
        
        if (!nom_prod || !marc_prod || !PRECIO_PROD || STOCK === undefined) {
             return res.status(400).json({ message: 'Todos los campos son obligatorios.' });
        }
        
        try {
            const query = `
                INSERT INTO PRODUCTO (nom_prod, marc_prod, PRECIO_PROD, STOCK, es_insumo)
                VALUES ($1, $2, $3, $4, false) -- 🔑 es_insumo = false (Venta)
                RETURNING *; 
            `;
            const values = [nom_prod, marc_prod, parseFloat(PRECIO_PROD), parseInt(STOCK, 10)];
            
            const result = await db.query(query, values);
            return res.status(201).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API al crear producto:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // Si es otro método
    return res.status(405).json({ message: 'Método no permitido' });
}