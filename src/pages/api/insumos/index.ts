// src/pages/api/insumos/index.ts
import { NextApiRequest, NextApiResponse } from 'next';
import { db } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    
    // MÉTODO GET: Listar solo INSUMOS
    if (req.method === 'GET') {
        try {
            // 🔑 CORRECCIÓN: Leemos de PRODUCTO donde es_insumo = true
            const query = `
                SELECT id_prod, nom_prod, marc_prod, STOCK
                FROM PRODUCTO
                WHERE es_insumo = true
                ORDER BY STOCK ASC; -- Mostrar los que tienen menos stock primero
            `;
            const result = await db.query(query);
            return res.status(200).json(result.rows);
        } catch (error: any) {
             console.error("Error en API al listar insumos:", error);
            return res.status(500).json({ message: 'Error interno del servidor', error: error.message });
        }
    }

    // MÉTODO POST: Crear nuevo INSUMO
    if (req.method === 'POST') {
        const { nom_prod, marc_prod, STOCK } = req.body; // Insumos no tienen precio de venta

        if (!nom_prod || STOCK === undefined) {
            return res.status(400).json({ message: 'Nombre y Stock son obligatorios.' });
        }

        try {
            const query = `
                INSERT INTO PRODUCTO (nom_prod, marc_prod, PRECIO_PROD, STOCK, es_insumo)
                VALUES ($1, $2, 0.00, $3, true) -- 🔑 CORRECCIÓN: es_insumo = true, Precio 0
                RETURNING *; 
            `;
            const values = [nom_prod, (marc_prod || 'Genérico'), parseInt(STOCK, 10)];
            
            const result = await db.query(query, values);
            return res.status(201).json(result.rows[0]);

        } catch (error: any) {
            console.error("Error en API al crear insumo:", error);
            return res.status(500).json({ message: 'Error al crear insumo', error: error.message });
        }
    }
}